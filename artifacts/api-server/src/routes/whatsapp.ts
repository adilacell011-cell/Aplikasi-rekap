import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

// Fonnte WhatsApp API proxy
router.post("/whatsapp/send", requireAuth, async (req, res) => {
  const { target, message } = req.body ?? {};
  const apiKey = process.env.FONNTE_API_KEY;

  // Clean target: remove any non-digit characters except comma
  const cleanTarget = target ? String(target).replace(/[^\d,]/g, "") : "";

  if (!apiKey) {
    req.log.error("FONNTE_API_KEY is missing in environment variables");
    return res
      .status(500)
      .json({ error: "FONNTE_API_KEY is not configured" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: apiKey.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: cleanTarget,
        message,
        countryCode: "62", // Default to Indonesia
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      req.log.error({ status: response.status, data }, "Fonnte API error");
      return res.status(response.status).json({
        error: "Failed to send WhatsApp message",
        details: data,
        success: false,
      });
    }

    return res.status(200).json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    req.log.error({ err: message }, "Fonnte API request failed");
    return res.status(500).json({
      error: "Failed to send WhatsApp message",
      details: message,
      success: false,
    });
  }
});

export default router;
