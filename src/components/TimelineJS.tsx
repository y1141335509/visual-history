'use client';

import { useEffect, useRef } from 'react';
import { HistoryEvent } from '@/types/timeline';

interface TimelineJSProps {
  events: HistoryEvent[];
  onEventClick?: (event: HistoryEvent) => void;
}

export default function TimelineJS({ events, onEventClick }: TimelineJSProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || events.length === 0) return;

    // 转换数据格式为TimelineJS格式
    const timelineData = {
      title: {
        text: {
          headline: "历史时间轴",
          text: "由 AI 生成的交互式历史内容"
        }
      },
      events: events.map((event, index) => ({
        start_date: parseHistoricalDate(event.date),
        text: {
          headline: event.title,
          text: `
            <div class="event-content">
              <div class="event-description">
                <strong>📖 事件概述：</strong>
                <p>${event.description}</p>
              </div>

              <div class="event-detail">
                <strong>📚 详细内容：</strong>
                <p>${event.content}</p>
              </div>

              <div class="event-significance">
                <strong>⭐ 历史意义：</strong>
                <p>${event.significance}</p>
              </div>

              <div class="event-figures">
                <strong>👥 相关人物：</strong>
                <div class="figures-list">
                  ${event.relatedFigures.map(figure =>
                    `<span class="figure-tag">${figure}</span>`
                  ).join('')}
                </div>
              </div>
            </div>
          `
        },
        group: "历史事件",
        background: {
          color: index % 3 === 0 ? "#3b82f6" : index % 3 === 1 ? "#10b981" : "#8b5cf6"
        }
      }))
    };

    // 动态加载TimelineJS
    const script = document.createElement('script');
    script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
    script.onload = () => {
      // @ts-ignore
      new window.TL.Timeline(containerRef.current, timelineData, {
        height: 500,
        initial_zoom: 2,
        zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
        language: 'zh-cn',
        timenav_height: 150,
        timenav_height_percentage: 25,
        marker_height_min: 30,
        marker_width_min: 100,
        start_at_slide: 0,
        hash_bookmark: false
      });
    };

    // 加载CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';

    if (!document.querySelector('script[src*="timeline3"]')) {
      document.head.appendChild(script);
    }
    if (!document.querySelector('link[href*="timeline3"]')) {
      document.head.appendChild(link);
    }

    return () => {
      // 清理
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [events]);

  // 解析历史日期
  function parseHistoricalDate(dateStr: string) {
    // 处理中文年份格式
    if (dateStr.includes('年')) {
      const yearMatch = dateStr.match(/(\d+)年/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (dateStr.includes('前')) {
          return { year: -year };
        }
        return { year: year };
      }
    }

    // 处理其他格式
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }

    return { year: 2024 };
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg">输入历史主题来生成精美的时间轴</p>
          <p className="text-sm text-gray-400 mt-2">基于 TimelineJS 的历史叙事体验</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden shadow-lg"
        style={{ minHeight: '500px' }}
      />

      {/* 自定义样式 */}
      <style jsx global>{`
        .event-content {
          line-height: 1.6;
        }

        .event-content > div {
          margin-bottom: 1rem;
        }

        .event-content strong {
          color: #1f2937;
          display: block;
          margin-bottom: 0.5rem;
        }

        .event-content p {
          color: #4b5563;
          margin: 0;
        }

        .figures-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .figure-tag {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid #93c5fd;
        }

        .tl-timeline {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
        }

        .tl-headline {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
          font-weight: 600 !important;
        }

        .tl-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
        }
      `}</style>
    </div>
  );
}