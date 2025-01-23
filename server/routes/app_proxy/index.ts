import { Router, Request, Response } from "express";
import clientProvider from "../../../utils/clientProvider";
const proxyRouter = Router();

proxyRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { client } = await clientProvider.offline.graphqlClient({
      shop: res.locals.user_shop,
    });

    console.log(client);
    res.status(200).send({ content: "Proxy Be Working" });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: true });
  }
});

proxyRouter.get("/json", async (req: Request, res: Response) => {
  res.status(200).send({ content: "Proxy Be Working" });
});

export default proxyRouter;
