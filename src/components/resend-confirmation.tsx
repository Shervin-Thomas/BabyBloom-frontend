import { TouchableOpacity, Text, Alert } from 'react-native';
import { supabase } from 'lib/supabase';

export function ResendConfirmation({ email }: { email: string }) {
  const resendConfirmation = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Confirmation email sent!');
    }
  };

  return (
    <TouchableOpacity onPress={resendConfirmation}>
      <Text style={{ color: 'white', textDecorationLine: 'underline' }}>
        Resend confirmation email
      </Text>
    </TouchableOpacity>
  );
}