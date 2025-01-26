import request from "supertest";
import { describe, expect, it, jest } from "@jest/globals";
import app from "../index";
import { redisClient } from "../config/redisClient";
import Url from "../modal/Url";
import RedirectAnalytics from "../modal/RedirectAnalytics";

// Mocking Redis Client
import { RedisClientType } from "@redis/client"; // Adjust to correct import if needed

jest.mock("../config/redisClient", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

// Mocking the models
jest.mock("../modal/Url", () => ({
  findOne: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../modal/RedirectAnalytics", () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
}));

describe("Analytics Controller", () => {
  describe("GET /analytics/:alias", () => {
    it("should return cached analytics if available", async () => {
      const alias = "short-url-123";
      const cachedAnalytics = JSON.stringify({
        totalClicks: 100,
        uniqueUsers: 50,
      });
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(cachedAnalytics);

      const response = await request(app)
        .get(`/analytics/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(100);
      expect(response.body.uniqueUsers).toBe(50);
    });

    it("should return 404 if URL not found in database", async () => {
      const alias = "short-url-123";
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(null);
      //@ts-ignore

      Url.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/analytics/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Short URL not found");
    });

    it("should return analytics and cache the result if not cached", async () => {
      const alias = "short-url-123";
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(null);
      const url = { shortUrl: `http://localhost/${alias}` };
      //@ts-ignore

      Url.findOne.mockResolvedValueOnce(url);

      const analyticsData = {
        totalClicks: 200,
        uniqueUsers: 100,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
      //@ts-ignore

      RedirectAnalytics.aggregate.mockResolvedValueOnce(analyticsData);

      const response = await request(app)
        .get(`/analytics/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(200);
      expect(response.body.uniqueUsers).toBe(100);
      //@ts-ignore

      expect(redisClient.set).toHaveBeenCalledWith(
        `analytics:${alias}`,
        JSON.stringify(analyticsData),
        { EX: 300 }
      );
    });

    it("should return 401 if Authorization token is missing", async () => {
      const alias = "short-url-123";

      const response = await request(app).get(`/analytics/${alias}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token is required");
    });

    it("should return 401 if Authorization token is invalid", async () => {
      const alias = "short-url-123";

      const response = await request(app)
        .get(`/analytics/${alias}`)
        .set("Authorization", "Bearer invalid-jwt-token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("GET /analytics/topic/:topic", () => {
    it("should return cached topic analytics if available", async () => {
      const topic = "technology";
      const cachedAnalytics = JSON.stringify({
        totalClicks: 1000,
        uniqueUsers: 500,
      });
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(cachedAnalytics);

      const response = await request(app)
        .get(`/analytics/topic/${topic}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(1000);
      expect(response.body.uniqueUsers).toBe(500);
    });

    it("should return 404 if no URLs found for topic", async () => {
      const topic = "technology";
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(null);
      //@ts-ignore

      Url.find.mockResolvedValueOnce([]);

      const response = await request(app)
        .get(`/analytics/topic/${topic}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No URLs found for this topic");
    });

    it("should return topic analytics and cache the result if not cached", async () => {
      const topic = "technology";
      //@ts-ignore
      redisClient.get.mockResolvedValueOnce(null);
      const urls = [{ shortUrl: "short-url-123" }];
      //@ts-ignore

      Url.find.mockResolvedValueOnce(urls);

      const analyticsData = {
        totalClicks: 500,
        uniqueUsers: 200,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
      //@ts-ignore

      RedirectAnalytics.aggregate.mockResolvedValueOnce(analyticsData);

      const response = await request(app)
        .get(`/analytics/topic/${topic}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(500);
      expect(response.body.uniqueUsers).toBe(200);
      //@ts-ignore

      expect(redisClient.set).toHaveBeenCalledWith(
        `topicAnalytics:${topic}`,
        JSON.stringify(analyticsData),
        { EX: 300 }
      );
    });

    it("should return 401 if Authorization token is missing", async () => {
      const topic = "technology";

      const response = await request(app).get(`/analytics/topic/${topic}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token is required");
    });
  });

  describe("GET /analytics/overall", () => {
    it("should return cached overall analytics if available", async () => {
      const userId = "user123";
      const cachedAnalytics = JSON.stringify({
        totalClicks: 1000,
        uniqueUsers: 500,
      });
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(cachedAnalytics);

      const response = await request(app)
        .get("/analytics/overall")
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(1000);
      expect(response.body.uniqueUsers).toBe(500);
    });

    it("should return 404 if no URLs found for the user", async () => {
      const userId = "user123";
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(null);
      //@ts-ignore

      Url.find.mockResolvedValueOnce([]);

      const response = await request(app)
        .get("/analytics/overall")
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No URLs found for the user");
    });

    it("should return overall analytics and cache the result if not cached", async () => {
      const userId = "user123";
      //@ts-ignore

      redisClient.get.mockResolvedValueOnce(null);
      const userUrls = [{ shortUrl: "short-url-123" }];
      //@ts-ignore

      Url.find.mockResolvedValueOnce(userUrls);

      const analyticsData = {
        totalUrls: 1,
        totalClicks: 300,
        uniqueUsers: 150,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
      //@ts-ignore

      RedirectAnalytics.find.mockResolvedValueOnce(analyticsData);

      const response = await request(app)
        .get("/analytics/overall")
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(300);
      expect(response.body.uniqueUsers).toBe(150);
      //@ts-ignore

      expect(redisClient.set).toHaveBeenCalledWith(
        `overallAnalytics:${userId}`,
        JSON.stringify(analyticsData),
        { EX: 300 }
      );
    });

    it("should return 401 if Authorization token is missing", async () => {
      const response = await request(app).get("/analytics/overall");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token is required");
    });
  });
});
