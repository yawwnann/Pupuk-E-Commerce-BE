# Backend Architecture

## Overview
This backend follows a **layered architecture** pattern to separate concerns and avoid fat controllers. The codebase is organized into distinct layers with clear responsibilities.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│            Routes Layer                 │
│  (HTTP routing and middleware)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Controllers Layer               │
│  (HTTP request/response handling)       │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│ Validators  │  │   Services      │
│  (Input     │  │  (Business      │
│ validation) │  │   Logic)        │
└─────────────┘  └──────┬──────────┘
                        │
                 ┌──────▼──────────┐
                 │   Database      │
                 │   (Prisma ORM)  │
                 └─────────────────┘
```

---

## Directory Structure

```
src/
├── controllers/          # HTTP request handlers
│   ├── AuthController.ts
│   ├── UserController.ts
│   ├── AddressController.ts
│   ├── ProductController.ts
│   ├── CartController.ts
│   └── CheckoutController.ts
│
├── services/            # Business logic layer
│   ├── CheckoutService.ts
│   ├── CartService.ts
│   └── ProductService.ts
│
├── validators/          # Input validation layer
│   ├── CheckoutValidator.ts
│   ├── CartValidator.ts
│   └── ProductValidator.ts
│
├── middleware/          # Express middleware
│   ├── auth.ts
│   └── roleCheck.ts
│
├── routes/              # Route definitions
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── address.routes.ts
│   ├── product.routes.ts
│   ├── cart.routes.ts
│   ├── checkout.routes.ts
│   └── routes.ts
│
├── types/               # TypeScript type definitions
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── address.types.ts
│   ├── product.types.ts
│   ├── cart.types.ts
│   └── checkout.types.ts
│
├── utils/               # Helper functions
│   ├── responseFormatter.ts
│   └── errorHandler.ts
│
└── database/            # Database configuration
    ├── prisma.ts
    └── connection.ts
```

---

## Layer Responsibilities

### 1. Routes Layer
**Location:** `src/routes/`

**Responsibilities:**
- Define HTTP endpoints
- Apply middleware (authentication, authorization)
- Route requests to controllers

**Example:**
```typescript
import express from "express";
import CartController from "../controllers/CartController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, CartController.addToCart);
router.get("/", authMiddleware, CartController.getCart);

