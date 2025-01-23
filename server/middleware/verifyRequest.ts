
import { RequestedTokenType, Session } from "@shopify/shopify-api";
import { NextFunction, Request, Response } from "express";
import shopify from "../../utils/shopify";
import sessionHandler from "../../utils/sessionHandler";
import validateJWT from "../../utils/validateJWT";


const verifyRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      throw Error("No authorization header found");
    }

    const payload = validateJWT(authHeader.split(" ")[1]);

    let shop = shopify.utils.sanitizeShop(payload.dest.replace("https://", ""));

    if (!shop) {
      throw Error("No shop found, not a valid request");
    }

    const sessionId = await shopify.session.getCurrentId({
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    let session = await sessionHandler.loadSession(sessionId as string);
    if (!session) {
      session = await getSession({ shop, authHeader });
    }

    if (
      session?.expires && new Date(session.expires) > new Date() &&
      shopify.config.scopes?.equals(session?.scope as string)
    ) {
    } else {
      session = await getSession({ shop, authHeader });
    }
    res.locals.user_session = session;
    next();
  } catch (e: any) {
    console.error(
      `---> An error happened at verifyRequest middleware: ${e.message}`
    );
    res.status(401).send({ error: "Unauthorized call" });
  }
};

export default verifyRequest;

/**
 * Retrieves and stores session information based on the provided authentication header and offline flag.
 * If the `offline` flag is true, it will also attempt to exchange the token for an offline session token.
 * Errors during the process are logged to the console.
 *
 */

async function getSession({ shop, authHeader }: { shop: string, authHeader: string }) {
  try {
    const sessionToken = authHeader.split(" ")[1];

    const { session: onlineSession } = await shopify.auth.tokenExchange({
      sessionToken,
      shop,
      requestedTokenType: RequestedTokenType.OnlineAccessToken,
    });

    await sessionHandler.storeSession(onlineSession);

    const { session: offlineSession } = await shopify.auth.tokenExchange({
      sessionToken,
      shop,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    });

    await sessionHandler.storeSession(offlineSession);

    return new Session(onlineSession);
  } catch (e: any) {
    console.error(
      `---> Error happened while pulling session from Shopify: ${e.message}`
    );
    return e;
  }
}