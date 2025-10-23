import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function AdminUIScreen() {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const ThemeCard = ({ 
    title, 
    colors, 
    isSelected, 
    onSelect 
  }: {
    title: string;
    colors: string[];
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.themeCard, isSelected && styles.themeCardSelected]} 
      onPress={onSelect}
    >
      <LinearGradient colors={colors} style={styles.themePreview}>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </LinearGradient>
      <Text style={styles.themeTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const SettingToggle = ({ 
    title, 
    subtitle, 
    icon, 
    value, 
    onToggle 
  }: {
    title: string;
    subtitle: string;
    icon: any;
    value: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onToggle}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color="#0EA5E9" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
      </View>
    </TouchableOpacity>
  );

  const UIComponent = ({ 
    title, 
    description, 
    icon, 
    color,
    onPress 
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.componentCard} onPress={onPress}>
      <View style={[styles.componentIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.componentContent}>
        <Text style={styles.componentTitle}>{title}</Text>
        <Text style={styles.componentDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0EA5E9', '#38BDF8', '#7DD3FC']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>UI & Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your admin experience</Text>
          </View>

          {/* Theme Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme Selection</Text>
            <View style={styles.themesContainer}>
              <ThemeCard
                title="Sky Blue (Current)"
                colors={['#0EA5E9', '#38BDF8', '#7DD3FC']}
                isSelected={selectedTheme === 'light'}
                onSelect={() => setSelectedTheme('light')}
              />
              <ThemeCard
                title="Dark Mode"
                colors={['#1E293B', '#334155', '#475569']}
                isSelected={selectedTheme === 'dark'}
                onSelect={() => {
                  setSelectedTheme('dark');
                  Alert.alert('Coming Soon', 'Dark mode theme will be available in the next update!');
                }}
              />
            </View>
          </View>

          {/* UI Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interface Settings</Text>
            <View style={styles.settingsCard}>
              <SettingToggle
                title="Push Notifications"
                subtitle="Receive real-time updates"
                icon="notifications"
                value={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              />
              <SettingToggle
                title="Sound Effects"
                subtitle="Enable UI interaction sounds"
                icon="volume-high"
                value={soundEnabled}
                onToggle={() => setSoundEnabled(!soundEnabled)}
              />
            </View>
          </View>

          {/* UI Components */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UI Components</Text>
            <View style={styles.componentsGrid}>
              <UIComponent
                title="Color Palette"
                description="Manage app color schemes"
                icon="color-palette"
                color="#8B5CF6"
                onPress={() => Alert.alert('Color Palette', 'Color management system coming soon!')}
              />
              
              <UIComponent
                title="Typography"
                description="Font styles and sizes"
                icon="text"
                color="#10B981"
                onPress={() => Alert.alert('Typography', 'Font management system coming soon!')}
              />
              
              <UIComponent
                title="Layout Grid"
                description="Responsive layout system"
                icon="grid"
                color="#F59E0B"
                onPress={() => Alert.alert('Layout Grid', 'Layout management system coming soon!')}
              />
              
              <UIComponent
                title="Icons Library"
                description="Browse and manage icons"
                icon="library"
                color="#EF4444"
                onPress={() => Alert.alert('Icons Library', 'Icon management system coming soon!')}
              />
              
              <UIComponent
                title="Animation Settings"
                description="Control app animations"
                icon="play-circle"
                color="#06B6D4"
                onPress={() => Alert.alert('Animations', 'Animation settings coming soon!')}
              />
              
              <UIComponent
                title="Responsive Design"
                description="Multi-device compatibility"
                icon="phone-portrait"
                color="#F97316"
                onPress={() => Alert.alert('Responsive Design', 'Responsive design tools coming soon!')}
              />
            </View>
          </View>

          {/* Preview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UI Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Current Theme Preview</Text>
              <View style={styles.previewContent}>
                <View style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Primary Button</Text>
                </View>
                <View style={styles.previewButtonSecondary}>
                  <Text style={styles.previewButtonSecondaryText}>Secondary Button</Text>
                </View>
                <View style={styles.previewInput}>
                  <Text style={styles.previewInputText}>Input Field Preview</Text>
                </View>
              </View>
            </View>
          </View>

          {/* System Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>UI Framework</Text>
                <Text style={styles.infoValue}>React Native</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Theme Engine</Text>
                <Text style={styles.infoValue}>Custom Sky Blue</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>Today</Text>
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
  section: {
    marginBottom: 24,
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
  themesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  themeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  themePreview: {
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#0EA5E9',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  componentsGrid: {
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
  componentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  componentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  componentContent: {
    flex: 1,
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  componentDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  previewContent: {
    gap: 12,
  },
  previewButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewButtonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  previewButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  previewInput: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewInputText: {
    fontSize: 14,
    color: '#64748B',
  },
  infoCard: {
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
});