import "dotenv/config";
import "@shopify/shopify-api/adapters/node";

import {
  LogSeverity,
  shopifyApi,
  LATEST_API_VERSION,
} from "@shopify/shopify-api";

// Setup Shopify configuration
let shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: process.env.SHOPIFY_API_SCOPES?.split(",") || ["write_products"],
  hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, "") || "",
  hostScheme: "https",
  isEmbeddedApp: true,
  apiVersion: LATEST_API_VERSION,
  logger: {
    level:
      process.env.NODE_ENV === "development"
        ? LogSeverity.Debug
        : LogSeverity.Error,
  },
  user: {
    webhooks: [
      {
        topics: ["app/uninstalled"],
        url: "/api/webhooks/app_uninstalled",
      },
    ],
  },
});

const webhooksTopic = [
  {
    topics: ["app/uninstalled"],
    url: "/api/webhooks/app_uninstalled",
  },
];

export default shopify;
export { webhooksTopic };
