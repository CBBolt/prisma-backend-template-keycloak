# Prisma Backend Template - KeyCloak

This is a backend template setup with:

- Prisma
- MySQL
- CORS
- MinIO (Image Server)
- Simple Role Based Permissions
- Keycloak (authentication)

## Setup

1. Install Dependencies with `npm i`
2. Setup .env variables

- `DATABASE_URL` (because this template uses MySQL, it will follow `mysql://USERNAME:PASSWORD@localhost:3306/DB_NAME`)
- `DATABASE_USER`
- `DATBASE_PASSWORD`
- `DATEBASE_NAME`
- `DATABASE_HOST` (localhost or URL for public facing DB)
- `MINIO_URL` (for MinIO server)
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `KC_URL` (for Keycloak server)
- `KC_REALM`
- `KC_CLIENT_ID`
- `KC_CLIENT_SECRET`

  _Note: For more information on Keycloak info for this template, please refer to the `keycloak` folder_

3. Setup Docker for local instance of MySQL DB **(optional)**

   Run the below script to create a local docker instance (Make sure docker is installed)

   ```
   docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=mydatabase -p 3306:3306 -d mysql:latest
   ```

4. Setup Docker for local instance of MinIO Server **(optional)**

   ```
   docker run --name minio-container -p 9000:9000 -e "MINIO_ROOT_USER=minio" -e "MINIO_ROOT_PASSWORD=minio123" minio/minio server /data
   ```

5. Setup Docker for local instance of Keycloak Server **(optional)**

   ```
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

_Note: Refer to the `keycloak` folder for more specifics with using custom themes_

6. Create an initial migration and generate the Prisma data

   `npx prisma migrate dev --name init`

   `npx prisma generate`

   _Note: The generated prisma will be in the `src/generated/prisma` folder per the output path in the `schema.prisma` file_

7. Run `npm run seed` to seed the database with basic permissions **(optional)**

8. Run `npm run dev` to start the local express server

9. Additionally, you'll need to login to the keycloak admin portal to make an inital user

   _Note: Refer to the `keycloak` folder for more specifics on initial setup_

## Additional Notes

If Prisma is unable to reach the DB, run `npx prisma db pull` to pull the existing DB schema and verify the connection (This can be useful for idle docker containers)

If testing locally with Postman or other HTTP Tool, make sure the **Authorization** header is added once the token is retreived

The initial users will not be able to access anything so you will need to go into the **UserRoles** table and set some basic permissions / roles. If you seed the database, you can assign users (once created) to **1** (Admin) or **2** (User). To view the tables and make changes, you can utilize `npx prisma studio` to access Prisma's built in table editor / viewer.
