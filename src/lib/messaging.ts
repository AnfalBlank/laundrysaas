/**
 * Unified messaging abstraction layer.
 * Supports WhatsApp (Fonnte) and Telegram Bot API.
 * Channel is determined by tenant's `messagingChannel` setting.
 */

export type MessagingChannel = "whatsapp" | "telegram";

export interface SendMessageParams {
  to: string; // phone number (WA) or chat_id (Telegram)
  text: string;
  channel: MessagingChannel;
  // Channel-specific credentials
  whatsappToken?: string;
  telegramBotToken?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a message via the configured channel.
 */
export async function sendMessage(params: SendMessageParams): Promise<SendResult> {
  if (params.channel === "telegram") {
    return sendTelegram(params);
  }
  return sendWhatsApp(params);
}

/**
 * Send via WhatsApp (Fonnte API).
 */
async function sendWhatsApp(params: SendMessageParams): Promise<SendResult> {
  const token = params.whatsappToken;
  if (!token) {
    return { success: false, error: "WhatsApp token not configured" };
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: params.to,
        message: params.text,
      }),
    });

    const data = await res.json();
    if (data.status) {
      return { success: true, messageId: data.id };
    }
    return { success: false, error: data.reason || "Unknown error" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Send via Telegram Bot API.
 */
async function sendTelegram(params: SendMessageParams): Promise<SendResult> {
  const token = params.telegramBotToken;
  if (!token) {
    return { success: false, error: "Telegram bot token not configured" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.to,
          text: params.text,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await res.json();
    if (data.ok) {
      return { success: true, messageId: String(data.result?.message_id) };
    }
    return { success: false, error: data.description || "Unknown error" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Channel display metadata.
 */
export const CHANNEL_META: Record<
  MessagingChannel,
  { label: string; menuLabel: string; color: string; provider: string }
> = {
  whatsapp: {
    label: "WhatsApp",
    menuLabel: "WhatsApp",
    color: "#25d366",
    provider: "Fonnte",
  },
  telegram: {
    label: "Telegram",
    menuLabel: "Telegram",
    color: "#2563eb",
    provider: "Telegram Bot API",
  },
};