export default router;
```

---

### 2. Controllers Layer
**Location:** `src/controllers/`

**Responsibilities:**
- Handle HTTP requests and responses
- Extract data from request
- Call validators for input validation
- Call services for business logic
- Format and send responses
- Handle errors

**Example:**
```typescript
class CartController {
  async addToCart(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const { product_id, quantity } = req.body;

      // Validate input
      CartValidator.validateAddToCart({ product_id, quantity });

      // Business logic in service
      const product = await CartService.getProduct(product_id);
      await CartService.validateStock(product, quantity);
      
      // ... more service calls

      return res.status(200).json(
        successResponse("Product added to cart", { item })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}
```

**Key Principles:**
- ✅ Controllers should be thin (< 50 lines per method)
- ✅ No business logic in controllers
- ✅ No direct database access
- ✅ Use services for all business operations

---

### 3. Services Layer
**Location:** `src/services/`

**Responsibilities:**
- Implement business logic
- Perform database operations
- Handle complex calculations
- Orchestrate multiple operations
- Ensure data consistency

**Example:**
```typescript
class CartService {
  async addOrUpdateCartItem(
    cartId: string, 
    productId: string, 
    quantity: number, 
    existingItem: any, 
    product: any
  ) {
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}`);
      }

      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true }
      });
    } else {
      return await prisma.cartItem.create({
        data: { cart_id: cartId, product_id: productId, quantity },
        include: { product: true }
      });
    }
  }
}
```

**Key Principles:**
- ✅ All business logic goes here
- ✅ Reusable across different controllers
- ✅ Testable without HTTP layer
- ✅ Throws errors for exceptional cases

---

### 4. Validators Layer
**Location:** `src/validators/`

**Responsibilities:**
- Validate request data
- Check required fields
- Validate data types and formats
- Throw validation errors

**Example:**
```typescript
class ProductValidator {
  validateCreateProduct(data: CreateProductDTO) {
    const errors: string[] = [];

    if (!data.name) errors.push("Name is required");
    if (!data.description) errors.push("Description is required");
    if (data.weight === undefined) errors.push("Weight is required");
    if (data.price === undefined) errors.push("Price is required");
    
    if (data.weight !== undefined && data.weight <= 0) {
      errors.push("Weight must be greater than 0");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }
}
```

**Key Principles:**
- ✅ Validate early, fail fast
- ✅ Clear, descriptive error messages
- ✅ Reusable validation rules

---

### 5. Utils Layer
**Location:** `src/utils/`

**Responsibilities:**
- Provide helper functions
- Format responses consistently
- Handle errors uniformly

**Example:**
```typescript
// responseFormatter.ts
export const successResponse = (message: string, data?: any) => {
  return {
    success: true,
    message,
    ...(data && { data })
  };
};

// errorHandler.ts
export const handleError = (res: Response, error: any) => {
  console.error("Error:", error);
  
  const message = error.message || "Internal server error";
  
  if (message.includes("not found")) {
    return res.status(404).json({ success: false, message });
  }
  
  if (message.includes("Forbidden")) {
    return res.status(403).json({ success: false, message });
  }
  
  return res.status(500).json({ success: false, message });
};
```

---

## Benefits of This Architecture

### 1. **Separation of Concerns**
Each layer has a single, well-defined responsibility:
- Controllers: HTTP handling
- Services: Business logic
- Validators: Input validation
- Utils: Helper functions

### 2. **Maintainability**
- Easy to locate and fix bugs
- Clear where to add new features
- Predictable code organization

### 3. **Testability**
- Services can be tested without HTTP layer
- Validators can be tested independently
- Easy to mock dependencies

### 4. **Reusability**
- Services can be reused across controllers
- Validators can be reused across endpoints
- Utils are application-wide helpers

### 5. **Scalability**
- Easy to add new features
- New developers can understand structure quickly
- Codebase grows in organized manner

---

## Code Flow Example

Let's trace a request through the layers:

### Request: `POST /cart` (Add product to cart)

```
1. Route Layer (cart.routes.ts)
   ↓ Applies authMiddleware
   ↓ Routes to CartController.addToCart()

2. Controller Layer (CartController.ts)
   ↓ Extracts userId from token
   ↓ Extracts product_id and quantity from body
   ↓ Calls CartValidator.validateAddToCart()

3. Validator Layer (CartValidator.ts)
   ↓ Validates product_id is present
   ↓ Validates quantity > 0
   ↓ Throws error if invalid

4. Service Layer (CartService.ts)
   ↓ CartService.getProduct() - fetch product
   ↓ CartService.validateStock() - check stock
   ↓ CartService.getOrCreateCart() - ensure cart exists
   ↓ CartService.findExistingCartItem() - check if already in cart
   ↓ CartService.addOrUpdateCartItem() - add or update quantity
   ↓ Returns cart item

5. Controller Layer (CartController.ts)
   ↓ Formats response with successResponse()
   ↓ Sends HTTP 200 with JSON

6. If error occurs at any point:
   ↓ Caught by try-catch
   ↓ handleError() determines status code
   ↓ Sends error response
```

---

## Adding New Features

### Example: Add "Get User Orders" endpoint

**1. Create types (if needed):**
```typescript
// src/types/order.types.ts
export interface OrderResponse {
  id: string;
  product: ProductResponse;
  quantity: number;
  total_price: number;
}
```

**2. Create service:**
```typescript
// src/services/OrderService.ts
class OrderService {
  async getUserOrders(userId: string) {
    return await prisma.order.findMany({
      where: { user_id: userId },
      include: { product: true }
    });
  }
}
```

**3. Create validator (if needed):**
```typescript
// src/validators/OrderValidator.ts
class OrderValidator {
  validateGetOrders(userId: string) {
    if (!userId) throw new Error("User ID is required");
  }
}
```

**4. Create controller:**
```typescript
// src/controllers/OrderController.ts
class OrderController {
  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      OrderValidator.validateGetOrders(userId);
      
      const orders = await OrderService.getUserOrders(userId);
      
      return res.status(200).json(
        successResponse("Orders retrieved", { orders })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}
```

**5. Create route:**
```typescript
// src/routes/order.routes.ts
import OrderController from "../controllers/OrderController";
import authMiddleware from "../middleware/auth";

const router = express.Router();
router.get("/", authMiddleware, OrderController.getUserOrders);

export default router;
```

**6. Register route:**
```typescript
// src/routes/routes.ts
import orderRoutes from "./order.routes";
router.use("/orders", orderRoutes);
```

---

## Best Practices

### Controllers
- ✅ Keep methods under 50 lines
- ✅ Handle HTTP concerns only
- ✅ Always use try-catch
- ✅ Use services for business logic
- ✅ Use validators for input validation
- ❌ No database access directly
- ❌ No complex calculations
- ❌ No business rules

### Services
- ✅ Pure business logic
- ✅ Database operations
- ✅ Reusable methods
- ✅ Throw errors for exceptional cases
- ✅ Single Responsibility Principle
- ❌ No HTTP response handling
- ❌ No request/response objects

### Validators
- ✅ Validate all inputs
- ✅ Clear error messages
- ✅ Fail fast
- ✅ Throw errors for invalid data
- ❌ No business logic
- ❌ No database access

### Utils
- ✅ Pure functions
- ✅ No side effects
- ✅ Reusable across application
- ❌ No business logic
- ❌ No state management

---

## Testing Strategy

### Unit Tests
- **Services:** Test business logic in isolation
- **Validators:** Test validation rules
- **Utils:** Test helper functions

### Integration Tests
- **Controllers:** Test with mocked services
- **Routes:** Test full endpoint with database

### Example Service Test:
```typescript
describe('CartService', () => {
  it('should validate insufficient stock', async () => {
    const product = { stock: 5 };
    const quantity = 10;
    
    await expect(
      CartService.validateStock(product, quantity)
    ).rejects.toThrow('Insufficient stock');
  });
});
```

---

## Migration Notes

### What Changed
- **Before:** Fat controllers with business logic, validation, and database access mixed together
- **After:** Thin controllers delegating to services, validators, and utils

### Refactored Controllers
- ✅ CheckoutController (from 300+ lines to ~140 lines)
- ✅ CartController (from 400+ lines to ~180 lines)
- ✅ ProductController (from 350+ lines to ~150 lines)

### New Files Created
- 3 Service files (CheckoutService, CartService, ProductService)
- 3 Validator files (CheckoutValidator, CartValidator, ProductValidator)
- 2 Util files (responseFormatter, errorHandler)

---

## Performance Considerations

- Services enable caching strategies
- Reusable methods reduce duplicate code
- Clear separation allows for optimization of specific layers
- Database queries centralized in services for monitoring

---

## Future Improvements

- [ ] Add repository layer for database abstraction
- [ ] Implement caching in service layer
- [ ] Add request/response DTOs (Data Transfer Objects)
- [ ] Implement event-driven architecture for complex workflows
- [ ] Add comprehensive logging in services
- [ ] Implement rate limiting middleware

---

**Last Updated:** 2025-11-20
**Architecture Version:** 2.0
