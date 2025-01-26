import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import main from "./modal/db";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.route";
import urlRoutes from "./routes/url.routes";
import analyticsRoutesfrom from "./routes/analytics.routes";
import compression from "compression";
import  {redisClient}  from "./config/redisClient";
import { swaggerUi, swaggerSpecs } from './config/swagger';
dotenv.config();
main();
redisClient();
const app = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);

app.use(express.json({ limit: "50mb" }));
function isJsonSyntaxError(
  err: any
): err is SyntaxError & { status?: number; body?: unknown } {
  return err instanceof SyntaxError && "status" in err && "body" in err;
}

app.use((err: any, req: Request, res: Response, next: any) => {
  if (isJsonSyntaxError(err) && err.status === 400) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON format",
    });
  }
  next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(compression());
app.use("/auth", authRouter);
app.use("/api", urlRoutes);
app.use("/api/analytics", analyticsRoutesfrom);

app.get("/", async (req: Request, res: Response) => {
  res.send("alter Backend.");
});
export default app;
server.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
