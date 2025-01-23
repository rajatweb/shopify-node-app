import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import shopify from "../../utils/shopify";

const verifyHmac = (req: Request, res: Response, next: NextFunction) => {
  try {
    const generateHash = crypto
      .createHmac("SHA256", process.env.SHOPIFY_API_SECRET as string)
      .update(JSON.stringify(req.body), "utf8")
      .digest("base64");
    const hmac = req.headers["x-shopify-hmac-sha256"];

    if (shopify.auth.safeCompare(generateHash, hmac as string)) {
      next();
    } else {
      res.status(401).send();
    }
  } catch (e) {
    console.log(e);
    res.status(401).send();
  }
};

export default verifyHmac;
