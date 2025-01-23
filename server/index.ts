import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import express from "express";
import path from "path";
import isInitialLoad from "./middleware/isInitialLoad";

const app = express();
const port = process.env.PORT || 3000;

// Determine environment
const isProduction = process.env.NODE_ENV === "production";

(async () => {

  app.use(isInitialLoad);

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

    server.listen(port, () => {
      console.log(`Dev server running at http://localhost:${port}`);
    });

    return;
  }

  // Common server start for both environments
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();

