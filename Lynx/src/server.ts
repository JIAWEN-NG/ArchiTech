import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'TikTok AI Backend for Lynx',
    aiConnected: !!openai
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context = 'caption_generation', previousMessages = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let aiResponse = '';

    if (openai) {
      // Real AI response
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert TikTok content creator and social media strategist. Help users create engaging, viral-worthy captions and content ideas. Context: ${context}`
            },
            // Include recent conversation history
            ...previousMessages.slice(-4).map((msg: any) => ({
              role: msg.from === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.text
            })),
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        aiResponse = `I'm having trouble with the AI service right now. Here's a suggestion for "${message}": Try creating engaging content that asks questions or shows behind-the-scenes moments!`;
      }
    } else {
      // Fallback responses when no API key
      const fallbackResponses = [
        `Great idea! For "${message}", try adding a hook at the beginning like "Wait for it..." or "You won't believe what happens next!" 🎬`,
        `For content about "${message}", consider using trending hashtags like #fyp #viral #trending and ask your audience a question to boost engagement! 🚀`,
        `Here's a caption idea for "${message}": Start with an emoji, add intrigue, and end with a call-to-action. Don't forget relevant hashtags! ✨`,
        `To make "${message}" go viral, try the 3-second rule - hook viewers in the first 3 seconds with something unexpected! 🔥`
      ];
      
      aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    res.json({
      reply: aiResponse,
      timestamp: new Date().toISOString(),
      context,
      usingAI: !!openai
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: 'Please try again later'
    });
  }
});

// Caption generation endpoint
app.post('/api/captions/generate', async (req, res) => {
  try {
    const { description, style = 'engaging', includeHashtags = true } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Content description is required' });
    }

    let caption = '';
    let alternatives: string[] = [];
    let hashtags: string[] = [];

    if (openai) {
      // Real AI caption generation
      try {
        const prompt = `Create a ${style} TikTok caption for: "${description}". 
        Style guide:
        - ${style === 'viral' ? 'Use hooks, trending phrases, create curiosity' : ''}
        - ${style === 'engaging' ? 'Ask questions, be conversational, encourage interaction' : ''}
        - ${style === 'professional' ? 'Be informative, polished, focus on value' : ''}
        - ${style === 'funny' ? 'Use humor, wit, relatable content' : ''}
        ${includeHashtags ? '- Include 3-5 relevant hashtags' : '- No hashtags needed'}
        
        Format: Just return the caption text.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a TikTok caption expert. Create engaging, platform-appropriate captions.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.8,
        });

        caption = completion.choices[0]?.message?.content || '';
        
        // Extract hashtags
        const hashtagMatch = caption.match(/#[\w]+/g);
        hashtags = hashtagMatch || [];

        // Generate alternatives
        for (let i = 0; i < 2; i++) {
          const altCompletion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Create a different TikTok caption variant.' },
              { role: 'user', content: `Create an alternative ${style} caption for: "${description}"` }
            ],
            max_tokens: 150,
            temperature: 0.9,
          });
          
          const altCaption = altCompletion.choices[0]?.message?.content;
          if (altCaption) alternatives.push(altCaption);
        }

      } catch (aiError) {
        console.error('Caption generation error:', aiError);
        // Fallback to mock
        caption = `Check out this amazing ${description}! What do you think? ${includeHashtags ? '#viral #fyp #amazing' : ''}`;
      }
    } else {
      // Mock caption generation
      const mockCaptions = {
        viral: `🔥 This ${description} is about to blow up! Can you guess what happens next? 👀 ${includeHashtags ? '#viral #trending #fyp' : ''}`,
        engaging: `What do you think about this ${description}? Drop your thoughts below! 💭 Would you try this? ${includeHashtags ? '#engaging #question #thoughts' : ''}`,
        professional: `Here's an expertly crafted ${description} that demonstrates best practices. Key takeaways: 📝 ${includeHashtags ? '#professional #tips #education' : ''}`,
        funny: `When you're trying to ${description} but life has other plans 😂 Can anyone relate? ${includeHashtags ? '#funny #relatable #comedy' : ''}`
      };

      caption = mockCaptions[style as keyof typeof mockCaptions] || mockCaptions.engaging;
      alternatives = [
        `Alternative caption for ${description}`,
        `Another creative take on ${description}`
      ];
      hashtags = includeHashtags ? ['#ai', '#generated', '#content'] : [];
    }

    res.json({
      captions: [{
        caption,
        alternatives,
        hashtags
      }],
      style,
      includeHashtags,
      usingAI: !!openai
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ error: 'Failed to generate captions' });
  }
});

// Trends endpoint
app.get('/api/trends', async (req, res) => {
  try {
    const category = (req.query.category as string) || 'general';
    
    let trends, hashtags, suggestions;

    if (openai) {
      // Real AI trends
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a social media trend expert. Provide current trending topics and hashtags.'
            },
            {
              role: 'user',
              content: `What are 5 current trending topics, 5 trending hashtags, and 3 content suggestions for ${category} content on TikTok?`
            }
          ],
          max_tokens: 300,
          temperature: 0.6,
        });

        const response = completion.choices[0]?.message?.content || '';
        
        // Simple parsing (you can make this more sophisticated)
        trends = [
          'AI-generated content',
          'Behind-the-scenes videos',
          'Quick tutorials',
          'Day-in-the-life content',
          'Reaction videos'
        ];
        
        hashtags = response.match(/#[\w]+/g)?.slice(0, 5) || ['#trending', '#viral', '#fyp', '#content', '#tiktok'];
        
        suggestions = [
          'Show your creative process',
          'Ask engaging questions in your captions',
          'Use trending audio tracks'
        ];

      } catch (aiError) {
        console.error('Trends API error:', aiError);
        // Fallback to defaults
      }
    }

    // Default trends if AI fails or not available
    if (!trends) {
      trends = [
        'Behind-the-scenes content',
        'Day-in-the-life videos',
        'Quick tutorials and tips',
        'Before/after transformations',
        'Reaction and response videos'
      ];
      hashtags = ['#trending', '#viral', '#fyp', '#foryou', '#content'];
      suggestions = [
        'Show your authentic self',
        'Engage with your audience through questions',
        'Post consistently for better reach'
      ];
    }

    res.json({
      trends,
      hashtags,
      suggestions,
      category,
      lastUpdated: new Date().toISOString(),
      usingAI: !!openai
    });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 TikTok AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📝 Caption API: http://localhost:${PORT}/api/captions/generate`);
  console.log(`📈 Trends API: http://localhost:${PORT}/api/trends`);
  
  if (openai) {
    console.log(`✅ OpenAI connected - Real AI responses enabled`);
  } else {
    console.log(`⚠️  No OpenAI API key - Using fallback responses`);
    console.log(`💡 Add OPENAI_API_KEY to .env for real AI responses`);
  }
});

export default app;