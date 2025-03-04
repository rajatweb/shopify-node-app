import { Router, Request, Response } from "express";
import clientProvider from "../../utils/clientProvider";

const userRoutes = Router();

userRoutes.get("/", (req: Request, res: Response) => {
  try {
    const sendData = { text: "This is coming from /apps/api route." };
    res.status(200).json(sendData);
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true });
  }
});

userRoutes.post("/", (req: Request, res: Response) => {
  try {
    res.status(200).json(req.body);
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true });
  }
});

userRoutes.get("/debug/gql", async (req: Request, res: Response) => {
  try {
    //false for offline session, true for online session
    const { client } = await clientProvider.offline.graphqlClient({
      shop: res.locals.user_session.shop,
    });

    const shop = await client.request(
      `{
                shop {
                    name
                }
            }`
    );

    res.status(200).json({ text: shop.data.shop.name });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true, text: "GQL Query broke" });
  }
});

userRoutes.get("/debug/activeWebhooks", async (req: Request, res: Response) => {
  try {
    const { client } = await clientProvider.offline.graphqlClient({
      shop: res.locals.user_session.shop,
    });
    const activeWebhooks = await client.request(
      `{
                webhookSubscriptions(first: 25) {
                    edges {
                        node {
                            topic
                            endpoint {
                            __typename
                            ... on WebhookHttpEndpoint {
                                callbackUrl
                            }
                            }
                        }
                    }
                }
            }`
    );
    res.status(200).json(activeWebhooks);
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true });
  }
});

userRoutes.get(
  "/debug/getActiveSubscriptions",
  async (req: Request, res: Response) => {
    try {
      const { client } = await clientProvider.offline.graphqlClient({
        shop: res.locals.user_session.shop,
      });
      const response = await client.request(
        `{
                appInstallation {
                    activeSubscriptions {
                    name
                    status
                    lineItems {
                        plan {
                        pricingDetails {
                            ... on AppRecurringPricing {
                            __typename
                            price {
                                amount
                                currencyCode
                            }
                            interval
                            }
                        }
                        }
                    }
                    test
                    }
                }
            }`
      );

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res.status(400).send({ error: true });
    }
  }
);

userRoutes.get(
  "/debug/createNewSubscription",
  async (req: Request, res: Response) => {
    try {
      const { client, shop } = await clientProvider.offline.graphqlClient({
        shop: res.locals.user_session.shop,
      });
      const returnUrl = `${process.env.SHOPIFY_APP_URL}/?shop=${shop}`;

      const planName = "$10.25 plan";
      const planPrice = 10.25; //Always a decimal

      const response = await client.request(
        `mutation CreateSubscription{
                appSubscriptionCreate(
                name: "${planName}"
                returnUrl: "${returnUrl}"
                test: true
                lineItems: [
                        {
                        plan: {
                            appRecurringPricingDetails: {
                            price: { amount: ${planPrice}, currencyCode: USD }
                            }
                        }
                        }
                    ]
                    ) {
                    userErrors {
                        field
                        message
                    }
                    confirmationUrl
                    appSubscription {
                        id
                        status
                    }
                    }
                }
            `
      );

      if (response.data.appSubscriptionCreate.userErrors.length > 0) {
        console.log(
          `--> Error subscribing ${shop} to plan:`,
          response.data.appSubscriptionCreate.userErrors
        );
        res.status(400).send({ error: "An error occured." });
      }

      res.status(200).send({
        confirmationUrl: `${response.data.appSubscriptionCreate.confirmationUrl}`,
      });
    } catch (e) {
      console.error(e);
      res.status(400).send({ error: true });
    }
  }
);

export default userRoutes;
