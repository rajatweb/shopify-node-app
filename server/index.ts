import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import express, { Request, Response } from "express";
import path from "path";
import isInitialLoad from "./middleware/isInitialLoad";
import webhookHandler from "./webhooks/_index";
import verifyRequest from "./middleware/verifyRequest";
import shopify from "../utils/shopify";
import sessionHandler from "../utils/sessionHandler";
import csp from "./middleware/csp";
import verifyProxy from "./middleware/verifyProxy";
import userRoutes from "./routes";
import proxyRouter from "./routes/app_proxy";
import verifyHmac from "./middleware/verifyHmac";
import { customerRedact, shopRedact } from "./controllers/gdpr";
import { customerDataRequest } from "./controllers/gdpr";

const app = express();
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

// Determine environment
const isProduction = process.env.NODE_ENV === "production";

(async () => {
  app.disable("x-powered-by");
  app.use(isInitialLoad);

  // Incoming webhook requests
  app.post(
    "/api/webhooks/:webhookTopic*",
    express.text({ type: "*/*" }),
    webhookHandler
  );

  // middleware
  app.use(express.json());
  app.use(csp);
  app.use(isInitialLoad);

  // If you're making changes to any of the routes, please make sure to add them in `./client/vite.config.js` or it'll not work.
  app.use("/api/apps", verifyRequest, userRoutes); //Verify user route requests
  app.use("/api/proxy_route", verifyProxy, proxyRouter); //MARK:- App Proxy routes

  app.post(
    "/api/graphql",
    verifyRequest,
    async (req: Request, res: Response) => {
      try {
        const sessionId = await shopify.session.getCurrentId({
          isOnline: true,
          rawRequest: req,
          rawResponse: res,
        });
        const session = await sessionHandler.loadSession(sessionId as string);
        const response = await shopify.clients.graphqlProxy({
          session: session as any,
          rawBody: req.body as any,
        });
        res.status(200).send(response.body);
      } catch (e) {
        console.error(`---> An error occured at GraphQL Proxy`, e);
        res.status(403).send(e);
      }
    }
  );

  app.post("/api/gdpr/:topic", verifyHmac, async (req: Request, res: Response) => {
    const { body } = req;
    const { topic } = req.params;
    const shop = req.body.shop_domain;
  
    console.warn(`--> GDPR request for ${shop} / ${topic} recieved.`);
  
    let response;
    switch (topic) {
      case "customers_data_request":
        response = await customerDataRequest(topic, shop, body);
        break;
      case "customers_redact":
        response = await customerRedact(topic, shop, body);
        break;
      case "shop_redact":
        response = await shopRedact(topic, shop, body);
        break;
      default:
        console.error(
          "--> Congratulations on breaking the GDPR route! Here's the topic that broke it: ",
          topic
        );
        response = "broken";
        break;
    }
  
    if (response) {
      res.status(200).send();
    } else {
      res.status(403).send("An error occured");
    }
  });

  if (isProduction) {
    // Production: Serve built assets
    const clientDistPath = path.resolve(process.cwd(), "client", "dist");
    app.use(express.static(clientDistPath));

    app.get("/*", (req, res) => {
      res.sendFile(path.resolve(clientDistPath, "index.html"));
    });

    console.log("Production server running...");
  } else {
    // Development: Use Vite server with HMR
    const server = createServer(app);

    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "client"),
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: "spa",
      plugins: [
        {
          name: "html-transform",
          transformIndexHtml: {
            order: "pre",
            handler(html) {
              return html.replace(
                "%VITE_SHOPIFY_API_KEY%",
                process.env.VITE_SHOPIFY_API_KEY || ""
              );
            },
          },
        },
      ],
    });

    // Use Vite's middleware for development
    app.use(vite.middlewares);

    server.listen(PORT, () => {
      console.log(`Dev server running at http://localhost:${PORT}`);
    });

    return;
  }

  // Common server start for both environments
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
