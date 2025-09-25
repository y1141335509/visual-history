import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { HistoryEvent } from '@/types/timeline';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 手动提取数据而不依赖JSON解析 - 支持多个事件
function extractDataManually(responseText: string): HistoryEvent[] {
  const events: HistoryEvent[] = [];

  try {
    console.log('Attempting manual data extraction for multiple events...');

    // 尝试按对象分割文本
    const objectPattern = /\{\s*"id"\s*:\s*"([^"]+)"\s*,[\s\S]*?\}/g;
    let match;
    let eventIndex = 1;

    while ((match = objectPattern.exec(responseText)) !== null) {
      const eventText = match[0];

      // 提取各个字段
      const id = extractFieldFromText(eventText, 'id') || eventIndex.toString();
      const date = extractFieldFromText(eventText, 'date');
      const title = extractFieldFromText(eventText, 'title');
      const description = extractFieldFromText(eventText, 'description');
      const content = extractFieldFromText(eventText, 'content') || description;
      const significance = extractFieldFromText(eventText, 'significance') || '历史意义重大';
      const relatedFigures = extractArrayFromText(eventText, 'relatedFigures');

      if (date && title && description) {
        events.push({
          id,
          date,
          title,
          description,
          content,
          significance,
          relatedFigures
        });
        console.log(`Manually extracted event ${eventIndex}: ${title}`);
        eventIndex++;
      }
    }

    // 如果没有提取到多个事件，回退到单事件提取
    if (events.length === 0) {
      console.log('No multiple events found, trying single event extraction...');

      if (responseText.includes('"id"') && responseText.includes('"title"')) {
        const id = extractFieldFromText(responseText, 'id') || '1';
        const date = extractFieldFromText(responseText, 'date');
        const title = extractFieldFromText(responseText, 'title');
        const description = extractFieldFromText(responseText, 'description');
        const content = extractFieldFromText(responseText, 'content') || description;
        const significance = extractFieldFromText(responseText, 'significance') || '历史意义重大';
        const relatedFigures = extractArrayFromText(responseText, 'relatedFigures');

        if (date && title && description) {
          events.push({
            id,
            date,
            title,
            description,
            content,
            significance,
            relatedFigures
          });
          console.log(`Manually extracted single event: ${title}`);
        }
      }
    }

    console.log(`Manual extraction completed: ${events.length} events`);
    return events;
  } catch (error) {
    console.error('Manual extraction failed:', error);
    return [];
  }
}

// 辅助函数：从文本中提取字段
function extractFieldFromText(text: string, fieldName: string): string {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'g');
  const match = pattern.exec(text);
  return match ? match[1] : '';
}

// 辅助函数：从文本中提取数组
function extractArrayFromText(text: string, fieldName: string): string[] {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]*)]`, 'g');
  const match = pattern.exec(text);
  if (match) {
    const arrayContent = match[1];
    return arrayContent.split(',').map(item =>
      item.trim().replace(/"/g, '').replace(/^\s*,?\s*/, '')
    ).filter(item => item.length > 0);
  }
  return [];
}

export async function POST(req: NextRequest) {
  const { keyword } = await req.json(); // 移到外层以便兜底方案使用

  try {

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // 检测是否为详细询问
    const isDetailedQuery = keyword.includes('详细讲解') || keyword.includes('详细介绍') || keyword.includes('深入分析');
    const cleanKeyword = keyword.replace(/详细讲解|详细介绍|深入分析/g, '').trim();

    const prompt = isDetailedQuery
      ? `请详细讲解"${cleanKeyword}"，生成5-8个相关历史事件组成完整时间线：

[{"id":"1","date":"年份","title":"事件名","description":"简述","content":"详情","significance":"意义","relatedFigures":["人物"]}]

要求按时间顺序排列，涵盖背景、过程、高潮、结果等完整阶段。`
      : `为"${keyword}"生成3个重要历史事件：

[{"id":"1","date":"年份","title":"事件名","description":"简述","content":"详情","significance":"意义","relatedFigures":["人物"]}]

请按时间顺序排列。`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000, // 大幅减少token限制确保JSON完整
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Claude response received, length:', responseText.length);

    // 更强大的JSON提取和修复
    let events: HistoryEvent[] = [];

    // 首先尝试找到JSON数组
    let jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      // 尝试找到开始的数组但可能不完整
      jsonMatch = responseText.match(/\[[\s\S]*/);
    }

    if (!jsonMatch) {
      console.error('No JSON array found in response');
      throw new Error('No JSON found in Claude response');
    }

    let jsonText = jsonMatch[0].trim();
    console.log('Extracted JSON length:', jsonText.length);

    // 打印完整的 JSON 进行调试
    console.log('Full extracted JSON:', jsonText);

    // 尝试直接解析
    try {
      events = JSON.parse(jsonText);
      console.log(`Direct JSON parse successful! Got ${events.length} events`);
    } catch (parseError) {
      console.log('Direct parse failed, attempting manual extraction...');

      // 手动提取策略
      events = extractDataManually(responseText);
      if (events.length === 0) {
        throw new Error('Could not extract any valid events from response');
      }
    }

    return NextResponse.json({ events, keyword });
  } catch (error) {
    console.error('Timeline generation error:', error);

    // 简化的兜底方案
    try {
      const fallbackPrompt = `为"${keyword}"生成3个历史事件的JSON数组：
[
  {
    "id": "1",
    "date": "年份",
    "title": "事件名",
    "description": "简述",
    "content": "详情",
    "significance": "意义",
    "relatedFigures": ["人物"]
  }
]`;

      const fallbackMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: fallbackPrompt
        }]
      });

      const fallbackText = fallbackMessage.content[0].type === 'text' ? fallbackMessage.content[0].text : '';
      console.log('Fallback response length:', fallbackText.length);

      // 使用同样的修复逻辑
      let fallbackMatch = fallbackText.match(/\[[\s\S]*?\]/);
      if (!fallbackMatch) {
        fallbackMatch = fallbackText.match(/\[[\s\S]*/);
      }

      if (fallbackMatch) {
        try {
          const fallbackEvents = JSON.parse(fallbackMatch[0]);
          console.log('Fallback succeeded, got', fallbackEvents.length, 'events');
          return NextResponse.json({ events: fallbackEvents, keyword });
        } catch (fallbackParseError) {
          // 使用手动提取函数
          const extractedEvents = extractDataManually(fallbackText);
          if (extractedEvents.length > 0) {
            console.log('Fallback manual extraction succeeded, got', extractedEvents.length, 'events');
            return NextResponse.json({ events: extractedEvents, keyword });
          }
        }
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}