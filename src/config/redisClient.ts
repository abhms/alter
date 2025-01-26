import { createClient } from "redis";

export async function redisClient() {
  const client = createClient({
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 12709,
    },
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();
    console.log("Connected to Redis");

    return client; 
  } catch (err) {
    console.error("Error interacting with Redis:", err);
    throw err; 
  }
}
