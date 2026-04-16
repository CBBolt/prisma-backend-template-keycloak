import getClient from "./client";
import { kcSafe } from "./utils";
import { CreateUserInput, SetPasswordInput } from "./types";
import { RequiredActionAlias } from "keycloak-admin/lib/defs/requiredActionProviderRepresentation";

class UserService {
  async getUsers() {
    const kc = await getClient();
    return kcSafe(() => kc.users.find());
  }

  async createUser(data: CreateUserInput) {
    const kc = await getClient();

    return kcSafe(() =>
      kc.users.create({
        username: data.username,
        email: data.email,
        enabled: data.enabled ?? true,
        firstName: data.firstName,
        lastName: data.lastName,
        credentials: [
          {
            type: "password",
            value: data.password ?? "TempPassword123!",
            temporary: true, // 🔥 forces reset on first login
          },
        ],
      }),
    );
  }

  async updateUser(userId: string, data: any) {
    const kc = await getClient();
    return kcSafe(() => kc.users.update({ id: userId }, data));
  }

  async deleteUser(userId: string) {
    const kc = await getClient();
    return kcSafe(() => kc.users.del({ id: userId }));
  }

  async disableUser(userId: string) {
    const kc = await getClient();
    return kcSafe(() => kc.users.update({ id: userId }, { enabled: false }));
  }

  async enableUser(userId: string) {
    const kc = await getClient();
    return kcSafe(() => kc.users.update({ id: userId }, { enabled: true }));
  }

  async logoutUser(userId: string) {
    const kc = await getClient();
    return kcSafe(() => kc.users.logout({ id: userId }));
  }

  async getUserSessions(userId: string) {
    const kc = await getClient();
    return kcSafe(() => kc.users.listSessions({ id: userId }));
  }

  async setPassword({ userId, password, temporary = false }: SetPasswordInput) {
    const kc = await getClient();

    return kcSafe(() =>
      kc.users.resetPassword({
        id: userId,
        credential: {
          type: "password",
          value: password,
          temporary,
        },
      }),
    );
  }

  async sendResetPasswordEmail(userId: string) {
    const kc = await getClient();

    return kcSafe(() =>
      kc.users.executeActionsEmail({
        id: userId,
        actions: ["UPDATE_PASSWORD"] as RequiredActionAlias[],
      }),
    );
  }
}

// 👇 Singleton export (this is key)
export const userService = new UserService();
