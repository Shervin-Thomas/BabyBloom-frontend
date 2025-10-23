import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export default function AdminECommerceScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Load products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Load orders count and total revenue
      const { data: ordersData, count: ordersCount } = await supabase
        .from('orders')
        .select('total_amount', { count: 'exact' });

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Load users count
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Load pending orders count
      const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Load low stock products count
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 10)
        .eq('is_active', true);

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue: totalRevenue,
        totalUsers: usersCount || 0,
        pendingOrders: pendingOrdersCount || 0,
        lowStockProducts: lowStockCount || 0,
      });
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    isCurrency = false,
    subtitle 
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    isCurrency?: boolean;
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>
        {isCurrency ? formatCurrency(value) : value.toLocaleString()}
      </Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ActionButton = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    icon: any;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.actionButtonText}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0EA5E9', '#38BDF8', '#7DD3FC']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>E-Commerce Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage your online store</Text>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon="cube"
                color="#0EA5E9"
                subtitle="Active products"
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon="receipt"
                color="#10B981"
                subtitle="All time"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Revenue"
                value={stats.totalRevenue}
                icon="cash"
                color="#F59E0B"
                isCurrency={true}
                subtitle="All time sales"
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="people"
                color="#8B5CF6"
                subtitle="Registered users"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Pending Orders"
                value={stats.pendingOrders}
                icon="time"
                color="#EF4444"
                subtitle="Needs attention"
              />
              <StatCard
                title="Low Stock"
                value={stats.lowStockProducts}
                icon="warning"
                color="#F97316"
                subtitle="Products < 10"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionsGrid}>
              <ActionButton
                title="Manage Products"
                icon="cube"
                color="#0EA5E9"
                onPress={() => Alert.alert('Coming Soon', 'Product management feature will be available soon!')}
              />
              
              <ActionButton
                title="View Orders"
                icon="receipt"
                color="#10B981"
                onPress={() => Alert.alert('Coming Soon', 'Orders management feature will be available soon!')}
              />
              
              <ActionButton
                title="Manage Categories"
                icon="grid"
                color="#8B5CF6"
                onPress={() => Alert.alert('Coming Soon', 'Categories management feature will be available soon!')}
              />
              
              <ActionButton
                title="View Customers"
                icon="people"
                color="#F59E0B"
                onPress={() => Alert.alert('Coming Soon', 'Customer management feature will be available soon!')}
              />
              
              <ActionButton
                title="Discount Codes"
                icon="pricetag"
                color="#EF4444"
                onPress={() => Alert.alert('Coming Soon', 'Discount codes management feature will be available soon!')}
              />
              
              <ActionButton
                title="Analytics"
                icon="analytics"
                color="#06B6D4"
                onPress={() => Alert.alert('Coming Soon', 'Analytics feature will be available soon!')}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="cube" size={16} color="#0EA5E9" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>System Initialized</Text>
                  <Text style={styles.activityTime}>Admin panel ready to use</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Database Connected</Text>
                  <Text style={styles.activityTime}>All systems operational</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  activityContainer: {},
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
  },
});