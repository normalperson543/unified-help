# Unified Help

Unified Help puts all your Hack Club support tickets under one roof. Search, handle and analyze all your program tickets. See statistics for users across multiple Hack Club programs and search across the entire ticket corpus (and much more :p). Integrates with most Hack Club support channels.

## Structure

Unified Help comes in 2 parts -- the Unified Help platform itself (Next.js) and the Unified Help scraper (a Slack bot made in Node.js), which is accessible at https://github.com/normalperson543/unified-help-scraper

The Unified Help platform provides the frontend for interacting with tickets, auth stuff, etc. and the scraper indexes messages from Slack support channels.

You'll need both the scraper and this app to fully use Unified Help.

## Getting started

First, clone the GitHub repository **with submodules** (so you can also pull the scraper at the same time):

```
git clone --recurse-submodules https://github.com/normalperson543/unified-help.git
```

This requires a Slack bot to be installed into your workspace. Go to https://api.slack.com/apps and create a new app with the `manifest.json` file provided in the root of this repository. Make sure you generate an app token!

You'll also need to create an HCA app at https://auth.hackclub.com. Make sure you give your app `email, name, slack_id` OAuth permissions.

## Deployment

Rename .example.prod.env to .env. Replace the variables with your own depending on your setup.

A docker-compose.yml file has been provided for you. Confirm that port 6701 is open on your computer. If not, change the port in your compose file.

You can run `docker compose up -d` at the root of the repo to build and run Unified Help.

Open https://localhost:6701 to see the result.

You can shut down the Unified Help services by running `docker compose down`.

## Development

If you are not using docker compose, you will need to specify a DATABASE_URL linking to a Postgres database, a SCRAPER_API_URL pointing to your Unified Help Scraper bot, and a BETTER_AUTH_URL pointing to the URL the server is deployed on (usually http://localhost:3000).

Rename .example.dev.env to .env. Replace the variables with your own depending on your setup.

First, install deps:

```
npm install
```

Next, build the Prisma types:

```
npx prisma generate
```

Next, push the schema to your database:

```
npx prisma migrate dev
```

Finally, run the development server:

```
npm run dev
```

Open https://localhost:3000 to see the result.

To run the Unified Help scraper, see the instructions at https://github.com/normalperson543/unified-help-scraper (the scraper has automatically been cloned for you at the /scraper directory)

## Building Unified Help docker image

**You usually do not need to do this.** The docker compose file should automatically build the Docker image.

Run `docker build .` to build the Docker image.
