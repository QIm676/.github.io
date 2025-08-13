# 🚀 智能数据分析平台 - 快速启动指南

## ⚡ 5分钟快速启动

### 第一步：环境检查
确保您的系统已安装：
- ✅ Node.js 14.0 或更高版本
- ✅ npm 或 yarn 包管理器

**检查命令：**
```bash
node --version
npm --version
```

### 第二步：启动服务
**Windows用户：**
```bash
# 双击运行 start.bat 文件
# 或者在命令行中运行：
start.bat
```

**其他系统用户：**
```bash
# 安装依赖
npm install

# 启动服务
npm start
```

### 第三步：访问平台
打开浏览器访问：**http://localhost:3000**

## 🎯 核心功能演示

### 1. 文件上传分析
1. 将CSV或Excel文件拖拽到上传区域
2. 系统自动分析数据并生成报告
3. 查看统计信息、图表和数据洞察

### 2. 工作流API调用
**接口地址：** `POST /api/workflow/analyze`

**测试数据：**
```json
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

**快速测试：**
```bash
curl -X POST http://localhost:3000/api/workflow/analyze \
  -H "Content-Type: application/json" \
  -d '{"data":[{"name":"张三","age":25,"score":85}],"options":{"includeCharts":true,"includeInsights":true}}'
```

## 🔧 智能体工作流集成

### 工作流节点配置
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

### 输入输出格式
- **输入**: JSON数组格式的数据
- **输出**: 包含统计、图表、洞察的完整分析结果

## 📊 支持的数据类型

### 数值列自动分析
- 基础统计：计数、求和、平均值、中位数、最小值、最大值、标准差
- 图表：直方图（自动分箱）
- 洞察：异常值检测、变异系数分析

### 分类列自动分析
- 统计：唯一值数量、值分布
- 图表：饼图
- 洞察：数据集中度、ID列识别

## 🎨 界面特性

- **拖拽上传**: 支持文件拖拽到上传区域
- **实时进度**: 显示分析进度
- **响应式设计**: 适配各种设备
- **图表交互**: 使用Chart.js提供丰富交互
- **历史记录**: 保存分析历史

## 🔍 常见问题

### Q: 服务启动失败怎么办？
**A:** 检查端口3000是否被占用，或修改server.js中的PORT变量

### Q: 文件上传失败？
**A:** 确认文件格式为CSV或Excel，检查文件内容格式

### Q: 图表不显示？
**A:** 检查网络连接，确保Chart.js库正常加载

### Q: API调用失败？
**A:** 检查请求格式，确认Content-Type为application/json

## 📚 更多资源

- **完整文档**: [README.md](README.md)
- **API测试**: [API-TEST.md](API-TEST.md)
- **示例数据**: [sample-data.csv](sample-data.csv)

## 🆘 获取帮助

- 查看控制台日志信息
- 检查浏览器开发者工具
- 参考API测试文档
- 提交Issue到项目仓库

---

**🎉 恭喜！您已成功启动智能数据分析平台**

现在可以：
1. 上传数据文件进行分析
2. 调用API接口集成到工作流
3. 查看丰富的图表和洞察结果
4. 管理分析历史记录
