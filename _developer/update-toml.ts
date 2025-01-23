import dotenv from 'dotenv';
import fs from 'fs';
import toml from '@iarna/toml';
import webhookWriter from './web-hook-write';
import path from 'path';

// Load environment variables
dotenv.config();

// Read the existing TOML file
const shopifyFilePath = path.join(process.cwd(), "./", "shopify.app.toml");
const tomlFile = fs.readFileSync(shopifyFilePath, 'utf-8');
const config = toml.parse(tomlFile);


let appUrl = process.env.SHOPIFY_APP_URL;
if (appUrl && appUrl.endsWith("/")) {
    appUrl = appUrl.slice(0, -1);
}
// Globals
config.name = process.env.APP_NAME || "";
config.handle = process.env.APP_HANDLE || "";
config.client_id = process.env.SHOPIFY_API_KEY || "";
config.application_url = appUrl || "";
config.embedded = true;


// Auth
config.auth = {};
config.auth.redirect_urls = [`${appUrl}/api/`];

// Scopes
config.access_scopes = {};
config.access_scopes.scopes = process.env.SHOPIFY_API_SCOPES || "";
if (process.env.SHOPIFY_API_OPTIONAL_SCOPES?.trim()) {
    config.access_scopes.optional_scopes =
        process.env.SHOPIFY_API_OPTIONAL_SCOPES.split(",")
            .map((scope) => scope.trim())
            .filter(Boolean);
}
config.access_scopes.use_legacy_install_flow = false;

// Access
if (
    process.env.DIRECT_API_MODE &&
    process.env.EMBEDDED_APP_DIRECT_API_ACCESS
) {
    config.access = {};
    config.access.admin = {};
    process.env.DIRECT_API_MODE
        ? (config.access.admin.direct_api_mode = process.env.DIRECT_API_MODE)
        : null;
    process.env.EMBEDDED_APP_DIRECT_API_ACCESS
        ? (config.access.admin.embedded_app_direct_api_access =
            process.env.EMBEDDED_APP_DIRECT_API_ACCESS === "true")
        : null;
}

// Webhook event version to always match the app API version
config.webhooks = {};
config.webhooks.api_version = process.env.SHOPIFY_API_VERSION || "2024-10";


// Webhooks
webhookWriter(config);

// GDPR URLs
config.webhooks.privacy_compliance = {};
config.webhooks.privacy_compliance.customer_data_request_url = `${appUrl}/api/gdpr/customers_data_request`;
config.webhooks.privacy_compliance.customer_deletion_url = `${appUrl}/api/gdpr/customers_redact`;
config.webhooks.privacy_compliance.shop_deletion_url = `${appUrl}/api/gdpr/shop_redact`;

// App Proxy
if (
    process.env.APP_PROXY_PREFIX &&
    process.env.APP_PROXY_PREFIX?.length > 0 &&
    process.env.APP_PROXY_SUBPATH &&
    process.env.APP_PROXY_SUBPATH?.length > 0
) {
    config.app_proxy = {};
    config.app_proxy.url = `${appUrl}/api/proxy_route`;
    config.app_proxy.prefix = process.env.APP_PROXY_PREFIX || "";
    config.app_proxy.subpath = process.env.APP_PROXY_SUBPATH || "";
}

// PoS
if (process.env.POS_EMBEDDED && process.env.POS_EMBEDDED?.length > 1) {
    config.pos = {};
    config.pos.embedded = process.env.POS_EMBEDDED === "true" || false  ;
}

//Build
config.build = {};
config.build.include_config_on_deploy = true;


// Write the updated TOML file
fs.writeFileSync(shopifyFilePath, toml.stringify(config));
console.log('TOML file updated successfully'); 