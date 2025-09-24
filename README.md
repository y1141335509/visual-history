# 历史时间轴 - Visual History

AI驱动的交互式历史可视化工具，帮助用户更好地理解历史脉络。

## 功能特性

- 🤖 **AI 驱动**：使用 Claude AI 生成准确的历史事件数据
- 📊 **交互式时间轴**：基于 Vis.js 的可缩放、可拖拽时间轴
- 🎯 **事件详情**：点击事件查看详细信息
- 📱 **响应式设计**：完美支持桌面和移动设备
- 🇨🇳 **中文优化**：专为中文历史主题优化

## 技术栈

- **前端**：Next.js 15 + React + TypeScript + Tailwind CSS
- **时间轴**：Vis.js Timeline
- **AI**：Anthropic Claude API
- **部署**：Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用方法

1. 在搜索框中输入历史主题（如"唐朝兴衰"、"丝绸之路"等）
2. 点击"生成时间轴"按钮
3. AI 将生成 5-8 个关键历史事件
4. 在交互式时间轴上浏览事件
5. 点击事件节点查看详细信息

## 推荐搜索主题

- 唐朝兴衰
- 丝绸之路
- 明朝郑和下西洋
- 二战太平洋战争
- 工业革命
- 中国古代四大发明

## 构建部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── generate-timeline/  # 时间轴生成接口
│   ├── globals.css        # 全局样式
│   └── page.tsx          # 主页面
├── components/           # React 组件
│   ├── SearchInput.tsx   # 搜索输入组件
│   ├── Timeline.tsx      # 时间轴组件
│   └── EventModal.tsx    # 事件详情模态框
└── types/               # TypeScript 类型定义
    └── timeline.ts      # 时间轴相关类型
```

## MVP 特性

✅ 基础搜索和 AI 生成
✅ 交互式时间轴显示
✅ 事件详情查看
✅ 响应式设计
✅ Loading 和错误处理

## 后续规划

- [ ] 用户注册和登录
- [ ] 时间轴保存和分享
- [ ] 多维度筛选功能
- [ ] 地图模式集成
- [ ] 多用户协作功能

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
