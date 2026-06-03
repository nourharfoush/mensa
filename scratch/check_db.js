import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://admin:anwar@rewaq.eodeos1.mongodb.net/rowaq-app?retryWrites=true&w=majority';

const sessionSchema = new mongoose.Schema({}, { strict: false });
const Session = mongoose.model('Session', sessionSchema, 'sessions');

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const sessions = await Session.find().limit(5);
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach(s => {
      console.log(JSON.stringify(s.toObject(), null, 2));
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
