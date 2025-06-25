import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { NextRequest, NextResponse } from 'next/server';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: 'AIzaSyBP5MRoxrYvU5PhwlEO8xJQ4hmxRJEVXz0',
  maxOutputTokens: 2048,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file found' }, { status: 400 });
  }

  const text = await file.text();

  try {
    const humanMessage = new HumanMessage(
      `Translate the following text from French to English: ${text}`
    );
    const response = await model.invoke([humanMessage]);
    const translatedText = response.content;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}
