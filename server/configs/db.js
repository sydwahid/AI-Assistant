import mongoose from 'mongoose';

const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'))
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
        if(!process.env.MONGODB_URI){
            console.warn('MONGODB_URI is not set. Falling back to', uri, '\nCreate a server/.env file to set it explicitly.')
        }
        await mongoose.connect(`${uri}/quickgpt`)
    } catch (error) {
        console.log('MongoDB connection error:', error.message)
        console.log('Continuing without database connection. Some features may be disabled.')
        // Do not exit the process here to allow the server to run in development
    }
}

export default connectDB;