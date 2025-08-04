import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { supabase } from 'lib/supabase';

interface RegisterProps {
  onSwitchToLogin?: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          dob: dateOfBirth
        }
      }
    });
    
    if (error) Alert.alert('Registration failed', error.message);
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
            onChangeText={setEmail}
            value={email}
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
        
        {/* Date of Birth Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>📅</Text>
          <TextInput
            placeholder="Date of Birth"
            style={styles.input}
            onChangeText={setDateOfBirth}
            value={dateOfBirth}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        
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
