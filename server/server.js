import "dotenv/config.js";
import http from "http";
import { app } from "./app.js";
import { testConnection } from "./src/common/configs/db.config.js";
// import { startCronJobs, stopCronJobs } from "./src/cron/index.js";

const server = http.createServer(app);

testConnection();

// startCronJobs();

// process.on('SIGINT', () => {
//   stopCronJobs();
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   stopCronJobs();
//   process.exit(0);
// });

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export { server };
