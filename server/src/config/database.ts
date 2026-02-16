import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-studio';

        await mongoose.connect(mongoUri);

        console.log('MongoDB Connected Successfully');
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};                                                       

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB Error:', err);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});
