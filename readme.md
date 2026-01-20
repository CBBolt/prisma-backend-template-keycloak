# Prisma Backend Template - Extended

This is a backend template setup with:

- Prisma
- MySQL
- CORS
- JSON Web Tokens (JWT)
- Basic Email (Password resets using **nodemailer**)
- MinIO (Image Server)
- Simple Role Based Permissions

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
- `JWT_SECRET` (For JWT)
- `EMAIL_USER` (For **nodemailer**)
- `EMAIL_PASS` (For **nodemailer**)
  - _Note: If email account has 2 MFA, you will need to use an app password_

3. Setup Docker for local instance of MySQL DB **(optional)**

Run the below script to create a local docker instance (Make sure docker is installed)

```
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=mydatabase -p 3306:3306 -d mysql:latest
```

4. Setup Docker for local instance of MinIO Server **(optional)**

```
docker run --name docker-container -p 9000:9000 -e "MINIO_ROOT_USER=minio" -e "MINIO_ROOT_PASSWORD=minio123" minio/minio server /data
```

5. Create an initial migration and generate the Prisma data

`npx prisma migrate dev --name init`

`npx prisma generate`

_Note: The generated prisma will be in the `src/generated/prisma` folder per the output path in the `schema.prisma` file_

6. Run `npm run seed` to seed the database with basic permissions **(optional)**

7. Run `npm run dev` to start the local express server

## Additional Notes

If Prisma is unable to reach the DB, run `npx prisma db pull` to pull the existing DB schema and verify the connection (This can be useful for idle docker containers)

If testing locally with Postman or other HTTP Tool, make sure the **Authorization** header is added once the token is retreived

The `/auth/reset-password-request` route will send an email given that the email credentials are valid. The URL it gives can then be used to verify the token and reset the password

## Routes

**auth**

`/auth/signup` | `POST`

`/auth/login` | `POST`

`/auth/reset-password-request` | `POST`

**resetPassword**

`/reset-password` | `GET` `POST`

**users**

`/profile` | `GET`

`/change-password` | `POST`

**images**

`/images/:key` | `GET` `DELETE`

`/images/upload` | `POST`

**posts** | _Note: Dummy Route to showcase permissions_

`/posts/:id` | `GET` `PATCH` `DELETE`

`/posts` | `UPLOAD`

**permissions**

`/permissions` | `GET` `POST`

`/permissions/:id` | `PATCH` | `DELETE`

**roles**

`/roles` | `GET` `POST`

`/roles/:roleId` | `PATCH` `DELETE`

`/roles/:roleId/permissions` | `PUT` `POST` `DELETE`

`/roles/user/:userId` | `GET` `POST` `PUT`

`roles/user:userId/role/:roleId` | `DELETE`


