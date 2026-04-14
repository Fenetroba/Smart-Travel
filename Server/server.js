require('dotenv').config();
const { app, server } = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Test endpoint: GET http://localhost:${PORT}/api/test`);
    console.log(`   Socket.IO enabled for real-time chat`);
  });
}

start();
