# Free-tier deployment setup

This repository is prepared for a GitHub Pages frontend, a Render Java API, and
a Neon PostgreSQL database. This stack can be used within provider free tiers,
but free plans, quotas, availability, and pricing can change; it is not a
guarantee of lifelong free or uninterrupted hosting.

## 1. Create the Neon database

1. Create a PostgreSQL project in Neon.
2. Copy its host, database name, username, and password from the connection
   details. Do not put these values in GitHub or commit them to this repository.
3. Construct `DB_URL` in JDBC format:

   ```text
   jdbc:postgresql://HOST/DATABASE?sslmode=require
   ```

   Replace `HOST` and `DATABASE` with the corresponding values. For example:
   `jdbc:postgresql://ep-example.neon.tech/neondb?sslmode=require`.

## 2. Deploy the Java API on Render

1. In Render, create a Blueprint from this GitHub repository and select
   `render.yaml`.
2. When prompted, enter `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` using the
   Neon connection details. Render generates `JWT_SECRET` automatically.
3. Wait for the API deployment to become healthy. Its public URL will look like
   `https://egg-store-api.onrender.com`.
4. The first successful API startup creates the sample egg catalog in the
   database. Razorpay keys are optional for browsing; checkout payments need
   Razorpay test/live credentials entered only in Render's environment settings.

## 3. Deploy the frontend on GitHub Pages

1. In the GitHub repository, open **Settings → Secrets and variables → Actions
   → Variables** and add:

   - Name: `VITE_API_BASE_URL`
   - Value: the Render API URL, without a trailing slash (for example,
     `https://egg-store-api.onrender.com`)

2. Open **Settings → Pages** and select **GitHub Actions** as the build and
   deployment source.
3. Run **Actions → Deploy frontend to GitHub Pages → Run workflow**. Subsequent
   changes to frontend files on `master` deploy automatically.
4. The site URL is `https://siyanfahad.github.io/egg-store/`.

The API's `CORS_ALLOWED_ORIGINS` is configured for
`https://siyanfahad.github.io`. Do not add the `/egg-store/` path to that
origin.

## Free-tier behavior and secrets

Free instances may sleep, databases may pause or have limited storage, and
providers may change or discontinue their free plans. Never commit `.env`
files, database passwords, JWT secrets, or payment secrets. Configure secrets
only in the hosting provider's protected environment settings.
