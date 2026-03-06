import User from '../models/User';

export const registerUser = async (name: string, email: string, password: string) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('Email already registered');
  return User.create({ name, email, password });
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) throw new Error('Invalid credentials');
  return user;
};
