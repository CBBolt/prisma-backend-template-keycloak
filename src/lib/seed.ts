import prisma from "../lib/prisma";

/*
The purpose of this file is to seed the database with some default data (for this template mainly permissions)

-- Troubleshooting --

For most issues, running 'npx prisma generate' and running the seed script again will fix many issues

Docker Note: Run 'npx prisma db pull' to verify connection to stale docker instance, then follow the above

- Connection Timeout / Pool Issues - 

Usually due to not enough resources / open connections. Increase connectionLimit in prisma.ts script and also
be wary of too many queries run simultaneously / promises.

Connection issues can be solved by the above steps as well (testing connection first with 'npx prisma db pull' then
generating the schema again)

*/

type SeedPermission = {
  action: string;
  entity: string;
};

const permissionsToSeed: SeedPermission[] = [
  // Post permissions
  { action: "read", entity: "post" },
  { action: "create", entity: "post" },
  { action: "update", entity: "post" },
  { action: "delete", entity: "post" },

  // Role permissions
  { action: "read", entity: "role" },
  { action: "create", entity: "role" },
  { action: "update", entity: "role" },
  { action: "delete", entity: "role" },
  { action: "manage", entity: "role" },

  // Permission permissions
  { action: "read", entity: "permission" },
  { action: "create", entity: "permission" },
  { action: "update", entity: "permission" },
  { action: "delete", entity: "permission" },
  { action: "manage", entity: "permission" },

  // User Role permissions
  { action: "read", entity: "user-role" },
  { action: "create", entity: "user-role" },
  { action: "update", entity: "user-role" },
  { action: "delete", entity: "user-role" },
  { action: "manage", entity: "user-role" },
];

async function main() {
  await prisma.$connect();

  await prisma.permission.createMany({
    data: permissionsToSeed,
    skipDuplicates: true,
  });

  const permissions = await prisma.permission.findMany();

  /**
   * Helper maps
   */
  const byEntity = (entity: string) =>
    permissions.filter((p) => p.entity === entity);

  /**
   * 2️⃣ Admin role (gets EVERYTHING)
   */
  await prisma.role.upsert({
    where: { name: "admin" },
    update: {
      permissions: {
        set: permissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "admin",
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  /**
   * 3️⃣ User role (limited)
   */
  const userPermissions = [
    // Post access
    ...byEntity("post").filter((p) => ["read", "create"].includes(p.action)),
  ];

  await prisma.role.upsert({
    where: { name: "user" },
    update: {
      permissions: {
        set: userPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "user",
      permissions: {
        connect: userPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log("✅ Roles & permissions seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
