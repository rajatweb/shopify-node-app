import Cryptr from 'cryptr';
import prisma from './prisma'; // Ensure this path points to your Prisma instance

// Initialize Cryptr with the encryption string from the environment variables
const cryption = new Cryptr(process.env.ENCRYPTION_STRING as string);

export const storeSession = async (session: any) => {
  try {
    // Upsert session data into the database
    await prisma.session.upsert({
      where: { id: session.id },
      update: {
        shop: session.shop,
        state: session.state || "",
        isOnline: session.isOnline || false,
        scope: session.scope || null,
        expires: session.expires ? new Date(session.expires) : null,
        accessToken: cryption.encrypt(session.accessToken),
        // Online session specific fields
        onlineAccessInfo: session.onlineAccessInfo || null,
        userId: session.onlineAccessInfo?.associated_user?.id
          ? BigInt(session.onlineAccessInfo.associated_user.id)
          : null,
        userFirstName: session.onlineAccessInfo?.associated_user?.first_name || null,
        userLastName: session.onlineAccessInfo?.associated_user?.last_name || null,
        userEmail: session.onlineAccessInfo?.associated_user?.email || null,
        isAccountOwner: session.onlineAccessInfo?.associated_user?.account_owner || null,
        userLocale: session.onlineAccessInfo?.associated_user?.locale || null,
        isCollaborator: session.onlineAccessInfo?.associated_user?.collaborator || null,
        isEmailVerified: session.onlineAccessInfo?.associated_user?.email_verified || null,
      },
      create: {
        id: session.id,
        shop: session.shop,
        state: session.state || "",
        isOnline: session.isOnline || false,
        scope: session.scope || null,
        expires: session.expires ? new Date(session.expires) : null,
        accessToken: cryption.encrypt(session.accessToken),
        // Online session specific fields
        onlineAccessInfo: session.onlineAccessInfo || null,
        userId: session.onlineAccessInfo?.associated_user?.id
          ? BigInt(session.onlineAccessInfo.associated_user.id)
          : null,
        userFirstName: session.onlineAccessInfo?.associated_user?.first_name || null,
        userLastName: session.onlineAccessInfo?.associated_user?.last_name || null,
        userEmail: session.onlineAccessInfo?.associated_user?.email || null,
        isAccountOwner: session.onlineAccessInfo?.associated_user?.account_owner || null,
        userLocale: session.onlineAccessInfo?.associated_user?.locale || null,
        isCollaborator: session.onlineAccessInfo?.associated_user?.collaborator || null,
        isEmailVerified: session.onlineAccessInfo?.associated_user?.email_verified || null,
      },
    });

    return true;
  } catch (err) {
    console.error('Failed to store session:', err);
    return false;
  }
};

export const loadSession = async (id: string) => {
  try {
    // Find session by ID
    const session = await prisma.session.findUnique({
      where: { id }, // Ensure the ID is properly cast to a number
    });

    if (session) {
      // Decrypt the accessToken before returning
      session.accessToken = cryption.decrypt(session.accessToken);
    }

    return session;
  } catch (err) {
    console.error('Failed to load session:', err);
    return undefined;
  }
};

export const deleteSession = async (id: string) => {
  try {
    // Delete session by ID
    await prisma.session.delete({
      where: { id }, // Ensure the ID is properly cast to a number
    });

    return true;
  } catch (err) {
    console.error('Failed to delete session:', err);
    return false;
  }
};

// Export all session handlers as a default export
const sessionHandler = { storeSession, loadSession, deleteSession };

export default sessionHandler;
