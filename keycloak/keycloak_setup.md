# Inital Keycloak Server Setup

When you initially setup a new keycloak instance, there will only be one realm (master) which will be the default one. Below are the steps to get this working with the frontend client:

1. Login to the Keycloak Admin Portal with the default credentials:

   **Username**: admin

   **Password**: admin

2. Next go to `Manage Realms` and add a new realm

3. Make sure the new realm is selected and go to `Clients`

4. Next create 2 clients (standard flow for both):

   _The names don't matter, but below are the names used in this template_

   ### `backend_client`

   The backend client will need to have the following boxes checked:
   - Service account roles: So it can be accessed via the backend
   - Direct access grants
   - Client Authentication: **On**

   Go to the `Credentials` tab and make note of the **Client Secret**

   Then go to the `Service account roles` and click the `Assign role` button > `Client roles`. Then add `manage-users` to allow the service account to manage the users in the client. This enough should be fine as this role is **realm** based not **client** based, but if needs be you can also add the `manage_realm` role to give more access.

   ### `frontend_client`

   Add the `Valid redirect URIs` and `Web origins` and set to the front end URL

   _If you're running the front end locally, it will be http://localhost:5173/\* and http://localhost:5173_

   Make sure **Client Authentication** is **Off** (This ensures the client is able to be reached publicly)

   #### Audience Mapping

   This is crucial for ensuring that the front end can talk to the backend

   - With the `frontend_client` selected go to the `Client Scopes` Tab
   - Click on the _client name_-dedicated scope
   - Click `Add mapper` and do `Audience`
   - Name it whatever and make sure the `backend_client` is included
   - Also ensure that `Add to access token` is turned on (it should already be)
   - Click Save
  
   The reason for this is that by default the `aud` property in the token will default to `account` and not include the proper client audience. This mapper ensures that it is mapped properly and allows both clients to talk to eachother.

---

At this point you should have a working version and just need to add a local user via the `Users` tab to add a generic user

Like the base `readme.md` file mentions, this user will need to be given the `admin` role in the database before other users can be managed in the UI

## Themes

There is a new experimental feature called **Quick Theme** that can be added to allow for quick and basic theming changes

> Details can be found here: https://www.keycloak.org/ui-customization/quick-theme

---

### Custom Themes

If you want to leverage custom themes, you can do so by following the below. This can be done per theme (login, email, admin, etc.) but each has to be setup in order to show up correctly in Keycloak.

Most of this setup in the docker file and themes folder already, but the below instructions are provided for additional context:

#### Phase 1 — Setup Local Dev Environment

1. Create project structure

   On your machine (NOT inside container):

   > themes/mytheme/login/theme.properties

   > docker-compose.yml

2. Minimal theme config

   In `themes/mytheme/login/theme.properties` add the property `parent=keycloak`

   This inherits all login logic automatically.

3. Create Docker Compose

   ```
   version: "3"

   services:
      keycloak:
         image: quay.io/keycloak/keycloak:latest
         command:
            - start-dev
         ports:
            - "8080:8080"
         environment:
            KEYCLOAK_ADMIN: admin
            KEYCLOAK_ADMIN_PASSWORD: admin
         volumes: - ./themes:/opt/keycloak/themes
   ```

4. Start Keycloak docker compose up

Open: http://localhost:8080

#### Phase 2 — Enable Live Theme Editing

Disable caching (CRITICAL)

Update command:

```
command:
   - start-dev
   - --spi-theme-cache-themes=false
   - --spi-theme-cache-templates=false
```

Now changes appear instantly without rebuilds

#### Phase 3 — Activate Your Theme

- Go to Admin Console
- Select your realm
- Navigate:
  - Realm Settings → Themes
- Set:
  - Login Theme = mytheme

#### Phase 4 — Customize UI Safely

**Rule #1: Don’t rewrite everything**

Only override what you need

Common overrides:

- Login page

Create:

> themes/mytheme/login/login.ftl

Start with:

```
<#import "template.ftl" as layout>

<@layout.registrationLayout>

  <h1>My Custom Login</h1>
  ${msg("loginTitle")}
</@layout.registrationLayout>
```

This keeps Keycloak’s logic intact

1. Add CSS

   > themes/mytheme/login/resources/css/styles.css

   Then update theme.properties:

   ```
   parent=keycloak
   styles=css/styles.css
   ```

2. Add logo

   > themes/mytheme/login/resources/img/logo.png

   Reference it in your .ftl:

   ```
   <img src="${url.resourcesPath}/img/logo.png" />
   ```

#### Phase 5 — Understand How Logic Works

Keycloak provides variables automatically:

Examples:

```
${realm.name}
${url.loginAction}
${msg("loginTitle")}
```

These come from Keycloak backend—you don’t implement auth yourself

#### Phase 6 — Debugging

If changes don’t show:

- Clear browser cache
- Confirm caching disabled
- Restart container
- Check logs: `docker logs <container>`

#### Phase 7 — Prepare for Production (Railway)

Once your theme works:

1. Remove volume mount
2. Create Dockerfile
   ```
   FROM quay.io/keycloak/keycloak:latest
   COPY themes/mytheme /opt/keycloak/themes/mytheme
   ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
   CMD ["start", "--optimized"]
   ```
3. Deploy to Railway

#### Phase 8 — Maintenance Workflow

Local dev loop:

- Edit files locally
- Refresh browser
- Iterate
- Production loop:
- Edit theme
- Rebuild image
- Redeploy
