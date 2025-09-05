import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>
  ) {}

  create(createAuthDto: CreateAuthDto) {
    const newAuth = this.authRepository.create(createAuthDto);
    return this.authRepository.save(newAuth); 
  }

  findAll() {
    return this.authRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
