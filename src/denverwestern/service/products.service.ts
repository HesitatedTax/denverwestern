import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/denverwestern/entities/product.entity';
import { Category } from 'src/denverwestern/entities/category.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ 
      relations: ['category', 'variables'],
      where: { isActive: true }
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ 
      where: { id }, 
      relations: ['category', 'variables'] 
    });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;

    let category: Category | null = null;
    if (categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    const product = this.productRepository.create({
      ...productData,
      category,
      isActive: true,
    });

    return this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false; // Soft delete
    await this.productRepository.save(product);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.name ILIKE :query OR product.description ILIKE :query', { 
        query: `%${query}%` 
      })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { 
        category: { id: categoryId },
        isActive: true 
      },
      relations: ['category', 'variables']
    });
  }
}