import prisma from "../../utils/prisma";

const appUninstallHandler = async (
  topic: string,
  shop: string,
  webhookRequestBody: any,
  webhookId: string,
  apiVersion: string
) => {
  console.log("appUninstallHandler", topic);

  try {
    // Parse the webhook request body
    const webhookBody = JSON.parse(webhookRequestBody);
    console.log("webhookBody", webhookBody);

    // Update store status and delete sessions in a transaction
    await prisma.$transaction([
      prisma.stores.update({
        where: { shop },
        data: { isActive: false },
      }),
      prisma.session.deleteMany({
        where: { shop },
      }),
    ]);

    console.log(`Successfully processed uninstall for shop: ${shop}`);
  } catch (error) {
    console.error("Error handling app uninstall:", error);
    throw new Error(`Failed to process app uninstall for shop: ${shop}`);
  }
};

export default appUninstallHandler;
