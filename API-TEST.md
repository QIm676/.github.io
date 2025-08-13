# 数据分析平台 API 测试文档

## 🧪 测试环境准备

1. 启动数据分析平台服务
2. 确保服务运行在 http://localhost:3000
3. 准备测试工具（如Postman、curl或浏览器）

## 📋 API 测试用例

### 1. 健康检查接口测试

**请求:**
```bash
curl -X GET http://localhost:3000/api/health
```

**预期响应:**
```json
{
  "status": "success",
  "message": "数据分析服务运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. 文件上传分析接口测试

**请求:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@sample-data.csv"
```

**预期响应:**
```json
{
  "status": "success",
  "message": "数据分析完成",
  "data": {
    "fileName": "sample-data.csv",
    "rowCount": 10,
    "columnCount": 7,
    "analysis": {
      "summary": {
        "年龄": {
          "count": 10,
          "sum": 294,
          "mean": 29.4,
          "median": 29.5,
          "min": 22,
          "max": 35,
          "std": 3.8
        },
        "收入": {
          "count": 10,
          "sum": 102000,
          "mean": 10200,
          "median": 9750,
          "min": 7000,
          "max": 15000,
          "std": 2500
        }
      },
      "charts": {
        "年龄": {
          "type": "histogram",
          "data": [...]
        },
        "性别": {
          "type": "pie",
          "data": [...]
        }
      },
      "insights": [
        "年龄列数据变异系数较小(12.93%)，数据相对稳定",
        "收入列数据变异系数较大(24.51%)，数据分布不均匀"
      ]
    }
  }
}
```

### 3. 智能体工作流调用接口测试 ⭐

**请求:**
```bash
curl -X POST http://localhost:3000/api/workflow/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"name": "张三", "age": 25, "score": 85},
      {"name": "李四", "age": 30, "score": 92},
      {"name": "王五", "age": 28, "score": 78}
    ],
    "options": {
      "includeCharts": true,
      "includeInsights": true
    }
  }'
```

**预期响应:**
```json
{
  "status": "success",
  "message": "工作流数据分析完成",
  "data": {
    "rowCount": 3,
    "columnCount": 3,
    "analysis": {
      "summary": {
        "name": {
          "uniqueValues": 3,
          "valueCounts": {"张三": 1, "李四": 1, "王五": 1}
        },
        "age": {
          "count": 3,
          "sum": 83,
          "mean": 27.67,
          "median": 28,
          "min": 25,
          "max": 30,
          "std": 2.52
        },
        "score": {
          "count": 3,
          "sum": 255,
          "mean": 85,
          "median": 85,
          "min": 78,
          "max": 92,
          "std": 7
        }
      },
      "charts": {
        "name": {
          "type": "pie",
          "data": [
            {"label": "张三", "value": 1},
            {"label": "李四", "value": 1},
            {"label": "王五", "value": 1}
          ]
        },
        "age": {
          "type": "histogram",
          "data": [
            {"range": "25.00 - 26.67", "count": 1},
            {"range": "26.67 - 28.33", "count": 1},
            {"range": "28.33 - 30.00", "count": 1}
          ]
        }
      },
      "insights": [
        "name列每个值都唯一，可能是ID列",
        "age列数据变异系数较小(9.11%)，数据相对稳定",
        "score列数据变异系数较小(8.24%)，数据相对稳定"
      ]
    },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "1704067200000"
  }
}
```

### 4. 获取分析历史接口测试

**请求:**
```bash
curl -X GET http://localhost:3000/api/history
```

**预期响应:**
```json
{
  "status": "success",
  "data": [
    {
      "fileName": "1704067200000-sample-data.csv",
      "uploadTime": "2024-01-01T00:00:00.000Z",
      "size": 1024,
      "path": "uploads/1704067200000-sample-data.csv"
    }
  ]
}
```

### 5. 删除文件接口测试

**请求:**
```bash
curl -X DELETE http://localhost:3000/api/file/1704067200000-sample-data.csv
```

**预期响应:**
```json
{
  "status": "success",
  "message": "文件删除成功"
}
```

## 🔧 测试选项说明

### 工作流API选项参数

- `includeCharts`: 布尔值，是否包含图表数据
- `includeInsights`: 布尔值，是否包含数据洞察

**示例1: 只获取统计摘要**
```json
{
  "data": [...],
  "options": {
    "includeCharts": false,
    "includeInsights": false
  }
}
```

**示例2: 获取完整分析结果**
```json
{
  "data": [...],
  "options": {
    "includeCharts": true,
    "includeInsights": true
  }
}
```

## 🧪 自动化测试脚本

### Python测试脚本示例

```python
import requests
import json

# 测试配置
BASE_URL = "http://localhost:3000"

def test_health_check():
    """测试健康检查接口"""
    response = requests.get(f"{BASE_URL}/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    print("✅ 健康检查接口测试通过")

def test_workflow_api():
    """测试工作流API接口"""
    test_data = [
        {"name": "张三", "age": 25, "score": 85},
        {"name": "李四", "age": 30, "score": 92}
    ]
    
    payload = {
        "data": test_data,
        "options": {
            "includeCharts": True,
            "includeInsights": True
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/workflow/analyze",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["rowCount"] == 2
    print("✅ 工作流API接口测试通过")

def test_file_upload():
    """测试文件上传接口"""
    with open("sample-data.csv", "rb") as f:
        files = {"file": f}
        response = requests.post(f"{BASE_URL}/api/analyze", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    print("✅ 文件上传接口测试通过")

if __name__ == "__main__":
    print("开始API测试...")
    
    try:
        test_health_check()
        test_workflow_api()
        test_file_upload()
        print("\n🎉 所有测试通过！")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
```

### JavaScript测试脚本示例

```javascript
// 使用fetch API测试
async function testAPI() {
    const baseURL = 'http://localhost:3000';
    
    try {
        // 测试健康检查
        const healthResponse = await fetch(`${baseURL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('健康检查:', healthData);
        
        // 测试工作流API
        const workflowResponse = await fetch(`${baseURL}/api/workflow/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [
                    {name: '张三', age: 25, score: 85},
                    {name: '李四', age: 30, score: 92}
                ],
                options: {
                    includeCharts: true,
                    includeInsights: true
                }
            })
        });
        
        const workflowData = await workflowResponse.json();
        console.log('工作流API:', workflowData);
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testAPI();
```

## 📊 性能测试

### 压力测试示例

```bash
# 使用Apache Bench进行压力测试
ab -n 1000 -c 10 -H "Content-Type: application/json" \
   -p test-data.json \
   http://localhost:3000/api/workflow/analyze
```

### 测试数据文件 (test-data.json)
```json
{
  "data": [
    {"id": 1, "value": 100},
    {"id": 2, "value": 200}
  ],
  "options": {
    "includeCharts": true,
    "includeInsights": true
  }
}
```

## 🐛 常见问题排查

### 1. 服务启动失败
- 检查端口3000是否被占用
- 确认Node.js版本 >= 14.0
- 检查依赖是否安装完整

### 2. 文件上传失败
- 确认文件格式为CSV或Excel
- 检查文件大小是否过大
- 验证文件内容格式是否正确

### 3. API调用失败
- 检查请求头Content-Type
- 验证JSON格式是否正确
- 确认服务是否正常运行

### 4. 图表显示异常
- 检查Chart.js是否正确加载
- 验证数据格式是否符合预期
- 查看浏览器控制台错误信息

## 📞 技术支持

如遇到问题，请：
1. 查看服务端控制台日志
2. 检查浏览器开发者工具
3. 提交Issue到项目仓库
4. 联系技术支持团队
