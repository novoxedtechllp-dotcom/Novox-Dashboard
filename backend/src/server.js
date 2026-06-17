import "dotenv/config";
import { app } from "./app.js";
import { startAttendanceCron } from "./cron/attendance.cron.js";
import { startKeepAliveCron } from "./cron/keepAlive.cron.js";

const PORT = process.env.PORT || 5000;

// Start background cron jobs
startAttendanceCron();
startKeepAliveCron();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
