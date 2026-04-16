export type CreateUserInput = {
  username: string;
  email?: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  password?: string;
};

export type SetPasswordInput = {
  userId: string;
  password: string;
  temporary?: boolean;
};

export type RoleMappingInput = {
  userId: string;
  roleName: string;
  roleId: string;
};
