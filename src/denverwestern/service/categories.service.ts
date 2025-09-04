import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './../entities/category.entity';
import { Product } from './../entities/product.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['products'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ 
      where: { id }, 
      relations: ['products'] 
    });
    
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async findByName(name: string): Promise<Category> {
    return this.categoryRepository.findOne({ 
      where: { name }, 
      relations: ['products'] 
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;

    // Verificar si la categoría ya existe
    const existingCategory = await this.findByName(name);
    if (existingCategory) {
      throw new ConflictException('La categoría ya existe');
    }

    const category = this.categoryRepository.create({
      name,
      products: []
    });

    return this.categoryRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    
    if (updateCategoryDto.name) {
      // Verificar si el nuevo nombre ya existe
      const existingCategory = await this.findByName(updateCategoryDto.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
      
      category.name = updateCategoryDto.name;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    
    // Verificar si la categoría tiene productos asociados
    const productsCount = await this.productRepository.count({
      where: { category: { id } }
    });

    if (productsCount > 0) {
      throw new ConflictException('No se puede eliminar una categoría con productos asociados');
    }

    await this.categoryRepository.remove(category);
  }

  async getCategoryWithProducts(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async getCategoriesWithProductCount(): Promise<{ category: Category; productCount: number }[]> {
    const categories = await this.findAll();
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productRepository.count({
          where: { category: { id: category.id } }
        });
        return { category, productCount };
      })
    );

    return categoriesWithCount;
  }
}