// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://144eadfd87c07ec88bd11b483abc4c58@o4509466576355328.ingest.us.sentry.io/4511803800879104",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: false,

  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
});
