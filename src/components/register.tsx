import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { useState } from 'react';
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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
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
        // Create profile in database
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
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration failed', 'An unexpected error occurred');
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          phone: phone,
          date_of_birth: dateOfBirth.toISOString().split('T')[0]
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationBox}>
            <View style={styles.character}>
              <Text style={styles.characterEmoji}>🧑‍💼</Text>
            </View>
            <View style={[styles.decorativeCircle, styles.topRight]} />
            <View style={[styles.decorativeCircle, styles.bottomLeft, { backgroundColor: '#8B5CF6' }]} />
            <View style={[styles.decorativeCircle, styles.bottomRight, { backgroundColor: '#A855F7' }]} />
          </View>
        </View>

        <Text style={styles.title}>Register</Text>
        
        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            onChangeText={setFullName}
            value={fullName}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>@</Text>
          <TextInput
            placeholder="Email ID"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>📱</Text>
          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            value={phone}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
        {/* Date of Birth Picker */}
        <TouchableOpacity 
          style={styles.inputContainer} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.inputIcon}>📅</Text>
          <View style={styles.datePickerContainer}>
            <Text style={styles.dateText}>
              {formatDate(dateOfBirth)}
            </Text>
            <Text style={styles.dateLabel}>Date of Birth</Text>
          </View>
        </TouchableOpacity>

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
        
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
        
        <Text style={styles.orSocialText}>Or, register with ...</Text>
        
        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSwitchToLogin}>
            <Text style={styles.loginLinkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FC7596',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationBox: {
    width: 256,
    height: 192,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  character: {
    width: 80,
    height: 80,
    backgroundColor: '#F3E8FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterEmoji: {
    fontSize: 32,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
  },
  topRight: {
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    backgroundColor: '#F472B6',
  },
  bottomLeft: {
    bottom: 24,
    left: 24,
    width: 16,
    height: 16,
  },
  bottomRight: {
    bottom: 32,
    right: 32,
    width: 12,
    height: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 8,
    marginBottom: 16,
  },
  inputIcon: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 8,
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  datePickerContainer: {
    flex: 1,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
  },
  dateLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  registerButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#FC7596',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  orSocialText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 32,
    alignItems: 'center',
  },
  googleText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLinkText: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
