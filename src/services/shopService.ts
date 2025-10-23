import { supabase } from '../../lib/supabase';

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  sku: string;
  category_id?: string;
  brand?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  is_active: boolean;
  is_featured: boolean;
  age_group?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Relations
  category?: ProductCategory;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  average_rating?: number;
  review_count?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_category_id?: string;
  is_active: boolean;
  display_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price?: number;
  stock_quantity: number;
  variant_options?: Record<string, string>;
  image_url?: string;
  is_active: boolean;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
  // Relations
  product?: Product;
  variant?: ProductVariant;
}

export interface ShoppingCart {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  customer_email: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  billing_address: any;
  shipping_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method?: string;
  payment_transaction_id?: string;
  shipping_method?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  product_sku: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer: number;
  used_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at?: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  is_public: boolean;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  variant_id?: string;
  created_at: string;
  // Relations
  product?: Product;
  variant?: ProductVariant;
}

class ShopService {
  // Product Methods
  async getProducts(options: {
    category_id?: string;
    is_featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sort?: 'name' | 'price' | 'created_at';
    sort_direction?: 'asc' | 'desc';
  } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:product_categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('is_active', true);

    if (options.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options.is_featured !== undefined) {
      query = query.eq('is_featured', options.is_featured);
    }

    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options.sort) {
      query = query.order(options.sort, { ascending: options.sort_direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Product[];
  }

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as Product;
  }

  async getFeaturedProducts(limit: number = 6) {
    return this.getProducts({ is_featured: true, limit });
  }

  // Category Methods
  async getCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data as ProductCategory[];
  }

  async getCategory(id: string) {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProductCategory;
  }

  // Cart Methods
  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    // First, verify current auth state
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // If userId is provided but doesn't match current auth, use session instead
    if (userId && currentUser && userId !== currentUser.id) {
      console.warn('UserId mismatch with auth state, falling back to session');
      userId = undefined;
    }

    let query = supabase.from('shopping_cart').select('*');

    if (userId && currentUser) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId).is('user_id', null);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      // Cart doesn't exist, create one
      const insertData: any = {};
      
      if (userId && currentUser && userId === currentUser.id) {
        insertData.user_id = userId;
      } else if (sessionId) {
        insertData.session_id = sessionId;
      } else {
        throw new Error('Cannot create cart without valid user or session');
      }

      const { data: newCart, error: createError } = await supabase
        .from('shopping_cart')
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating cart:', createError);
        throw createError;
      }
      return newCart as ShoppingCart;
    }

    if (error) throw error;
    return data as ShoppingCart;
  }

  async getCartWithItems(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('cart_id', cart.id);

    if (error) throw error;

    return {
      ...cart,
      items: data as CartItem[]
    };
  }

  async addToCart(
    productId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
    variantId?: string
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Get product details
    const product = await this.getProduct(productId);
    
    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .eq('variant_id', variantId || null)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existingItem) {
      // Update existing item
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
          unit_price: product.price
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeFromCart(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  }

  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) throw error;
    return true;
  }

  // Order Methods
  async createOrder(orderData: {
    user_id?: string;
    customer_email: string;
    customer_phone?: string;
    billing_address: any;
    shipping_address: any;
    payment_method: string;
    cart_id: string;
    discount_code?: string;
  }) {
    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('cart_id', orderData.cart_id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = subtotal > 50 ? 0 : 10; // Free shipping over $50
    let discountAmount = 0;

    // Apply discount if provided
    if (orderData.discount_code) {
      const discount = await this.validateDiscountCode(orderData.discount_code, subtotal);
      if (discount) {
        discountAmount = discount.type === 'percentage' 
          ? Math.min(subtotal * (discount.value / 100), discount.maximum_discount_amount || Infinity)
          : discount.value;
      }
    }

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError) throw orderNumberError;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumberData,
        user_id: orderData.user_id,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        billing_address: orderData.billing_address,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product?.name || 'Unknown Product',
      product_sku: item.product?.sku || 'UNKNOWN',
      variant_name: item.variant?.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart after successful order creation
    await this.clearCart(orderData.user_id);

    return order as Order;
  }

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  }

  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data as Order;
  }

  // Wishlist Methods
  async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        items:wishlist_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default wishlist
      const { data: newWishlist, error: createError } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          name: 'My Wishlist',
          is_default: true
        })
        .select()
        .single();

      if (createError) throw createError;
      return { ...newWishlist, items: [] } as Wishlist;
    }

    if (error) throw error;
    return data as Wishlist;
  }

  async addToWishlist(productId: string, userId: string, variantId?: string) {
    const wishlist = await this.getWishlist(userId);

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlist.id,
        product_id: productId,
        variant_id: variantId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeFromWishlist(itemId: string) {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  }

  // Review Methods
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProductReview[];
  }

  async addProductReview(reviewData: {
    product_id: string;
    user_id: string;
    order_id?: string;
    rating: number;
    title?: string;
    review_text?: string;
  }) {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        ...reviewData,
        is_verified_purchase: !!reviewData.order_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Discount Methods
  async validateDiscountCode(code: string, orderAmount: number) {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) throw error;

    const discount = data as DiscountCode;
    const now = new Date();
    const startsAt = new Date(discount.starts_at);
    const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;

    // Check if discount is currently valid
    if (now < startsAt || (expiresAt && now > expiresAt)) {
      throw new Error('Discount code has expired');
    }

    // Check minimum order amount
    if (orderAmount < discount.minimum_order_amount) {
      throw new Error(`Minimum order amount is $${discount.minimum_order_amount}`);
    }

    // Check usage limits
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      throw new Error('Discount code has reached its usage limit');
    }

    return discount;
  }

  async applyDiscountCode(code: string, orderAmount: number) {
    const discount = await this.validateDiscountCode(code, orderAmount);
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = orderAmount * (discount.value / 100);
      if (discount.maximum_discount_amount) {
        discountAmount = Math.min(discountAmount, discount.maximum_discount_amount);
      }
    } else {
      discountAmount = discount.value;
    }

    return {
      discount,
      discountAmount: Math.min(discountAmount, orderAmount)
    };
  }

  // Address Methods
  async getCustomerAddresses(userId: string) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data as CustomerAddress[];
  }

  async addCustomerAddress(addressData: Omit<CustomerAddress, 'id'>) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerAddress;
  }

  async updateCustomerAddress(addressId: string, addressData: Partial<CustomerAddress>) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update(addressData)
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerAddress;
  }

  async deleteCustomerAddress(addressId: string) {
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
    return true;
  }
}

export const shopService = new ShopService();