require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const issuerRoutes = require("./routes/issuer");
const workerRoutes = require("./routes/worker");
const verifierRoutes = require("./routes/verifier");
const credentialRoutes = require("./routes/credential");
const notificationRoutes = require("./routes/notifications");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';"
  );
  next();
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    process.env.WALLET_URL || "http://localhost:5174",
    'https://rozgar-id-frontend.vercel.app',
    'https://rozgar-id-wallet.vercel.app'
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check and Root routes
app.get('/', (req, res) => {
  res.json({
    message: 'RozgarID Backend API',
    status: 'Server is running',
    version: '1.0.0',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/issuer',
      '/api/v1/worker',
      '/api/v1/verifier'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", service: "RozgarID API", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/issuer", issuerRoutes);
app.use("/api/v1/worker", workerRoutes);
app.use("/api/v1/verifier", verifierRoutes);
app.use("/api/v1/credential", credentialRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 RozgarID API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
});

module.exports = app;
