import OpenAI from 'openai';

export class OpenRouterService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey?: string, model: string = 'gpt-oss-20b:free') {
    const finalApiKey = apiKey || process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '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'; // Your API key here
    this.model = model;

    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: finalApiKey,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:8081", // Replace with your app's actual URL/domain in production
  "X-Title": "BabyBloom-frontend", // Replace with your app's name in production
      },
    });

    console.log('🔗 OpenRouter Service initialized with model:', this.model);
    if (!finalApiKey) {
      console.warn('⚠️ OpenRouter API Key is not set. Please set EXPO_PUBLIC_OPENROUTER_API_KEY in your .env.local file or provide it directly.');
    }
  }

  public setApiKey(key: string): void {
    // Re-initialize OpenAI client if API key changes
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: key,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:8081",
  "X-Title": "BabyBloom-frontend",
      },
    });
    console.log('🔑 OpenRouter API Key updated.');
  }

  public setModel(modelName: string): void {
    this.model = modelName;
    console.log('🧠 OpenRouter Model updated to:', modelName);
  }

  async sendMessage(
    userMessage: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
  ): Promise<string> {
    if (!this.openai.apiKey) {
      throw new Error('OpenRouter API Key is not set. Cannot send message.');
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...history,
      { role: 'user', content: userMessage } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam,
    ];

    try {
      console.log('📤 Sending message to OpenRouter with model:', this.model);
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
      });

      const botResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response at this time.';
      console.log('📥 Received OpenRouter response:', botResponse);
      return botResponse;
    } catch (error) {
      console.error('❌ Error communicating with OpenRouter:', error);
      throw error;
    }
  }
}

export const openRouterService = new OpenRouterService();
