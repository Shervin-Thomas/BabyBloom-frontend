import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { supabase } from 'lib/supabase';

interface LoginProps {
  onSwitchToRegister?: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login failed', error.message);
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

        <Text style={styles.title}>Login</Text>
        
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

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        
        <Text style={styles.orText}>Or, login with ...</Text>
        
        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>New to the app? </Text>
          <TouchableOpacity onPress={onSwitchToRegister}>
            <Text style={styles.registerLinkText}>Register</Text>
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
    paddingVertical: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 32,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FC7596',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  orText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLinkText: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
