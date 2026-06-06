import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<any>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const exists = await this.userModel.findOne({ username });
    if (exists) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      username,
      password: hashed,
    });

    const token = this.jwtService.sign({
      userId: user._id,
      username: user.username,
    });

    return { token, userId: user._id, username: user.username };
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new BadRequestException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({
      userId: user._id,
      username: user.username,
    });

    return { token, userId: user._id, username: user.username };
  }
}