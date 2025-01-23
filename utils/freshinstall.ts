/**
 *
 * It's relatively easy to overload this function that will result in a long first open time.
 * If something can happen in the background, don't `await FreshInstall()` and instead just
 * `FreshInstall()` in isInitialLoad function.
 *
 */

import prisma from "./prisma";

const freshInstall = async ({
  shop
}: {
  shop: string;
  accessToken: string;
  shopData: any;
}) => {
  console.log("This is a fresh install - run functions");

  await prisma.stores.upsert({
    where: {
      shop: shop,
    },
    update: {
      isActive: true,
      shop: shop,
      updatedAt: new Date(),
    },
    create: {
      isActive: true,
      shop: shop,
    },
  });
};

export default freshInstall;
