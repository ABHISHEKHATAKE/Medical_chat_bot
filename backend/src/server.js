import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

connectDB().then(() => {
  app.listen(env.port, () => console.log(`[backend] listening on http://localhost:${env.port}`));
}).catch(e => { console.error(e); process.exit(1); });
