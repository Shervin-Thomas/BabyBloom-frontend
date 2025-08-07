import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '@/components/GradientHeader';

// CartIcon component defined in the same file
interface CartIconProps {
  color: string;
  size: number;
  focused: boolean;
  cartCount?: number;
}

export function CartIcon({ color, size, focused, cartCount = 0 }: CartIconProps) {
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

export default function ShopScreen() {
  return (
    <View style={styles.container}>
      <GradientHeader 
        title="🛍️ Shop" 
        subtitle="Everything for your pregnancy journey"
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Preview Card */}
        <View style={styles.cartPreviewCard}>
          <View style={styles.cartHeader}>
            <Ionicons name="bag" size={24} color="#FC7596" />
            <Text style={styles.cartTitle}>Your Cart</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.cartSubtext}>
            Cart functionality coming soon! You'll be able to add items and checkout.
          </Text>
          <TouchableOpacity style={styles.cartButton} disabled>
            <Text style={styles.cartButtonText}>View Cart (Coming Soon)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>🚧</Text>
          <Text style={styles.comingSoonText}>Coming Soon!</Text>
          <Text style={styles.comingSoonSubtext}>
            We're preparing an amazing shopping experience for you.{'\n'}
            Find everything you need for your pregnancy journey.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👶</Text>
              <Text style={styles.featureText}>Baby Products</Text>
              <Text style={styles.featureSubtext}>Clothes, toys & more</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤱</Text>
              <Text style={styles.featureText}>Maternity Wear</Text>
              <Text style={styles.featureSubtext}>Comfortable & stylish</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🍼</Text>
              <Text style={styles.featureText}>Feeding Essentials</Text>
              <Text style={styles.featureSubtext}>Bottles, bibs & more</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧸</Text>
              <Text style={styles.featureText}>Toys & Games</Text>
              <Text style={styles.featureSubtext}>Educational & fun</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  scrollContainer: {
    paddingBottom: 100, // Extra padding at bottom for tab bar
    flexGrow: 1,
  },
  cartPreviewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  cartBadge: {
    backgroundColor: '#FC7596',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  cartButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  comingSoonIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FC7596',
    textAlign: 'center',
    marginBottom: 12,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

