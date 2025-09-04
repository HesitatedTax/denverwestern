import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { VariablesService } from './../service/variables.service';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('variables')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  @Get()
  async findAll() {
    return this.variablesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.variablesService.findOne(id);
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.variablesService.findByProduct(productId);
  }

  @Post()
  async create(@Body() createVariableDto: CreateVariableDto) {
    return this.variablesService.create(createVariableDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVariableDto: UpdateVariableDto) {
    return this.variablesService.update(id, updateVariableDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.variablesService.remove(id);
  }
}