import type { IncomingMessage, ServerResponse } from "http";

export default function handler(
  req: IncomingMessage,
  res: ServerResponse & { json: (data: any) => void; status: (code: number) => any }
) {
  if (req.method !== "GET") {
    if (typeof res.status === "function") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const data = {
    status: "ok",
    aiEnabled: process.env.AI_FEATURE_ENABLED === "true",
  };

  if (typeof res.status === "function") {
    return res.status(200).json(data);
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
