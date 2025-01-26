import { Request, Response, NextFunction } from "express";
import shortid from "shortid";
import Url from "../modal/Url";
import RedirectAnalytics from "../modal/RedirectAnalytics";
import { getGeolocation } from "../config/getGeolocation";
import { redisClient } from "../config/redisClient";
export const createShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const { id } = req.user as { id: string };

    if (!longUrl) {
      return res.status(400).json({ message: "longUrl is required" });
    }

    const alias = customAlias || shortid.generate();

    const existingUrl = await Url.findOne({
      $or: [{ shortUrl: alias }, { customAlias: alias }],
    });

    if (existingUrl) {
      return res
        .status(400)
        .json({ message: "Alias already in use. Please choose another one." });
    }

    const protocol = req.protocol;
    const host = req.get("host");
    const shortUrl = `${protocol}://${host}/${alias}`;

    const newUrl = new Url({
      createdBy: id,
      longUrl,
      shortUrl,
      customAlias: alias,
      topic,
    });

    await newUrl.save();
    const client = await redisClient();
    await client.set(alias, longUrl, { EX: 60 * 60 });
    res.status(201).json({
      message: "Short URL created successfully",
      data: {
        shortUrl,
        createdAt: newUrl.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const redirectToOriginalUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { alias } = req.params;
    const { id } = req.user as { id: string };

    const client = await redisClient();

    const cachedLongUrl = await client.get(alias);
    if (cachedLongUrl) {
      console.log("Cache hit for alias:", alias);

      const userAgent = req.headers["user-agent"] || "Unknown";
      const ipAddress = req.ip;
      const location = getGeolocation(ipAddress || "");
      const protocol = req.protocol;
      const host = req.get("host");
      const shortUrl = `${protocol}://${host}/${alias}`;

      const newRedirect = new RedirectAnalytics({
        userId: id,
        shortUrl,
        userAgent: userAgent.toString(),
        ipAddress: ipAddress,
        location,
      });

      await newRedirect.save();

      return res.redirect(cachedLongUrl);
    }

    console.log("Cache miss for alias:", alias);

    const url = await Url.findOne({
      $or: [{ shortUrl: alias }, { customAlias: alias }],
    });

    if (!url) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    await client.set(alias, url.longUrl, { EX: 60 * 60 });

    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip;
    const location = getGeolocation(ipAddress || "");
    const protocol = req.protocol;
    const host = req.get("host");
    const shortUrl = `${protocol}://${host}/${alias}`;

    const newRedirect = new RedirectAnalytics({
      userId: id,
      shortUrl,
      userAgent: userAgent.toString(),
      ipAddress: ipAddress,
      location,
    });

    await newRedirect.save();

    return res.redirect(url.longUrl);
  } catch (error) {
    next(error);
  }
};
