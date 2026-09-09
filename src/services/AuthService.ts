import { UserRepository } from '@/repository/UserRepository';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '@/lib/auth/tokens';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async signup(name: string, email: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    // Public signups are always regular users. Admin accounts are created only
    // through the seed/setup script (never by self-registration).
    const user = await this.userRepo.create({ name, email, password: hashedPassword, role: 'user' });

    const tokens = generateTokens({ _id: (user as any)._id.toString(), email: user.email, role: user.role });

    await this.userRepo.updateRefreshToken((user as any)._id.toString(), tokens.refreshToken);

    return {
      user: { id: (user as any)._id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const tokens = generateTokens({ _id: (user as any)._id.toString(), email: user.email, role: user.role });

    await this.userRepo.updateRefreshToken((user as any)._id.toString(), tokens.refreshToken);

    return {
      user: { id: (user as any)._id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findById(decoded.userId);
    if (!user || (user as any).refreshToken !== token) {
      throw new Error('Invalid refresh token');
    }

    const tokens = generateTokens({ _id: (user as any)._id.toString(), email: user.email, role: user.role });

    await this.userRepo.updateRefreshToken((user as any)._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.userRepo.updateRefreshToken(userId, null);
  }
}
