import "server-only";
import { getThing } from "@/lib/arduinoInit";
import { isPropertyInAlert } from "@/lib/alertRanges";
import { getPropertyThreshold, hasSentAlertSms, recordAlertSmsSent, clearAlertSmsRecord } from "@/app/actions/settings";
import { sendAlertSms } from "@/lib/sendAlertSms";

export type PropertyAlertState = { propertyId: string; inAlert: boolean; name?: string };

/**
 * Evaluate alerts for one thing's properties. Optionally send SMS for new alerts.
 * Returns list of { propertyId, inAlert } and total alert count.
 */
export async function evaluateThingAlerts(
  thingId: string,
  deviceName: string,
  options: { sendSmsForNewAlerts?: boolean } = {}
): Promise<{ alerts: PropertyAlertState[]; alertCount: number }> {
  let thing: { id: string; name?: string; properties?: any[] };
  try {
    thing = await getThing(thingId);
  } catch {
    return { alerts: [], alertCount: 0 };
  }

  const properties = thing.properties ?? [];
  const alerts: PropertyAlertState[] = [];
  let alertCount = 0;

  for (const prop of properties) {
    const type = (prop.type ?? "").toUpperCase();
    if (type !== "INT" && type !== "FLOAT") continue;

    const threshold = await getPropertyThreshold(thingId, prop.id);
    const inAlert = isPropertyInAlert(
      { type: prop.type, last_value: prop.last_value },
      threshold ?? undefined
    );

    if (inAlert) {
      alertCount++;
      alerts.push({ propertyId: prop.id, inAlert: true, name: prop.name ?? prop.variable_name });

      if (options.sendSmsForNewAlerts) {
        const sent = await hasSentAlertSms(thingId, prop.id);
        if (!sent) {
          const result = await sendAlertSms(undefined, {
            deviceName,
            propertyName: prop.name ?? prop.variable_name ?? prop.id,
            value: prop.last_value,
          });
          if (result.success) await recordAlertSmsSent(thingId, prop.id);
        }
      }
    } else {
      if (options.sendSmsForNewAlerts) await clearAlertSmsRecord(thingId, prop.id);
      alerts.push({ propertyId: prop.id, inAlert: false, name: prop.name ?? prop.variable_name });
    }
  }

  return { alerts, alertCount };
}
