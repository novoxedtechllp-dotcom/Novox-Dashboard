import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import studentRouter from "./routes/student.routes.js";
import userRouter from "./routes/user.routes.js";
import employeeRouter from "./routes/employee.routes.js";
import courseRouter from "./routes/course.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import workReportRouter from "./routes/work-report.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import profileRouter from "./routes/profile.routes.js";
import galleryRouter from "./routes/gallery.routes.js";
import leaveRouter from "./routes/leave.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  }),
);

app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/work-reports", workReportRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/leaves", leaveRouter);
app.use("/api/gallery", galleryRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
  });
});

export { app };