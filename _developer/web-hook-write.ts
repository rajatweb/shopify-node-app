import { webhooksTopic } from "../utils/shopify";

const webhookWriter = (config: any) => {
    let subscriptionsArray = [];
    for (const entry in webhooksTopic) {
        const subscription = {
            topics: webhooksTopic[entry].topics,
            uri: webhooksTopic[entry].url.startsWith("/api/webhooks/")
                ? `${process.env.SHOPIFY_APP_URL}${webhooksTopic[entry].url}`
                : webhooksTopic[entry].url,
        };

        // if (webhooksTopic[entry].include_fields) {
        //     subscription.include_fields = webhooksTopic[entry].include_fields;
        // }

        // if (webhooksTopic[entry].filter) {
        //     subscription.filter = webhooksTopic[entry].filter;
        // }

        subscriptionsArray.push(subscription);
    }

    config.webhooks.subscriptions = [...subscriptionsArray];
};

export default webhookWriter;