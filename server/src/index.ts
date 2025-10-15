import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tendersRoutes from './routes/tenders.js';
import suppliersRoutes from './routes/suppliers.js';
import remindersRoutes from './routes/reminders.js';
import expensesRoutes from './routes/expenses.js';
import companyRoutes from './routes/company.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', tendersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/company', companyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Tender CRM Server запущен!                      ║
║                                                       ║
║   📡 Порт: ${PORT}                                    ║
║   🌍 Окружение: ${process.env.NODE_ENV || 'development'}              ║
║   🔗 API: http://localhost:${PORT}/api                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
