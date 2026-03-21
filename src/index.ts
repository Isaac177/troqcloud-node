import express, { Request, Response } from "express";

const app = express();
const PORT = parseInt(process.env.PORT ?? "8080", 10);

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "node-hello", version: "1.0.0" });
});

app.get("/ready", (_req: Request, res: Response ) => {
  res.json({ status: "ok", message: "Hey, I'm aline, you know!!!!! Idiot"})
})

app.get("/health", (_req: Request, res: Response) => {
  res.json({ healthy: true });
});

app.listen(PORT, () => {
  console.log(`node-hello listening on port ${PORT}`);
});
