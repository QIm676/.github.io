# 智能数据分析平台

一个功能强大的数据分析平台，提供图表展示、文字分析结果，并生成API接口供智能体工作流调用。

## 🚀 功能特性

- **文件上传分析**: 支持CSV和Excel文件上传
- **智能数据分析**: 自动识别数值列和分类列
- **图表可视化**: 自动生成直方图、饼图等图表
- **数据洞察**: 智能生成数据分析和建议
- **API接口**: 提供RESTful API供智能体工作流调用
- **历史记录**: 保存分析历史，支持文件管理
- **响应式设计**: 支持各种设备访问

## 📋 系统要求

- Node.js 14.0+
- npm 或 yarn

## 🛠️ 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd data-analysis
```

2. **安装依赖**
```bash
npm install
```

3. **启动服务**
```bash
npm start
```

4. **开发模式启动**
```bash
npm run dev
```

## 🌐 访问地址

- **前端界面**: http://localhost:3000
- **API文档**: http://localhost:3000/api/health

## 📊 支持的文件格式

- CSV文件 (.csv)
- Excel文件 (.xlsx, .xls)

## 🔌 API接口文档

### 1. 健康检查接口
```
GET /api/health
```
返回服务状态信息

### 2. 文件上传分析接口
```
POST /api/analyze
Content-Type: multipart/form-data

参数:
- file: 要分析的文件
```
返回数据分析结果，包含统计信息、图表数据和洞察

### 3. 智能体工作流调用接口 ⭐
```
POST /api/workflow/analyze
Content-Type: application/json

请求体:
{
  "data": [
    {"name": "张三", "age": 25, "score": 85},
    {"name": "李四", "age": 30, "score": 92}
  ],
  "options": {
    "includeCharts": true,
    "includeInsights": true
  }
}
```
这是专门为智能体工作流设计的接口，可以直接传入JSON数据进行实时分析

### 4. 获取分析历史接口
```
GET /api/history
```
返回所有已分析文件的历史记录

### 5. 删除文件接口
```
DELETE /api/file/:filename
```
删除指定的分析文件

## 🤖 智能体工作流集成

### 工作流节点配置示例

```json
{
  "name": "数据分析节点",
  "type": "http_request",
  "config": {
    "method": "POST",
    "url": "http://localhost:3000/api/workflow/analyze",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "data": "{{input.data}}",
      "options": {
        "includeCharts": true,
        "includeInsights": true
      }
    }
  }
}
```

### 输入数据格式
```json
{
  "data": [
    {"column1": "value1", "column2": 123},
    {"column1": "value2", "column2": 456}
  ]
}
```

### 输出结果格式
```json
{
  "status": "success",
  "message": "工作流数据分析完成",
  "data": {
    "rowCount": 2,
    "columnCount": 2,
    "analysis": {
      "summary": {
        "column1": {
          "uniqueValues": 2,
          "valueCounts": {"value1": 1, "value2": 1}
        },
        "column2": {
          "count": 2,
          "mean": 289.5,
          "median": 289.5,
          "min": 123,
          "max": 456,
          "std": 235.5
        }
      },
      "charts": {
        "column1": {
          "type": "pie",
          "data": [{"label": "value1", "value": 1}, {"label": "value2", "value": 1}]
        },
        "column2": {
          "type": "histogram",
          "data": [{"range": "123.00 - 189.50", "count": 1}, {"range": "189.50 - 456.00", "count": 1}]
        }
      },
      "insights": [
        "column1列每个值都唯一，可能是ID列",
        "column2列数据变异系数较大(81.35%)，数据分布不均匀"
      ]
    },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "1704067200000"
  }
}
```

## 📈 数据分析功能

### 数值列分析
- 基础统计: 计数、求和、平均值、中位数、最小值、最大值、标准差
- 图表类型: 直方图（自动分箱）
- 异常值检测: 识别超出平均值3倍的数据点

### 分类列分析
- 唯一值统计: 统计不同值的数量和分布
- 图表类型: 饼图
- 数据集中度分析: 识别高度集中的分类数据

### 智能洞察生成
- 变异系数分析: 评估数值数据的稳定性
- 数据质量评估: 识别可能的ID列或无价值列
- 分布特征分析: 提供数据分布的专业解读

## 🎨 前端特性

- **拖拽上传**: 支持文件拖拽到上传区域
- **实时进度**: 显示文件上传和分析进度
- **响应式布局**: 适配各种屏幕尺寸
- **图表交互**: 使用Chart.js提供丰富的图表交互
- **消息提示**: 成功/错误消息自动显示和消失

## 🔧 配置选项

### 环境变量
- `PORT`: 服务端口号（默认: 3000）
- `UPLOAD_DIR`: 文件上传目录（默认: uploads/）

### 分析选项
- `includeCharts`: 是否包含图表数据
- `includeInsights`: 是否包含数据洞察

## 📁 项目结构

```
data-analysis/
├── server.js          # 主服务器文件
├── package.json       # 项目依赖配置
├── public/            # 前端静态文件
│   ├── index.html     # 主页面
│   ├── style.css      # 样式文件
│   └── script.js      # 前端逻辑
├── uploads/           # 文件上传目录
└── README.md          # 项目说明文档
```

## 🚀 部署说明

### 生产环境部署
1. 设置环境变量
2. 使用PM2或类似工具管理进程
3. 配置反向代理（如Nginx）
4. 设置SSL证书

### Docker部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至: your-email@example.com

---

**注意**: 这是一个演示项目，生产环境使用前请进行充分的安全测试和性能优化。
