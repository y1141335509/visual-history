import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { HistoryEvent } from '@/types/timeline';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const prompt = `请为历史主题"${keyword}"生成5-8个最重要的历史事件。

要求：
1. 返回严格的JSON格式数组
2. 每个事件包含：id, date, title, description
3. date格式：年份（如"618年"、"1949年10月1日"）
4. title：简洁的事件名称（不超过20字）
5. description：事件描述（50-100字）
6. 按时间顺序排列
7. 确保历史准确性

示例格式：
[
  {
    "id": "1",
    "date": "618年",
    "title": "唐朝建立",
    "description": "李渊在长安称帝，建立唐朝，结束了隋朝统治，开启了中国历史上的盛世王朝。"
  }
]`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // 提取JSON内容
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const events: HistoryEvent[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ events, keyword });
  } catch (error) {
    console.error('Timeline generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}