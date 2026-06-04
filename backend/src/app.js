import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import studentRouter from "./routes/student.routes.js";
import userRouter from "./routes/user.routes.js";
import employeeRouter from "./routes/employee.routes.js";
import courseRouter from "./routes/course.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
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

//Routes
import authRouter from "./routes/auth.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/courses", courseRouter);

export { app };
