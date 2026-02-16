import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { smsConfigTable } from "@/db/schema";
import { decrypt } from "./encrypt";
import { toGatewayEmail, parseLegacyRecipient } from "./smsGateways";

export interface SendAlertOptions {
  deviceName?: string;
  propertyName?: string;
  value?: unknown;
}

const HARDCODED_ALERT_MESSAGE = "Alert: {deviceName} - {propertyName} is out of range (value: {value}).";

function formatMessage(template: string, opts: SendAlertOptions): string {
  return template
    .replace(/\{deviceName\}/g, String(opts.deviceName ?? "Unknown device"))
    .replace(/\{propertyName\}/g, String(opts.propertyName ?? "Unknown property"))
    .replace(/\{value\}/g, String(opts.value ?? ""));
}

/**
 * Load SMS config from DB. Returns null if sender/password or recipients not configured.
 */
export async function getSmsConfigForSend() {
  const row = await db.query.smsConfigTable.findFirst();
  if (!row || !row.senderEmail || !row.appPasswordEncrypted) return null;
  const appPassword = decrypt(row.appPasswordEncrypted);
  if (!appPassword) return null;

  let recipients: { phoneNumber: string; carrier: string }[] = [];
  try {
    const parsed = JSON.parse(row.recipientsJson || "[]");
    if (Array.isArray(parsed)) recipients = parsed;
  } catch {
    // ignore
  }
  if (recipients.length === 0 && row.recipient) {
    const one = parseLegacyRecipient(row.recipient);
    if (one) recipients = [one];
  }

  const recipientEmails = recipients
    .map((r) => toGatewayEmail(r.phoneNumber, r.carrier))
    .filter(Boolean);
  if (recipientEmails.length === 0) return null;

  return {
    senderEmail: row.senderEmail,
    appPassword,
    recipientEmails,
  };
}

/**
 * Send SMS via Gmail SMTP to all configured recipients.
 * Uses hardcoded message. Only call from server.
 */
export async function sendAlertSms(messageOverride?: string, opts: SendAlertOptions = {}): Promise<{ success: boolean; error?: string }> {
  const config = await getSmsConfigForSend();
  if (!config) return { success: false, error: "SMS not configured. Set sender, app password, and at least one recipient in Settings." };

  const body = messageOverride ?? formatMessage(HARDCODED_ALERT_MESSAGE, opts);

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
      to: config.recipientEmails,
      subject: "Website Alert",
      text: body,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
