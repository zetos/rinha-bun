import { init } from "@stricjs/app";
import { status } from "@stricjs/app/send";

// Initialize and serve the application with a concise syntax
const port = Number(Bun.env.PORT) || 3001;

init({
  routes: ["./"],
  // Configuration for Bun.serve
  serve: {
    port,
    reusePort: true,
    hostname: "0.0.0.0",
    error: (err) => {
      // Log info to console then return 500
      console.error(err);
      return status(null, 500);
    },
  },
  fallback: (ctx) => {
    console.log("url path:", ctx.path);
    return status("Not found..", 404);
  },
});

console.log("Running on port:", port);
