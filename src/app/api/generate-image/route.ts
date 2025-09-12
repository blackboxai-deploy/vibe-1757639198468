import { NextRequest, NextResponse } from 'next/server';
// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';
// import { UserService } from '@/lib/user-service';

export const maxDuration = 300; // 5 minutes for image generation

interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}

// Demo mode - track generations in memory (resets on restart)
let demoGenerationCount = 0;
const DEMO_DAILY_LIMIT = 10;

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompt, width = 1024, height = 1024, model = "replicate/black-forest-labs/flux-1.1-pro" } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // For now, run in demo mode only
    // TODO: Implement full authentication when Supabase is configured
    const isAuthenticated = false;
    const userId = null;

    // Demo mode limitation check
    if (demoGenerationCount >= DEMO_DAILY_LIMIT) {
      return NextResponse.json(
        { 
          error: `Demo limit of ${DEMO_DAILY_LIMIT} generations reached. Sign up for unlimited access!`,
          isDemo: true,
          isAuthenticated: false
        },
        { status: 403 }
      );
    }

    // Enhanced prompt with technical specifications
    const enhancedPrompt = `${prompt.trim()}, high quality, detailed, professional photography, 8k resolution, masterpiece`;

    console.log('Starting image generation (Demo Mode)');
    console.log('Using prompt:', enhancedPrompt);
    console.log('Using model:', model);
    console.log('Dimensions:', `${width}x${height}`);
    console.log('Demo generations used:', demoGenerationCount, '/', DEMO_DAILY_LIMIT);

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_STRkIoYmokvKxA',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('AI API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to generate image', 
          details: `AI returned ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log('AI API Response received');

    // Extract image URL from response
    let imageUrl = '';
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      
      // Check if content is a direct URL
      if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('https'))) {
        imageUrl = content.trim();
      } else {
        // Try to extract URL from text response
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          imageUrl = urlMatch[1];
        }
      }
    }

    if (!imageUrl) {
      console.error('No image URL found in response:', result);
      return NextResponse.json(
        { 
          error: 'No image generated', 
          details: 'AI service did not return a valid image URL',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Demo mode only for now
    demoGenerationCount++;

    console.log('Image generated successfully (demo mode)');

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      settings: {
        width,
        height,
        model
      },
      isDemo: true,
      isAuthenticated: false,
      generationsUsed: demoGenerationCount,
      generationsRemaining: DEMO_DAILY_LIMIT - demoGenerationCount,
      timestamp: new Date().toISOString(),
      message: demoGenerationCount >= 8 ? "2 generations left! Sign up for unlimited access." : undefined
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}