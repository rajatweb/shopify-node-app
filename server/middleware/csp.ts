import { NextFunction, Request, Response } from "express";
import shopify from "../../utils/shopify";

const csp = (req: Request, res: Response, next: NextFunction) => {
  const shop = req.query.shop || "*.myshopify.com";
  if (shopify.config.isEmbeddedApp && shop) {
    res.setHeader(
      "Content-Security-Policy",
      `frame-ancestors https://${shop} https://admin.shopify.com;`
    );
  } else {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none';");
  }

  next();
};

export default csp;
