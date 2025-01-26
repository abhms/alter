import { Request, Response, NextFunction } from "express";
import Url from "../modal/Url";
import RedirectAnalytics from "../modal/RedirectAnalytics";
import { redisClient } from "../config/redisClient";
export const getAnalytics = async (req: Request, res: Response) => {
  const { alias } = req.params;

  try {
    console.log(alias, "alias");
    const protocol = req.protocol;
    const host = req.get("host");
    const shortUrl = `${protocol}://${host}/${alias}`;
    const client = await redisClient();
    const cachedAnalytics = await client.get(`analytics:${alias}`);
    if (cachedAnalytics) {
      console.log("Cache hit for analytics:", alias);
      return res.status(200).json(JSON.parse(cachedAnalytics));
    }
    console.log("Cache miss for analytics:", alias);

    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    const analytics = await RedirectAnalytics.aggregate([
      { $match: { shortUrl } },

      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          clicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          clicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
      { $sort: { date: -1 } },
      { $limit: 7 },
    ]);
    const osAnalytics = await RedirectAnalytics.aggregate([
      { $match: { shortUrl } },
      {
        $group: {
          _id: "$userAgent",
          uniqueClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          osName: "$_id",
          uniqueClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
    ]);

    const deviceAnalytics = await RedirectAnalytics.aggregate([
      { $match: { shortUrl } },
      {
        $group: {
          _id: "$deviceType",
          uniqueClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          deviceName: "$_id",
          uniqueClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
    ]);

    const totalClicks = await RedirectAnalytics.countDocuments({ shortUrl });
    const uniqueUsers = await RedirectAnalytics.distinct("userId", { shortUrl });

    const responseData = {
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: analytics,
      osType: osAnalytics,
      deviceType: deviceAnalytics,
    };
    await client.set(`analytics:${alias}`, JSON.stringify(responseData), { EX: 300 });
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

export const getTopicAnalytics = async (req: Request, res: Response) => {
  const { topic } = req.params;

  try {
    const client = await redisClient();
    const cachedAnalytics = await client.get(`topicAnalytics:${topic}`);
    if (cachedAnalytics) {
      console.log("Cache hit for topic analytics:", topic);
      return res.status(200).json(JSON.parse(cachedAnalytics));
    }
    console.log("Cache miss for topic analytics:", topic);
    const urls = await Url.find({ topic });
    if (!urls || urls.length === 0) {
      return res.status(404).json({ message: "No URLs found for this topic" });
    }

    const shortUrls = urls.map((url) => url.shortUrl);

    const analyticsByDate = await RedirectAnalytics.aggregate([
      { $match: { shortUrl: { $in: shortUrls } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          clicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          clicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
      { $sort: { date: -1 } },
    ]);

    const totalClicks = await RedirectAnalytics.countDocuments({
      shortUrl: { $in: shortUrls },
    });
    const uniqueUsers = await RedirectAnalytics.distinct("userId", {
      shortUrl: { $in: shortUrls },
    });

    const urlAnalytics = await Promise.all(
      urls.map(async (url) => {
        const clicks = await RedirectAnalytics.countDocuments({
          shortUrl: url.shortUrl,
        });
        const unique = await RedirectAnalytics.distinct("userId", {
          shortUrl: url.shortUrl,
        });
        return {
          shortUrl: url.shortUrl,
          totalClicks: clicks,
          uniqueUsers: unique.length,
        };
      })
    );

    const responseData = {
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: analyticsByDate,
      urls: urlAnalytics,
    };
    await client.set(`topicAnalytics:${topic}`, JSON.stringify(responseData), { EX: 300 });
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching topic analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

export const getOverallAnalytics = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as { id: string };
    const client = await redisClient();
    const cachedAnalytics = await client.get(`overallAnalytics:${userId}`);
    if (cachedAnalytics) {
      console.log("Cache hit for overall analytics:", userId);
      return res.status(200).json(JSON.parse(cachedAnalytics));
    }
    console.log("Cache miss for overall analytics:", userId);

    const userUrls = await Url.find({ createdBy: userId });
    if (!userUrls.length) {
      return res.status(404).json({ message: "No URLs found for the user" });
    }

    const shortUrls = userUrls.map((url) => url.shortUrl);
    const totalUrls = userUrls.length;

    const analytics = await RedirectAnalytics.find({
      shortUrl: { $in: shortUrls },
    });

    const totalClicks = analytics.length;
    const uniqueUsers = new Set(analytics.map((a) => a.userId.toString())).size;

    const clicksByDate = analytics.reduce((acc, curr) => {
      const date = curr.timestamp.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const clicksByDateArray = Object.entries(clicksByDate)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    const osType = analytics.reduce((acc, curr) => {
      const osName = curr.userAgent;
      if (!acc[osName])
        acc[osName] = { osName, uniqueClicks: 0, uniqueUsers: new Set() };
      acc[osName].uniqueClicks += 1;
      acc[osName].uniqueUsers.add(curr.userId.toString());
      return acc;
    }, {} as Record<string, { osName: string; uniqueClicks: number; uniqueUsers: Set<string> }>);
    const osTypeArray = Object.values(osType).map((os) => ({
      osName: os.osName,
      uniqueClicks: os.uniqueClicks,
      uniqueUsers: os.uniqueUsers.size,
    }));

    const deviceType = analytics.reduce((acc, curr) => {
      const deviceName = curr.userAgent.includes("Mobile")
        ? "Mobile"
        : "Desktop";
      if (!acc[deviceName])
        acc[deviceName] = {
          deviceName,
          uniqueClicks: 0,
          uniqueUsers: new Set(),
        };
      acc[deviceName].uniqueClicks += 1;
      acc[deviceName].uniqueUsers.add(curr.userId.toString());
      return acc;
    }, {} as Record<string, { deviceName: string; uniqueClicks: number; uniqueUsers: Set<string> }>);
    const deviceTypeArray = Object.values(deviceType).map((device) => ({
      deviceName: device.deviceName,
      uniqueClicks: device.uniqueClicks,
      uniqueUsers: device.uniqueUsers.size,
    }));

    const responseData = {
      totalUrls,
      totalClicks,
      uniqueUsers,
      clicksByDate: clicksByDateArray,
      osType: osTypeArray,
      deviceType: deviceTypeArray,
    };
    await client.set(`overallAnalytics:${userId}`, JSON.stringify(responseData), { EX: 300 });
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching overall analytics:", error);
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
