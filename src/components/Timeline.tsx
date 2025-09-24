'use client';

import { useEffect, useRef } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import { HistoryEvent } from '@/types/timeline';

interface TimelineProps {
  events: HistoryEvent[];
  onEventClick?: (event: HistoryEvent) => void;
}

export default function TimelineComponent({ events, onEventClick }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || events.length === 0) return;

    // 将历史事件转换为 vis-timeline 格式
    const items = events.map((event, index) => ({
      id: event.id,
      content: `<div class="timeline-event">
        <div class="timeline-title">${event.title}</div>
        <div class="timeline-date">${event.date}</div>
        <div class="timeline-preview">${event.description.substring(0, 60)}...</div>
        <div class="timeline-figures">
          ${event.relatedFigures.slice(0, 3).map(figure =>
            `<span class="timeline-figure">${figure}</span>`
          ).join('')}
        </div>
      </div>`,
      start: parseDate(event.date),
      type: 'point',
      className: `timeline-item timeline-item-${index % 3}`
    }));

    const options = {
      height: '400px',
      margin: {
        item: 20,
      },
      orientation: 'top',
      showCurrentTime: false,
      zoomMin: 1000 * 60 * 60 * 24 * 365, // 1 year minimum zoom
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 1000, // 1000 years maximum zoom
      format: {
        minorLabels: {
          year: 'YYYY年',
          month: 'MM月',
          day: 'DD日'
        },
        majorLabels: {
          year: 'YYYY年',
          month: 'YYYY年 MM月',
          day: 'YYYY年 MM月 DD日'
        }
      },
      locale: 'zh'
    };

    // 创建时间轴
    timelineRef.current = new Timeline(containerRef.current, items, options);

    // 添加点击事件监听器
    timelineRef.current.on('select', (properties) => {
      if (properties.items.length > 0) {
        const selectedId = properties.items[0];
        const selectedEvent = events.find(event => event.id === selectedId);
        if (selectedEvent && onEventClick) {
          onEventClick(selectedEvent);
        }
      }
    });

    // 自动调整视图以显示所有事件
    timelineRef.current.fit();

    return () => {
      if (timelineRef.current) {
        timelineRef.current.destroy();
        timelineRef.current = null;
      }
    };
  }, [events, onEventClick]);

  // 解析日期字符串为 Date 对象
  function parseDate(dateStr: string): Date {
    // 处理中文年份格式："618年" -> Date(618, 0, 1)
    if (dateStr.includes('年')) {
      const yearMatch = dateStr.match(/(\d+)年/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        // 处理公元前的年份
        if (dateStr.includes('前')) {
          return new Date(-year, 0, 1);
        }
        return new Date(year, 0, 1);
      }
    }

    // 处理其他日期格式
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // 如果无法解析，返回当前时间
    return new Date();
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500">
        <p>输入历史主题来生成时间轴</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full border border-gray-200 rounded-lg" />
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>💡 点击时间轴上的事件查看详情，使用鼠标滚轮缩放，拖拽浏览</p>
      </div>
    </div>
  );
}