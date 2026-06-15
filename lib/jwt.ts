import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  imageUrl?: string;
  created?: number;
  updated?: number;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    imageUrl: payload.imageUrl,
    created: payload.created,
    updated: payload.updated,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getCookieExpiry(): Date {
  const expiry = new Date();
  const duration = JWT_EXPIRY;

  if (duration.endsWith("d")) {
    expiry.setDate(expiry.getDate() + parseInt(duration.slice(0, -1)));
  } else if (duration.endsWith("h")) {
    expiry.setHours(expiry.getHours() + parseInt(duration.slice(0, -1)));
  } else if (duration.endsWith("m")) {
    expiry.setMinutes(expiry.getMinutes() + parseInt(duration.slice(0, -1)));
  } else {
    expiry.setDate(expiry.getDate() + 7);
  }

  return expiry;
}
