# 🤖 Rasa AI Chatbot Setup Guide

## Overview
Bloom Bot now uses Rasa, an open-source conversational AI framework that provides:
- ✅ **Free & Open Source** - No API costs
- ✅ **Natural Language Understanding** - Intent recognition and entity extraction
- ✅ **Contextual Conversations** - Remembers conversation context
- ✅ **Customizable** - Train your own models
- ✅ **Privacy-Focused** - Data stays on your server

## Quick Start (Using Fallback Responses)

**Current Status**: The chatbot works immediately with intelligent fallback responses while you set up Rasa.

1. **Test the chatbot now** - It uses smart keyword-based responses
2. **Follow setup below** for full AI capabilities

## Full Rasa Setup

### Step 1: Install Rasa

```bash
# Install Python 3.8+ first, then:
pip install rasa

# Or using conda:
conda install -c conda-forge rasa
```

### Step 2: Create Rasa Project

```bash
# Create a new directory for your Rasa bot
mkdir bloom-rasa-bot
cd bloom-rasa-bot

# Initialize Rasa project
rasa init --no-prompt
```

### Step 3: Customize for BabyBloom

Create/edit `domain.yml`:
```yaml
version: "3.1"

intents:
  - greet
  - goodbye
  - affirm
  - deny
  - mood_great
  - mood_unhappy
  - bot_challenge
  - ask_pregnancy
  - ask_health
  - ask_nutrition
  - ask_exercise

entities:
  - trimester
  - symptom
  - food_type

responses:
  utter_greet:
  - text: "Hello! I'm Bloom Bot, your AI assistant for health and pregnancy! How can I help you today? 😊"

  utter_cheer_up:
  - text: "Here's something to cheer you up! Remember, every pregnancy journey is unique and beautiful. 🌸"

  utter_did_that_help:
  - text: "Did that help you? Feel free to ask me anything about health, pregnancy, or lifestyle! 💕"

  utter_happy:
  - text: "Great! I'm so glad I could help! 🎉"

  utter_goodbye:
  - text: "Goodbye! Take care and remember I'm here whenever you need support! 👋"

  utter_iamabot:
  - text: "I'm Bloom Bot, an AI assistant powered by Rasa! I'm here to help with health, pregnancy, and lifestyle questions. 🤖✨"

  utter_pregnancy_info:
  - text: "Pregnancy is an amazing journey! I can help with information about trimesters, nutrition, exercise, and general wellness. What would you like to know? 🤱"

  utter_health_info:
  - text: "Health and wellness are so important! I can provide general information, but always consult healthcare professionals for medical advice. What health topic interests you? 🏥"

session_config:
  session_expiration_time: 60
  carry_over_slots_to_new_session: true
```

### Step 4: Train the Model

```bash
# Train your Rasa model
rasa train

# This creates a model in the models/ directory
```

### Step 5: Start Rasa Server

```bash
# Start Rasa server with API and CORS enabled
rasa run --enable-api --cors "*" --port 5005

# Server will be available at http://localhost:5005
```

### Step 6: Update App Configuration

The app is already configured! Just make sure your `.env.local` has:
```
EXPO_PUBLIC_RASA_URL=http://localhost:5005
```

### Step 7: Test the Integration

1. **Start your Rasa server** (Step 5)
2. **Start your React Native app**
3. **Navigate to Bloom Bot tab**
4. **Send a message** - it will now use Rasa AI!

## Advanced Configuration

### Custom Training Data

Edit `data/nlu.yml` to add pregnancy/health-specific training examples:

```yaml
version: "3.1"

nlu:
- intent: ask_pregnancy
  examples: |
    - I'm pregnant
    - What should I expect in my second trimester?
    - Tell me about pregnancy symptoms
    - I'm having morning sickness
    - When should I see a doctor during pregnancy?

- intent: ask_nutrition
  examples: |
    - What should I eat during pregnancy?
    - Are there foods I should avoid?
    - I need nutrition advice
    - What vitamins should I take?
    - Healthy pregnancy diet

- intent: ask_exercise
  examples: |
    - Can I exercise while pregnant?
    - What exercises are safe?
    - Prenatal yoga
    - Walking during pregnancy
```

### Production Deployment

For production, deploy Rasa to:
- **Docker**: `rasa run --enable-api --cors "*" --port 5005`
- **Cloud providers**: AWS, Google Cloud, Azure
- **Rasa X**: For conversation management

Update `EXPO_PUBLIC_RASA_URL` to your production server URL.

## Troubleshooting

### Rasa Server Not Starting
```bash
# Check if port 5005 is in use
netstat -an | grep 5005

# Use different port
rasa run --enable-api --cors "*" --port 5006
```

### Connection Issues
- Ensure Rasa server is running
- Check firewall settings
- Verify CORS is enabled
- Check the URL in `.env.local`

### Model Training Issues
```bash
# Validate your configuration
rasa data validate

# Debug training
rasa train --debug
```

## Current Features

✅ **Intelligent Fallback** - Works without Rasa server
✅ **Rasa Integration** - Full AI when server is running
✅ **Conversation Memory** - Remembers context
✅ **Error Handling** - Graceful fallbacks
✅ **Health Focus** - Optimized for pregnancy/health topics

## Next Steps

1. **Test current fallback responses**
2. **Install and configure Rasa**
3. **Train custom models for pregnancy/health**
4. **Deploy to production server**
5. **Monitor and improve conversations**

Your Bloom Bot is ready to provide intelligent, contextual conversations! 🚀
