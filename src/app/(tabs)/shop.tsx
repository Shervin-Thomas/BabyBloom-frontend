import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  FlatList, 
  Image, 
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';
import { shopService, Product, ProductCategory } from '../../services/shopService';
import { useShop } from '../../../contexts/ShopContext';

// CartIcon component defined in the same file
interface CartIconProps {
  color: string;
  size: number;
  focused: boolean;
  cartCount?: number;
}

export function CartIcon({ color, size, focused }: Omit<CartIconProps, 'cartCount'>) {
  const { cartCount } = useShop();
  
  return (
    <View style={cartIconStyles.container}>
      <Ionicons 
        name={focused ? "bag" : "bag-outline"} 
        size={size} 
        color={color} 
      />
      {cartCount > 0 && (
        <View style={cartIconStyles.badge}>
          <Text style={cartIconStyles.badgeText}>
            {cartCount > 99 ? '99+' : cartCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const cartIconStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const { width } = Dimensions.get('window');

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
}

function ProductCard({ product, onPress, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  
  return (
    <TouchableOpacity style={productStyles.card} onPress={onPress}>
      <View style={productStyles.imageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage.image_url }} style={productStyles.image} />
        ) : (
          <View style={productStyles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {product.compare_at_price && product.compare_at_price > product.price && (
          <View style={productStyles.saleBadge}>
            <Text style={productStyles.saleBadgeText}>SALE</Text>
          </View>
        )}
        
        <TouchableOpacity style={productStyles.wishlistBtn} onPress={onAddToWishlist}>
          <Ionicons name="heart-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={productStyles.content}>
        <Text style={productStyles.brand}>{product.brand || 'BabyBloom'}</Text>
        <Text style={productStyles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={productStyles.description} numberOfLines={2}>
          {product.short_description || product.description}
        </Text>
        
        <View style={productStyles.priceContainer}>
          <Text style={productStyles.price}>${product.price.toFixed(2)}</Text>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <Text style={productStyles.comparePrice}>
              ${product.compare_at_price.toFixed(2)}
            </Text>
          )}
        </View>
        
        <TouchableOpacity style={productStyles.addButton} onPress={onAddToCart}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={productStyles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

interface CategoryCardProps {
  category: ProductCategory;
  onPress: () => void;
}

function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={categoryStyles.card} onPress={onPress}>
      {category.image_url ? (
        <Image source={{ uri: category.image_url }} style={categoryStyles.image} />
      ) : (
        <View style={categoryStyles.placeholderImage}>
          <Text style={categoryStyles.placeholderText}>{category.name.charAt(0)}</Text>
        </View>
      )}
      <Text style={categoryStyles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { addToCart, addToWishlist, cartCount } = useShop();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || selectedCategory) {
      loadProducts();
    }
  }, [searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load categories and featured products in parallel
      const [categoriesData, featuredData] = await Promise.all([
        shopService.getCategories(),
        shopService.getFeaturedProducts(6)
      ]);
      
      setCategories(categoriesData);
      setFeaturedProducts(featuredData);
      
      // Load all products initially
      const allProducts = await shopService.getProducts({ limit: 20 });
      setProducts(allProducts);
      
    } catch (error) {
      console.error('Error loading shop data:', error);
      Alert.alert('Error', 'Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await shopService.getProducts({
        search: searchQuery.trim() || undefined,
        category_id: selectedCategory || undefined,
        limit: 20
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      await addToWishlist(product.id);
      Alert.alert('Success', `${product.name} added to wishlist!`);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Login Required', 'Please log in to add items to your wishlist');
    }
  };

  const handleProductPress = (product: Product) => {
    // Navigate to product details (we'll create this later)
    router.push(`/shop/product/${product.id}`);
  };

  const handleCategoryPress = (category: ProductCategory) => {
    setSelectedCategory(selectedCategory === category.id ? null : category.id);
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    loadInitialData();
  };

  if (loading) {
    return (
      <ImageBackground 
        source={require('../../../assets/images/bg1.jpg')} 
        style={styles.container}
        resizeMode="cover"
      >
        <GradientHeader 
          title="Shop"
          iconName="bag"
          rightButton={{
            icon: 'bag-outline',
            onPress: () => router.push('/shop/cart'),
            badge: cartCount > 0 ? cartCount.toString() : undefined
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC7596" />
          <Text style={styles.loadingText}>Loading shop...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={require('../../../assets/images/bg1.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Shop"
        iconName="bag"
        rightButton={{
          icon: 'bag-outline',
          onPress: () => router.push('/shop/cart'),
          badge: cartCount > 0 ? cartCount.toString() : undefined
        }}
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {selectedCategory && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFilters}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <View key={category.id} style={[
                  categoryStyles.wrapper,
                  selectedCategory === category.id && categoryStyles.selectedWrapper
                ]}>
                  <CategoryCard
                    category={category}
                    onPress={() => handleCategoryPress(category)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Products (show only when no search/filter) */}
        {!searchQuery && !selectedCategory && featuredProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.productsRow}>
                {featuredProducts.map((product) => (
                  <View key={product.id} style={styles.productWrapper}>
                    <ProductCard
                      product={product}
                      onPress={() => handleProductPress(product)}
                      onAddToCart={() => handleAddToCart(product)}
                      onAddToWishlist={() => handleAddToWishlist(product)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* All Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Products`
              : searchQuery 
                ? `Search Results for "${searchQuery}"`
                : 'All Products'
            }
          </Text>
          
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or browse our categories
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <View key={product.id} style={styles.productGridItem}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    onAddToCart={() => handleAddToCart(product)}
                    onAddToWishlist={() => handleAddToWishlist(product)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  clearFilters: {
    fontSize: 14,
    color: '#FC7596',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  productsRow: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  productWrapper: {
    marginHorizontal: 8,
    width: width * 0.7,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  productGridItem: {
    width: '48%',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

const categoryStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
    padding: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWrapper: {
    borderColor: '#FC7596',
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
  },
});

const productStyles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  saleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  brand: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FC7596',
  },
  comparePrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC7596',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

