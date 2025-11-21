import prisma from "../database/prisma";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";

class ProductService {
  async createProduct(userId: string, data: CreateProductDTO) {
    return await prisma.product.create({
      data: {
        seller_id: userId,
        name: data.name,
        description: data.description,
        weight: data.weight,
        price: data.price,
        stock: data.stock,
        image_url: data.image_url
      }
    });
  }

  async getAllProducts(filters: {
    seller_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
  }) {
    const where: any = {};

    if (filters.seller_id) {
      where.seller_id = filters.seller_id;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.min_price || filters.max_price) {
      where.price = {};
      if (filters.min_price) where.price.gte = filters.min_price;
      if (filters.max_price) where.price.lte = filters.max_price;
    }

    if (filters.in_stock) {
      where.stock = { gt: 0 };
    }

    return await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async validateProductOwnership(productId: string, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.seller_id !== userId) {
      throw new Error("Forbidden: You can only update your own products");
    }

    return product;
  }

  async updateProduct(productId: string, data: UpdateProductDTO) {
    return await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async deleteProduct(productId: string) {
    await prisma.product.delete({
      where: { id: productId }
    });
  }
}

export default new ProductService();
