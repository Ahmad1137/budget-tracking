const mongoose = require('mongoose');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/budget-tracking-test');
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});