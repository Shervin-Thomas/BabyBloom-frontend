import { supabase } from '../../../lib/supabase';
import {
  getProducts,
  getProductById,
  getProductCategories,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCartItems,
  clearCart,
  createOrder,
  getOrders,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addProductReview,
  getProductReviews,
  validateDiscountCode,
  type Product,
  type ProductCategory,
  type CartItem,
  type Order,
  type WishlistItem,
  type ProductReview,
  type DiscountCode,
} from '../shopService';

// Mock Supabase
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ShopService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Baby Onesie',
          sku: 'BO001',
          price: 19.99,
          stock_quantity: 50,
          is_active: true,
          is_featured: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Baby Blanket',
          sku: 'BB001',
          price: 29.99,
          stock_quantity: 25,
          is_active: true,
          is_featured: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 2,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProducts();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProducts);
      expect(result.total).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
    });

    it('should search products with query', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Baby Onesie',
          sku: 'BO001',
          price: 19.99,
          stock_quantity: 50,
          is_active: true,
          is_featured: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProducts({ search: 'onesie' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProducts);
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%onesie%');
    });

    it('should filter products by category', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Baby Onesie',
          sku: 'BO001',
          price: 19.99,
          stock_quantity: 50,
          is_active: true,
          is_featured: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          category_id: 'cat-1',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProducts({ categoryId: 'cat-1' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProducts);
      expect(mockQuery.eq).toHaveBeenCalledWith('category_id', 'cat-1');
    });

    it('should handle empty product list', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProducts();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle database connection error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProducts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getProductById', () => {
    it('should get product by ID successfully', async () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Baby Onesie',
        sku: 'BO001',
        price: 19.99,
        stock_quantity: 50,
        is_active: true,
        is_featured: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProduct,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProductById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle invalid product ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Product not found' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProductById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });
  });

  describe('getProductCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories: ProductCategory[] = [
        {
          id: '1',
          name: 'Baby Clothing',
          is_active: true,
          display_order: 1,
        },
        {
          id: '2',
          name: 'Baby Feeding',
          is_active: true,
          display_order: 2,
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCategories,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await getProductCategories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('Cart Operations', () => {
    const mockUserId = 'user-1';

    it('should add product to cart', async () => {
      const mockCartItem: CartItem = {
        id: '1',
        user_id: mockUserId,
        product_id: 'product-1',
        quantity: 2,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockUpsertQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockCartItem],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockUpsertQuery as any);

      const result = await addToCart(mockUserId, 'product-1', 2);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCartItem);
      expect(mockSupabase.from).toHaveBeenCalledWith('shopping_cart');
    });

    it('should update cart item quantity', async () => {
      const mockCartItem: CartItem = {
        id: '1',
        user_id: mockUserId,
        product_id: 'product-1',
        quantity: 3,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockCartItem],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockUpdateQuery as any);

      const result = await updateCartItem(mockUserId, 'product-1', 3);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCartItem);
    });

    it('should get cart items', async () => {
      const mockCartItems: CartItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          product_id: 'product-1',
          quantity: 2,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockCartItems,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockSelectQuery as any);

      const result = await getCartItems(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCartItems);
      expect(mockSelectQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });
  });

  describe('Wishlist Operations', () => {
    const mockUserId = 'user-1';

    it('should add product to wishlist', async () => {
      const mockWishlistItem: WishlistItem = {
        id: '1',
        user_id: mockUserId,
        product_id: 'product-1',
        created_at: '2024-01-01',
      };

      const mockUpsertQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockWishlistItem],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockUpsertQuery as any);

      const result = await addToWishlist(mockUserId, 'product-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWishlistItem);
      expect(mockSupabase.from).toHaveBeenCalledWith('wishlist_items');
    });
  });

  describe('Order Operations', () => {
    const mockUserId = 'user-1';

    it('should create order successfully', async () => {
      const mockOrder: Order = {
        id: '1',
        user_id: mockUserId,
        status: 'pending',
        total_amount: 59.97,
        subtotal: 49.98,
        tax_amount: 4.99,
        shipping_amount: 4.99,
        shipping_address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zip_code: '12345',
          country: 'US',
        },
        billing_address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zip_code: '12345',
          country: 'US',
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockOrderData = {
        userId: mockUserId,
        items: [
          { productId: 'product-1', quantity: 2, price: 19.99 },
          { productId: 'product-2', quantity: 1, price: 9.99 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zipCode: '12345',
          country: 'US',
        },
        billingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zipCode: '12345',
          country: 'US',
        },
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockOrder],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);

      const result = await createOrder(mockOrderData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    });
  });

  describe('Product Reviews', () => {
    const mockUserId = 'user-1';
    const mockProductId = 'product-1';

    it('should add product review successfully', async () => {
      const mockReview: ProductReview = {
        id: '1',
        user_id: mockUserId,
        product_id: mockProductId,
        rating: 5,
        title: 'Great product!',
        comment: 'Love this product, highly recommend!',
        is_verified_purchase: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockReview],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);

      const result = await addProductReview({
        userId: mockUserId,
        productId: mockProductId,
        rating: 5,
        title: 'Great product!',
        comment: 'Love this product, highly recommend!',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReview);
      expect(mockSupabase.from).toHaveBeenCalledWith('product_reviews');
    });

    it('should get product reviews successfully', async () => {
      const mockReviews: ProductReview[] = [
        {
          id: '1',
          user_id: mockUserId,
          product_id: mockProductId,
          rating: 5,
          title: 'Great product!',
          comment: 'Love this product!',
          is_verified_purchase: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockReviews,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockSelectQuery as any);

      const result = await getProductReviews(mockProductId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReviews);
      expect(mockSelectQuery.eq).toHaveBeenCalledWith('product_id', mockProductId);
    });
  });

  describe('Discount Codes', () => {
    it('should validate discount code successfully', async () => {
      const mockDiscountCode: DiscountCode = {
        id: '1',
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        minimum_order_amount: 50,
        maximum_discount_amount: 100,
        usage_limit: 100,
        used_count: 5,
        is_active: true,
        starts_at: '2024-01-01',
        expires_at: '2024-12-31',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDiscountCode,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockSelectQuery as any);

      const result = await validateDiscountCode('SAVE20', 100);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDiscountCode);
      expect(mockSelectQuery.eq).toHaveBeenCalledWith('code', 'SAVE20');
    });
  });
});