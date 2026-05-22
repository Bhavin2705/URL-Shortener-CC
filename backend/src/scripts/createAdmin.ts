import 'dotenv/config';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import mongoose from 'mongoose';
import User from '../models/User';
import { connectDB } from '../config/db';

const ADMIN_EMAIL = 'admin@snip.local';
const ADMIN_NAME = 'Snip Admin';

const askPassword = async () => {
  const rl = readline.createInterface({ input, output });
  try {
    const password = (await rl.question(`Set password for ${ADMIN_EMAIL}: `)).trim();
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    const confirmation = (await rl.question('Confirm password: ')).trim();
    if (password !== confirmation) {
      throw new Error('Passwords do not match');
    }
    return password;
  } finally {
    rl.close();
  }
};

const main = async () => {
  const password = await askPassword();
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.name = existing.name || ADMIN_NAME;
    existing.password = password;
    existing.role = 'admin';
    existing.isBlocked = false;
    existing.blockedAt = null;
    await existing.save();
    console.log(`Updated admin account: ${ADMIN_EMAIL}`);
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password,
    role: 'admin',
    isBlocked: false,
    blockedAt: null,
  });

  console.log(`Created admin account: ${ADMIN_EMAIL}`);
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
