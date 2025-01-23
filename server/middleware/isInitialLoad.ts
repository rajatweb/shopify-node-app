import { RequestedTokenType } from "@shopify/shopify-api";
import { Request, Response, NextFunction } from "express";
import shopify from "../../utils/shopify";


const isInitialLoad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = req.query.shop;
    const idToken = req.query.id_token;

    if (shop && idToken) {
      const { session: offlineSession } = await shopify.auth.tokenExchange({
        sessionToken: idToken as string,
        shop: shop as string,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });
      const { session: onlineSession } = await shopify.auth.tokenExchange({
        sessionToken: idToken as string,
        shop: shop as string,
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
      });

      console.log(offlineSession);
      console.log(onlineSession);

    //   await sessionHandler.storeSession(offlineSession);
    //   await sessionHandler.storeSession(onlineSession);

    //   const webhookRegistrar = await shopify.webhooks.register({
    //     session: offlineSession,
    //   });

    //   const isFreshInstall = await prisma.stores.findUnique({
    //     where: {
    //       shop: onlineSession.shop,
    //     },
    //   });

    //   if (!isFreshInstall || isFreshInstall?.isActive === false) {
    //     // !isFreshInstall -> New Install
    //     // isFreshInstall?.isActive === false -> Reinstall
    //     await freshInstall({ shop: onlineSession.shop, accessToken: onlineSession.accessToken, shopData: onlineSession.onlineAccessInfo?.associated_user });
    //   }

    //   console.dir(webhookRegistrar, { depth: null });
    }
    next();
  } catch (e) {
    console.error(`---> An error occured in isInitialLoad`, e);
    next(e);
  }
};

export default isInitialLoad;
