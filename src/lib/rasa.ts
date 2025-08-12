// Rasa Chatbot Service for Bloom Bot
export interface RasaMessage {
  recipient_id: string;
  text: string;
}

export interface RasaResponse {
  recipient_id: string;
  text?: string;
  image?: string;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  custom?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class RasaService {
  private rasaUrl: string;
  private conversationHistory: ChatMessage[] = [];
  private userId: string;

  constructor(rasaUrl?: string) {
    // Use environment variable or provided URL or default to local Rasa server
    this.rasaUrl = rasaUrl || process.env.EXPO_PUBLIC_RASA_URL || 'http://localhost:5005';
    this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🤖 Rasa Service initialized');
    console.log('📍 Rasa URL:', this.rasaUrl);
    console.log('👤 User ID:', this.userId);
  }

  async sendMessage(message: string): Promise<string> {
    try {
      console.log('📤 Sending message to Rasa:', message);

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Prepare the message for Rasa
      const rasaMessage: RasaMessage = {
        recipient_id: this.userId,
        text: message
      };

      // Send message to Rasa webhook
      const response = await fetch(`${this.rasaUrl}/webhooks/rest/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: this.userId,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`Rasa API error: ${response.status} ${response.statusText}`);
      }

      const rasaResponses: RasaResponse[] = await response.json();
      console.log('📥 Received Rasa responses:', rasaResponses);

      // Process Rasa responses
      let botResponse = '';
      if (rasaResponses && rasaResponses.length > 0) {
        // Combine all text responses
        botResponse = rasaResponses
          .filter(resp => resp.text)
          .map(resp => resp.text)
          .join(' ');
        
        // If no text responses, provide a default
        if (!botResponse) {
          botResponse = "I understand! Let me help you with that. 😊";
        }
      } else {
        botResponse = "I'm here to help! Could you tell me more about what you need? 🤖";
      }

      // Add bot response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date()
      });

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      console.log('✅ Rasa response processed successfully');
      return botResponse;

    } catch (error) {
      console.error('❌ Error communicating with Rasa:', error);
      
      // Fallback to intelligent keyword-based responses
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    console.log('🔄 Using fallback response for:', userMessage);
    
    // Intelligent keyword-based fallback responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm Bloom Bot, your AI assistant! I'm here to help with health, pregnancy, lifestyle, and any other questions you might have. How can I assist you today?";
    }
    
    if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy') || lowerMessage.includes('baby')) {
      return "Pregnancy is such an exciting journey! 🤱 I can help with information about prenatal care, nutrition, what to expect during different trimesters, and general pregnancy wellness. What specific aspect would you like to know about?";
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('medical') || lowerMessage.includes('doctor')) {
      return "Health and wellness are so important! 🏥 I can provide general health information and tips, but remember to always consult with healthcare professionals for medical advice. What health topic interests you?";
    }
    
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('eat')) {
      return "Great nutrition is key to good health! 🥗 I can share tips about balanced diets, healthy eating habits, and nutritional needs. Are you looking for general nutrition advice or something specific?";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
      return "Staying active is wonderful for both physical and mental health! 🏃‍♀️ Regular exercise can boost mood, energy, and overall wellbeing. What type of fitness activities interest you?";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('mental health')) {
      return "It's completely normal to feel stressed sometimes. 💕 Try deep breathing, meditation, gentle exercise, or talking to loved ones. Professional support is also available if needed. What's been on your mind?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're so welcome! 💖 I'm here whenever you need help, advice, or just want to have a friendly conversation. Feel free to ask me anything!";
    }
    
    // Default intelligent response
    return "That's an interesting question! 🌟 I'm here to help with all kinds of topics - from health and pregnancy to lifestyle and general advice. Could you tell me a bit more about what you're looking for? I'd love to assist you better!";
  }

  // Method to check if Rasa server is available
  async checkRasaConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.rasaUrl}/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const isConnected = response.ok;
      console.log('🔗 Rasa connection status:', isConnected ? 'Connected' : 'Disconnected');
      return isConnected;
    } catch (error) {
      console.log('🔗 Rasa connection status: Disconnected');
      return false;
    }
  }

  // Method to clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
    console.log('🧹 Conversation history cleared');
  }

  // Method to get conversation history
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  // Method to update Rasa URL
  updateRasaUrl(newUrl: string): void {
    this.rasaUrl = newUrl;
    console.log('🔄 Rasa URL updated to:', newUrl);
  }
}

// Export a singleton instance
export const rasaService = new RasaService();
