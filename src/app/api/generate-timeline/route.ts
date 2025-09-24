import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { HistoryEvent } from '@/types/timeline';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { keyword } = await req.json(); // 移到外层以便兜底方案使用

  try {

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const prompt = `请为历史主题"${keyword}"生成5-7个最重要的历史事件，内容详实但简洁。

要求：
1. 返回严格的JSON格式数组，确保JSON完整有效
2. 每个事件包含：id, date, title, description, content, significance, relatedFigures
3. date格式：具体年份（如"618年"、"1949年10月1日"）
4. title：精准的事件名称（10-20字）
5. description：事件概述（60-80字）
6. content：详细描述，包括背景、过程、影响（150-200字）
7. significance：历史意义和影响（80-120字）
8. relatedFigures：相关重要人物（字符串数组，3-4人）
9. 按时间顺序排列，确保历史准确性

重要：请确保返回的JSON格式完整，以]结尾。

示例格式：
[
  {
    "id": "1",
    "date": "618年",
    "title": "唐朝建立",
    "description": "李渊在长安称帝建立唐朝，结束了魏晋南北朝的分裂局面，开创统一盛世。",
    "content": "隋朝末年政治腐败，农民起义频发。李渊为隋朝太原留守，在李世民劝说下起兵反隋。617年起兵太原，618年攻入长安正式称帝，建立唐朝。李渊建立政治制度，统一全国，为唐朝强盛打下基础。",
    "significance": "唐朝建立标志着中国进入新的历史时期，为后续贞观之治创造条件，成为中国古代最繁荣朝代。",
    "relatedFigures": ["李渊", "李世民", "李建成", "裴寂"]
  }
]`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000, // 增加token限制以支持更详细内容
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // 提取JSON内容 - 更严格的匹配
    let jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      // 尝试匹配不完整的JSON
      jsonMatch = responseText.match(/\[[\s\S]*$/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', responseText);
        throw new Error('No JSON found in Claude response');
      }
    }

    let events: HistoryEvent[];
    try {
      events = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw JSON:', jsonMatch[0]);

      // 容错处理：修复不完整的JSON
      let jsonText = jsonMatch[0];

      // 如果 JSON 不是以 ] 结尾，说明被截断了
      if (!jsonText.trim().endsWith(']')) {
        // 查找最后一个完整的对象结束位置
        const lastCompleteObject = jsonText.lastIndexOf('}');

        if (lastCompleteObject > -1) {
          // 截取到最后一个完整对象，并添加数组结束符
          jsonText = jsonText.substring(0, lastCompleteObject + 1) + '\n]';
          console.log('Attempting to fix truncated JSON:', jsonText.slice(-100));

          try {
            events = JSON.parse(jsonText);
            console.log('Successfully parsed fixed JSON, got', events.length, 'events');
          } catch (retryError) {
            console.error('Failed to parse fixed JSON:', retryError);
            throw new Error('Failed to parse incomplete JSON response');
          }
        } else {
          console.error('JSON too incomplete - no complete objects found');
          throw new Error('JSON response is too incomplete to parse');
        }
      } else {
        // JSON 看起来完整但仍然解析失败
        console.error('JSON appears complete but parsing failed');
        throw parseError;
      }
    }

    return NextResponse.json({ events, keyword });
  } catch (error) {
    console.error('Timeline generation error:', error);

    // 兜底方案：如果详细版本失败，尝试生成简化版本
    try {
      const fallbackPrompt = `请为历史主题"${keyword}"生成5个重要历史事件。

要求：
1. 返回严格的JSON格式数组
2. 每个事件包含：id, date, title, description, content, significance, relatedFigures
3. 内容简洁但准确
4. 确保JSON格式完整

示例格式：
[
  {
    "id": "1",
    "date": "618年",
    "title": "唐朝建立",
    "description": "李渊建立唐朝，开创盛世",
    "content": "李渊在长安建立唐朝，结束分裂局面",
    "significance": "开创中国古代盛世王朝",
    "relatedFigures": ["李渊", "李世民"]
  }
]`;

      const fallbackMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: fallbackPrompt
        }]
      });

      const fallbackText = fallbackMessage.content[0].type === 'text' ? fallbackMessage.content[0].text : '';
      const fallbackMatch = fallbackText.match(/\[[\s\S]*?\]/);

      if (fallbackMatch) {
        const fallbackEvents = JSON.parse(fallbackMatch[0]);
        return NextResponse.json({ events: fallbackEvents, keyword });
      }
    } catch (fallbackError) {
      console.error('Fallback generation failed:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}