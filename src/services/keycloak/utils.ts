export class KeycloakError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "KeycloakError";
    this.status = status;
  }
}

export async function kcSafe<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.errorMessage ||
      error?.response?.data?.error ||
      "Keycloak operation failed";

    console.error("Keycloak error:", {
      status,
      message,
    });

    throw new KeycloakError(message, status);
  }
}
