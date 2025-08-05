import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform, Image } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from 'lib/supabase';

interface RegisterProps {
  onSwitchToLogin?: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const createUserProfile = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            date_of_birth: dateOfBirth.toISOString().split('T')[0]
          },
          emailRedirectTo: 'https://shervin-thomas.github.io/BabyBloom-frontend/confirmation.html'
        }
      });
      
      if (error) {
        Alert.alert('Registration failed', error.message);
        return;
      }

      if (data.user) {
        await createUserProfile(data.user.id);
        
        Alert.alert(
          'Check Your Email', 
          'We sent you a confirmation email. Please check your inbox and click the confirmation link, then return to login.',
          [
            {
              text: 'Go to Login',
              onPress: () => onSwitchToLogin?.()
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Registration failed', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['#FC7596', '#FF9A9E', '#FECFEF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.logoCircle}
              >
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>Join BabyBloom</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#FC7596" style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name"
                  style={styles.input}
                  onChangeText={setFullName}
                  value={fullName}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#FC7596" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  value={email}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            {/* Phone Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#FC7596" style={styles.inputIcon} />
                <TextInput
                  placeholder="Phone Number"
                  style={styles.input}
                  keyboardType="phone-pad"
                  onChangeText={setPhone}
                  value={phone}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#FC7596" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  value={password}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#FC7596" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm Password"
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Date of Birth Picker */}
            <View style={styles.inputWrapper}>
              <TouchableOpacity 
                style={styles.inputContainer} 
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#FC7596" style={styles.inputIcon} />
                <View style={styles.datePickerContainer}>
                  <Text style={styles.dateText}>
                    {formatDate(dateOfBirth)}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dateOfBirth}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
            
            {/* Register Button */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.buttonGradient}
              >
                <Text style={styles.registerButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FC7596" />
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>
            
            {/* Google Button */}
            <TouchableOpacity style={styles.googleButton}>
              <View style={styles.googleContent}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>
            
            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={onSwitchToLogin}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 120, // Add extra bottom padding for tab bar
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 42,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
    fontFamily: 'Pacifico-Regular',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  datePickerContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  registerButtonText: {
    color: '#FC7596',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginHorizontal: 16,
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },
  googleText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  loginLinkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
