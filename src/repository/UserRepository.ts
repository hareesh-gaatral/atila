import { connectDB } from '@/lib/database/connect';
import User, { IUser } from '@/models/User';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email: email.toLowerCase() }).lean() as unknown as IUser | null;
  }

  async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).lean() as unknown as IUser | null;
  }

  async create(data: { name: string; email: string; password: string; role?: string }): Promise<IUser> {
    await connectDB();
    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'user',
    });
    return user.save() as unknown as IUser;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(userId, { refreshToken }, { new: true }).lean() as unknown as IUser | null;
  }

  async findAll(): Promise<IUser[]> {
    await connectDB();
    return User.find({}).select('-password -refreshToken').sort({ createdAt: -1 }).lean() as unknown as IUser[];
  }

  async delete(id: string) {
    await connectDB();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}
