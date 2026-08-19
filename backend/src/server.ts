import express from "express";
import cors from "cors";
import { config } from "./lib/config.js";
import healthRoutes from "./routes/health.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );

  app.use(express.json());

  app.use("/api", healthRoutes);
  app.use("/api/conversations", conversationRoutes);

  app.use(errorMiddleware);

  return app;
}

export function startServer() {
  const app = createApp();
  const PORT = config.port || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend Express server listening on http://localhost:${PORT}`);
  });

  return app;
}

startServer();
