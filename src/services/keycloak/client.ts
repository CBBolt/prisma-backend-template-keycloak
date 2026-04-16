import axios from "axios";
import KeycloakAdminPkg from "keycloak-admin";

// Handle ESM / CommonJS interop
const KcAdminClient: typeof KeycloakAdminPkg =
  (KeycloakAdminPkg as any).default ?? KeycloakAdminPkg;

let kcAdminClient: any; // runtime-friendly

export default async function getClient() {
  if (!kcAdminClient) {
    kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KC_URL!,
      realmName: process.env.KC_REALM!,
    });
  }

  // Manually fetch a client_credentials token
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.KC_CLIENT_ID!);
  params.append("client_secret", process.env.KC_CLIENT_SECRET!);

  const tokenResponse = await axios.post(
    `${process.env.KC_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/token`,
    params,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  const accessToken = tokenResponse.data.access_token;

  // Assign the token directly to the Keycloak client
  kcAdminClient.accessToken = accessToken;

  return kcAdminClient;
}
