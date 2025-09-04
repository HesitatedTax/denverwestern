import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variable } from './../entities/variable.entity';
import { Product } from './../entities/product.entity';
import { CreateVariableDto } from '../dto/create-variable.dto';
import { UpdateVariableDto } from '../dto/update-variable.dto';

@Injectable()
export class VariablesService {
  constructor(
    @InjectRepository(Variable)
    private variableRepository: Repository<Variable>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Variable[]> {
    return this.variableRepository.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<Variable> {
    const variable = await this.variableRepository.findOne({ 
      where: { id }, 
      relations: ['product'] 
    });
    
    if (!variable) {
      throw new NotFoundException('Variable no encontrada');
    }
    return variable;
  }

  async findByProduct(productId: string): Promise<Variable[]> {
    const product = await this.productRepository.findOne({ 
      where: { id: productId } 
    });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.variableRepository.find({
      where: { product: { id: productId } },
      relations: ['product']
    });
  }

  async create(createVariableDto: CreateVariableDto): Promise<Variable> {
    const { productId, ...variableData } = createVariableDto;

    const product = await this.productRepository.findOne({ 
      where: { id: productId } 
    });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const variable = this.variableRepository.create({
      ...variableData,
      product,
    });

    return this.variableRepository.save(variable);
  }

  async update(id: string, updateVariableDto: UpdateVariableDto): Promise<Variable> {
    const variable = await this.findOne(id);
    
    if (updateVariableDto.productId) {
      const product = await this.productRepository.findOne({ 
        where: { id: updateVariableDto.productId } 
      });
      
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
      variable.product = product;
    }

    Object.assign(variable, updateVariableDto);
    return this.variableRepository.save(variable);
  }

  async remove(id: string): Promise<void> {
    const variable = await this.findOne(id);
    await this.variableRepository.remove(variable);
  }

  async updateStock(id: string, quantity: number): Promise<Variable> {
    const variable = await this.findOne(id);
    variable.stock = quantity;
    return this.variableRepository.save(variable);
  }

  async decreaseStock(id: string, quantity: number): Promise<Variable> {
    const variable = await this.findOne(id);
    
    if (variable.stock < quantity) {
      throw new NotFoundException('Stock insuficiente');
    }

    variable.stock -= quantity;
    return this.variableRepository.save(variable);
  }
}