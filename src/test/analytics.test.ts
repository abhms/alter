import request from "supertest";
import { describe, expect, it, jest } from "@jest/globals";
import app from "../index";
import { redisClient } from "../config/redisClient";
import Url from "../modal/Url";
import RedirectAnalytics from "../modal/RedirectAnalytics";

jest.mock("../config/redisClient", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("../modal/Url");
jest.mock("../modal/RedirectAnalytics");

describe("Analytics Controller", () => {
  describe("GET /analytics/:alias", () => {
    it("should return cached analytics if available", async () => {
      const alias = "short-url-123";
      const cachedAnalytics = JSON.stringify({
        totalClicks: 100,
        uniqueUsers: 50,
      });
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
      redisClient.get.mockResolvedValueOnce(null);
      Url.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/analytics/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Short URL not found");
    });

    it("should return analytics and cache the result if not cached", async () => {
      const alias = "short-url-123";
      redisClient.get.mockResolvedValueOnce(null);
      const url = { shortUrl: `http://localhost/${alias}` };
      Url.findOne.mockResolvedValueOnce(url);

      const analyticsData = {
        totalClicks: 200,
        uniqueUsers: 100,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
      const aggregateMock = jest.fn().mockResolvedValueOnce(analyticsData);
      RedirectAnalytics.aggregate.mockImplementation(aggregateMock);

      const response = await request(app)
        .get(`/analytics/${alias}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(200);
      expect(response.body.uniqueUsers).toBe(100);
      expect(redisClient.set).toHaveBeenCalledWith(
        `analytics:${alias}`,
        JSON.stringify(analyticsData),
        { EX: 300 }
      );
    });

    it("should return 401 if Authorization token is missing", async () => {
      const alias = "short-url-123";

      const response = await request(app)
        .get(`/analytics/${alias}`);

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
      redisClient.get.mockResolvedValueOnce(null);
      Url.find.mockResolvedValueOnce([]);

      const response = await request(app)
        .get(`/analytics/topic/${topic}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No URLs found for this topic");
    });

    it("should return topic analytics and cache the result if not cached", async () => {
      const topic = "technology";
      redisClient.get.mockResolvedValueOnce(null);
      const urls = [{ shortUrl: "short-url-123" }];
      Url.find.mockResolvedValueOnce(urls);

      const analyticsData = {
        totalClicks: 500,
        uniqueUsers: 200,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
      const aggregateMock = jest.fn().mockResolvedValueOnce(analyticsData);
      RedirectAnalytics.aggregate.mockImplementation(aggregateMock);

      const response = await request(app)
        .get(`/analytics/topic/${topic}`)
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(500);
      expect(response.body.uniqueUsers).toBe(200);
      expect(redisClient.set).toHaveBeenCalledWith(
        `topicAnalytics:${topic}`,
        JSON.stringify(analyticsData),
        { EX: 300 }
      );
    });

    it("should return 401 if Authorization token is missing", async () => {
      const topic = "technology";

      const response = await request(app)
        .get(`/analytics/topic/${topic}`);

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
      redisClient.get.mockResolvedValueOnce(null);
      Url.find.mockResolvedValueOnce([]);

      const response = await request(app)
        .get("/analytics/overall")
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No URLs found for the user");
    });

    it("should return overall analytics and cache the result if not cached", async () => {
      const userId = "user123";
      redisClient.get.mockResolvedValueOnce(null);
      const userUrls = [{ shortUrl: "short-url-123" }];
      Url.find.mockResolvedValueOnce(userUrls);

      const analyticsData = {
        totalUrls: 1,
        totalClicks: 300,
        uniqueUsers: 150,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
      const findMock = jest.fn().mockResolvedValueOnce(analyticsData);
      RedirectAnalytics.find.mockImplementation(findMock);

      const response = await request(app)
        .get("/analytics/overall")
        .set("Authorization", "Bearer valid-jwt-token");

      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBe(300);
      expect(response.body.uniqueUsers).toBe(150);
      expect(redisClient.set).toHaveBeenCalledWith(
        `overallAnalytics:${userId}`,
        JSON.stringify(analyticsData),
        { EX: 300 }
      );
    });

    it("should return 401 if Authorization token is missing", async () => {
      const response = await request(app)
        .get("/analytics/overall");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token is required");
    });
  });
});
