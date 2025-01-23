import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const verifyProxy = (req: Request, res: Response, next: NextFunction) => {
  const { signature } = req.query;

  // Parse the query string from the original URL
  const queryURI = req.originalUrl
    .split("?")[1] // Get the query string part of the URL
    .replace(/&signature=[^&]*/, "") // Remove the signature parameter
    .split("&")
    .map((x) => decodeURIComponent(x))
    .sort()
    .join("");

  const calculatedSignature = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET as string)
    .update(queryURI, "utf-8")
    .digest("hex");

  if (calculatedSignature === signature) {
    res.locals.user_shop = req.query.shop;
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

export default verifyProxy;
