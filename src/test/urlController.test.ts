import { describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import app from "../index";
import { redisClient } from "../config/redisClient";
import Url from "../modal/Url";
import RedirectAnalytics from "../modal/RedirectAnalytics";

jest.mock("../config/redisClient", () => ({
  redisClient: jest.fn().mockReturnValue({
    get: jest.fn(),

    set: jest.fn(),
  }),
}));
jest.mock("../modal/Url");
jest.mock("../modal/RedirectAnalytics");

describe("URL Shortener Controller", () => {
  describe("POST /shorten", () => {
    const mockUser = { id: "user123" };

    it("should return 400 if longUrl is missing", async () => {
      const response = await request(app)
        .post("/shorten")
        .set("Authorization", "Bearer valid-jwt-token")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("longUrl is required");
    });

    it("should return 400 if alias is already in use", async () => {
      (Url.findOne as jest.Mock<any>).mockResolvedValueOnce({
        shortUrl: "short-url-123",
      });

      const response = await request(app)
        .post("/shorten")
        .set("Authorization", "Bearer valid-jwt-token")
        .send({
          longUrl: "https://example.com",
          customAlias: "short-url-123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Alias already in use. Please choose another one."
      );
    });

    it("should return 201 when short URL is created successfully", async () => {
      (Url.findOne as jest.Mock<any>).mockResolvedValueOnce(null);
      //@ts-ignore
      (Url.prototype.save as jest.Mock).mockResolvedValueOnce({
        createdAt: new Date(),
      } as unknown as typeof Url);

      const response = await request(app)
        .post("/shorten")
        .set("Authorization", "Bearer valid-jwt-token")
        .send({
          longUrl: "https://example.com",
          customAlias: "my-short-url",
          topic: "technology",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Short URL created successfully");
      expect(response.body.data.shortUrl).toContain("my-short-url");
    });

    it("should return 400 if longUrl is not a valid URL", async () => {
      const response = await request(app)
        .post("/shorten")
        .set("Authorization", "Bearer valid-jwt-token")
        .send({
          longUrl: "invalid-url",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid long URL format");
    });

    it("should return 401 if Authorization token is missing", async () => {
      const response = await request(app).post("/shorten").send({
        longUrl: "https://example.com",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token is required");
    });
  });

  describe("GET /:alias", () => {
    it("should return a redirect if the URL is found in Redis (cache hit)", async () => {
      const alias = "my-short-url";

      (redisClient as jest.Mock).mockReturnValueOnce({
        //@ts-ignore
        get: jest.fn().mockResolvedValue("https://example.com"),
      });

      const response = await request(app)
        .get(`/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("https://example.com");
    });

    it("should return 404 if the alias is not found in the database", async () => {
      const alias = "non-existing-alias";

      (redisClient as jest.Mock).mockReturnValueOnce({
        //@ts-ignore
        get: jest.fn().mockResolvedValueOnce(null),
      });
      //@ts-ignore
      (Url.findOne as jest.Mock<any, any>).mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Short URL not found");
    });

    it("should return a redirect if the URL is found in the database (cache miss)", async () => {
      const alias = "my-short-url";

      (redisClient as jest.Mock).mockReturnValueOnce({
        //@ts-ignore
        get: jest.fn().mockResolvedValueOnce(null),
      });

      //@ts-ignore
      (Url.findOne as jest.Mock).mockResolvedValueOnce({
        longUrl: "https://example.com",
      });

      const response = await request(app)
        .get(`/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("https://example.com");
    });

    it("should save to Redis if URL is fetched from the database and cache miss occurs", async () => {
      const alias = "my-short-url";
      const longUrl = "https://example.com";

      (redisClient as jest.Mock).mockReturnValueOnce({
        //@ts-ignore
        get: jest.fn().mockResolvedValueOnce(null),
        set: jest.fn(),
      });

      //@ts-ignore
      (Url.findOne as jest.Mock).mockResolvedValueOnce({ longUrl });

      const response = await request(app)
        .get(`/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(longUrl);
      expect((await redisClient()).set).toHaveBeenCalledWith(alias, longUrl);
    });

    it("should return 401 if Authorization token is invalid", async () => {
      const alias = "my-short-url";

      const response = await request(app)
        .get(`/${alias}`)
        .set("Authorization", "Bearer invalid-jwt-token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });
});
