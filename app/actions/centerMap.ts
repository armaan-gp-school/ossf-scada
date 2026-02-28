"use server";

import { db } from "@/db";
import { centerMapAssignmentsTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getDevices } from "@/lib/arduinoInit";
import { CENTER_MAP_KEYS, isCenterMapKey } from "@/lib/centerMapLayout";

export async function getCenterMapAssignments(): Promise<Record<string, string | null>> {
  const rows = await db.select().from(centerMapAssignmentsTable);
  const map: Record<string, string | null> = {};
  for (const key of CENTER_MAP_KEYS) {
    map[key] = null;
  }
  for (const row of rows) {
    if (isCenterMapKey(row.systemKey)) {
      map[row.systemKey] = row.deviceId ?? null;
    }
  }
  return map;
}

export async function setCenterMapAssignment(
  systemKey: string,
  deviceId: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!isCenterMapKey(systemKey)) {
      return { ok: false, error: "Invalid system key." };
    }

    const nextDeviceId = deviceId?.trim() ? deviceId : null;
    if (nextDeviceId) {
      const devices = await getDevices();
      const exists = devices.some((d) => d.id === nextDeviceId);
      if (!exists) {
        return { ok: false, error: "Selected PLC was not found." };
      }
    }

    await db
      .insert(centerMapAssignmentsTable)
      .values({
        systemKey,
        deviceId: nextDeviceId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: centerMapAssignmentsTable.systemKey,
        set: {
          deviceId: nextDeviceId,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/app/center-map");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save assignment." };
  }
}
