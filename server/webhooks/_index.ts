import shopify from "../../utils/shopify";
import appUninstallHandler from "./app_uninstalled";
import { Request, Response } from "express";


const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  console.log("webhookHandler", "webhook triggered");

  const topic = req.headers["x-shopify-topic"] || "";
  const shop = req.headers["x-shopify-shop-domain"] || "";
  const apiVersion = req.headers["x-shopify-api-version"] || "";
  const webhookId = req.headers["x-shopify-webhook-id"] || "";

  try {
    const validateWebhook = await shopify.webhooks.validate({
      rawBody: req.body,
      rawRequest: req,
      rawResponse: res,
    });

    if (validateWebhook.valid) {
      // SWICHCASE
      switch (validateWebhook.topic) {
        case "APP_UNINSTALLED":
          await appUninstallHandler(
            topic as string,
            shop as string,
            req.body as string,
            webhookId as string,
            apiVersion as string
          );
          break;
        default:
          throw new Error(`Can't find a handler for ${validateWebhook.topic}`);
      }
      console.log(`--> Processed ${topic} webhook for ${shop}`);
      res.status(200).send({ message: "ok" });
    } else {
      res.status(400).send({ error: true });
    }
  } catch (e) {
    console.error(
      `---> Error while registering ${topic} webhook for ${shop}`,
      e
    );
    if (!res.headersSent) {
      res.status(500).send(e);
    }
  }
};

export default webhookHandler;
