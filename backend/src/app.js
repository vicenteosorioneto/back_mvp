const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { FRONTEND_URL } = require('./shared/config/env');

// Routes — legacy (optionalAuth applied inside each router)
const culturesRoutes = require('./modules/cultures/cultures.routes');
const activitiesRoutes = require('./modules/activities/activities.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const weatherRoutes = require('./modules/weather/weather.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const historyRoutes = require('./modules/history/history.routes');
const financialSummaryRoutes = require('./modules/financial-summary/financial-summary.routes');

// Routes — new (requireAuth applied inside each router)
const authRoutes = require('./modules/auth/auth.routes');
const propertiesRoutes = require('./modules/properties/properties.routes');
const alertsRoutes = require('./modules/alerts/alerts.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const filesRoutes = require('./modules/files/files.routes');

// Middlewares
const errorHandler = require('./shared/middlewares/errorHandler');
const notFound = require('./shared/middlewares/notFound');

const app = express();

app.use(helmet());

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5500'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Legacy routes
app.use('/api', culturesRoutes);
app.use('/api', activitiesRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', weatherRoutes);
app.use('/api', reportsRoutes);
app.use('/api', historyRoutes);
app.use('/api', financialSummaryRoutes);

// New routes
app.use('/api', authRoutes);
app.use('/api', propertiesRoutes);
app.use('/api', alertsRoutes);
app.use('/api', financeRoutes);
app.use('/api', filesRoutes);

// Static files for legacy disk uploads
app.use('/uploads', express.static('uploads'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
