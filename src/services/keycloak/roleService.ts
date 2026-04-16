import getClient from "./client";
import { kcSafe } from "./utils";
import { RoleMappingInput } from "./types";

class RoleService {
  async getUserRoles(userId: string) {
    const kc = await getClient();
    return kcSafe(() => kc.users.listRealmRoleMappings({ id: userId }));
  }

  async assignRealmRole({ userId, roleId, roleName }: RoleMappingInput) {
    const kc = await getClient();

    return kcSafe(() =>
      kc.users.addRealmRoleMappings({
        id: userId,
        roles: [
          {
            id: roleId,
            name: roleName,
          },
        ],
      }),
    );
  }

  async removeRealmRole({ userId, roleId, roleName }: RoleMappingInput) {
    const kc = await getClient();

    return kcSafe(() =>
      kc.users.delRealmRoleMappings({
        id: userId,
        roles: [
          {
            id: roleId,
            name: roleName,
          },
        ],
      }),
    );
  }
}

// 👇 Singleton export
export const roleService = new RoleService();
