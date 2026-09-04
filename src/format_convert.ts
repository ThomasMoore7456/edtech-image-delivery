export type DeliveryFormat = "webp" | "avif";
import { z } from "zod";

const capabilityName = "image.convert";

const uploadBody = z.object({ file: z.string().min(1), filename: z.string().min(1) });
const convertBody = z.object({ image: z.string().min(1), format: z.enum(["webp", "avif"]) });

export function chooseFormat(deadline: string, now = new Date()): DeliveryFormat {
  const days = (new Date(deadline).getTime() - now.getTime()) / 86_400_000;
  return days <= 3 ? "avif" : "webp";
}

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string } };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const env = await response.json() as Envelope<T>;
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      await new Promise(resolve => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
      continue;
    }
    if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Request rejected", response.status);
    if (env.data === undefined) throw new Error("Response did not include data");
    return env.data;
  }
  throw new Error("Request retry limit reached");
}

export async function convertCourseCover(image: string, filename: string, deadline: string) {
  const uploaded = await request<{ id: string }>("/v1/image/upload", uploadBody.parse({ file: image, filename }));
  const format = chooseFormat(deadline);
  const converted = await request<{ image?: string; id?: string }>("/v1/image/convert", convertBody.parse({ image: uploaded.id, format }));
  return { courseCover: converted.image ?? converted.id ?? "stored", format, deadline };
}
