import { jwtVerify, createRemoteJWKSet } from "jose";
import dotenv from "dotenv";

dotenv.config();

const JWKS = createRemoteJWKSet(
  new URL(
    `${process.env.KC_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/certs`,
  ),
);

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${process.env.KC_URL}/realms/${process.env.KC_REALM}`,
    audience: process.env.KC_CLIENT_ID,
  });

  return payload;
}
