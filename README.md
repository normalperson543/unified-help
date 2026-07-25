# Unified Help

Unified Help puts all your Hack Club support tickets under one roof. Search, handle and analyze all your program tickets. See statistics for users across multiple Hack Club programs and search across the entire ticket corpus (and much more :p). Integrates with most Hack Club support channels.

## Structure

Unified Help comes in 2 parts -- the Unified Help platform itself (Next.js) and the Unified Help scraper (a Slack bot made in Node.js).

The Unified Help platform provides the frontend for interacting with tickets, auth stuff, etc. and the scraper indexes messages from Slack support channels.

You'll need both parts to use Unified Help.

## Getting started

First, clone the GitHub repository **with submodules** (so you can also pull the scraper at the same time):

```
git clone --recurse-submodules https://github.com/normalperson543/unified-help.git
```

Next, a docker-compose.yml file has been provided for you. Confirm that port 6701 is open on your computer. If not, change the port in your compose file.

This requires a Slack bot to be installed into your workspace. Go to https://api.slack.com/apps and create a new app with the `manifest.json` file provided in the root of this repository.

You'll also need to create an HCA app at https://auth.hackclub.com. Make sure you give your app `email, name, slack_id` OAuth permissions.

Rename .example.env to .env. Replace the variables with your own depending on your setup.

## Development

To run the Unified Help platform development server, run `npm run dev`.

Open https://localhost:3000 to see the result.

To run the Unified Help scraper, see the instructions at https://github.com/normalperson543/unified-help-scraper (the scraper has automatically been cloned for you at the /scraper directory)

## Deployment

You can run `docker compose up -d` at the root of the repo to build and run Unified Help.

Open https://localhost:6701 to see the result.

You can shut down the Unified Help services by running `docker compose down`.