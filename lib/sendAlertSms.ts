import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { smsConfigTable } from "@/db/schema";
import { decrypt } from "./encrypt";

export interface SendAlertOptions {
  deviceName?: string;
  propertyName?: string;
  value?: unknown;
}

/**
 * Replaces placeholders in message: {deviceName}, {propertyName}, {value}
 */
function formatMessage(template: string, opts: SendAlertOptions): string {
  return template
    .replace(/\{deviceName\}/g, String(opts.deviceName ?? "Unknown device"))
    .replace(/\{propertyName\}/g, String(opts.propertyName ?? "Unknown property"))
    .replace(/\{value\}/g, String(opts.value ?? ""));
}

/**
 * Load SMS config from DB (first row). Returns null if not configured.
 */
export async function getSmsConfigForSend() {
  const row = await db.query.smsConfigTable.findFirst();
  if (!row || !row.senderEmail || !row.appPasswordEncrypted || !row.recipient) return null;
  const appPassword = decrypt(row.appPasswordEncrypted);
  if (!appPassword) return null;
  return {
    senderEmail: row.senderEmail,
    appPassword,
    recipient: row.recipient,
    alertMessage: row.alertMessage || "Alert: A PLC property is out of range.",
  };
}

/**
 * Send SMS via Gmail SMTP to the configured recipient (e.g. T-Mobile gateway).
 * Uses config from DB. Only call from server.
 */
export async function sendAlertSms(messageOverride?: string, opts: SendAlertOptions = {}): Promise<{ success: boolean; error?: string }> {
  const config = await getSmsConfigForSend();
  if (!config) return { success: false, error: "SMS not configured. Set sender, app password, and recipient in Settings." };

  const body = messageOverride ?? formatMessage(config.alertMessage, opts);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.senderEmail,
        pass: config.appPassword,
      },
    });
    await transporter.sendMail({
      from: config.senderEmail,
      to: config.recipient,
      subject: "Website Alert",
      text: body,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
