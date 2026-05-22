import User from '../models/User';

export const registerUser = async (name: string, email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new Error('Email already registered');
  return User.create({ name, email: normalizedEmail, password, role: 'user' });
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (user?.isBlocked) throw new Error('Account is blocked');
  if (!user || !(await user.comparePassword(password))) throw new Error('Invalid credentials');
  return user;
};
