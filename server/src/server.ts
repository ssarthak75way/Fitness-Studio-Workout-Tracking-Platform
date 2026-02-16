import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { runReminderJob } from './jobs/reminder.job.js';

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API: http://localhost:${PORT}/api/v1`);

            // Start background jobs
            runReminderJob();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
