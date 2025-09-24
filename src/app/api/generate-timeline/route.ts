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

    const prompt = `请为历史主题"${keyword}"生成5-8个最重要的历史事件，要求内容丰富详实。

要求：
1. 返回严格的JSON格式数组
2. 每个事件包含：id, date, title, description, content, significance, relatedFigures
3. date格式：具体年份（如"618年"、"1949年10月1日"）
4. title：精准的事件名称（15-25字）
5. description：事件概述（80-120字）
6. content：详细描述，包括背景、过程、影响（200-300字）
7. significance：历史意义和影响（100-150字）
8. relatedFigures：相关重要人物（字符串数组，3-5人）
9. 按时间顺序排列，确保历史准确性

示例格式：
[
  {
    "id": "1",
    "date": "618年",
    "title": "李渊建立唐朝，开创盛世基业",
    "description": "李渊在长安称帝，国号唐，建立了中国历史上最辉煌的统一王朝之一。唐朝的建立结束了魏晋南北朝的分裂局面，为后续的贞观之治和开元盛世奠定了基础。",
    "content": "隋朝末年，政治腐败，民不聊生，各地农民起义频发。李渊原为隋朝太原留守，在其子李世民等人的劝说下起兵反隋。617年，李渊起兵太原，以恢复隋朝政治为名，实际是为了夺取天下。经过近两年的征战，李渊军队攻入长安，618年5月，李渊正式称帝，建立唐朝，定都长安。唐朝建立后，李渊采取了一系列政治、经济和军事改革措施，逐步统一全国，为唐朝的强盛打下了坚实基础。",
    "significance": "唐朝的建立标志着中国进入了一个新的历史时期。李渊建立的政治制度和治国理念为后续的贞观之治创造了条件，唐朝也成为中国古代最开放、最繁荣的朝代，对中华文明的发展产生了深远影响。",
    "relatedFigures": ["李渊", "李世民", "李建成", "李元吉", "裴寂"]
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