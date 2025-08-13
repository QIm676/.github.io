const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 数据分析核心函数
function analyzeData(data) {
  const analysis = {
    summary: {},
    charts: {},
    insights: []
  };

  if (data.length === 0) {
    return analysis;
  }

  // 获取所有列名
  const columns = Object.keys(data[0]);
  
  // 数值列分析
  const numericColumns = columns.filter(col => {
    return data.some(row => !isNaN(parseFloat(row[col])) && row[col] !== '');
  });

  numericColumns.forEach(col => {
    const values = data
      .map(row => parseFloat(row[col]))
      .filter(val => !isNaN(val));
    
    if (values.length > 0) {
      analysis.summary[col] = {
        count: values.length,
        sum: _.sum(values),
        mean: _.mean(values),
        median: _.median(values),
        min: _.min(values),
        max: _.max(values),
        std: Math.sqrt(_.mean(values.map(x => Math.pow(x - _.mean(values), 2))))
      };

      // 生成图表数据
      analysis.charts[col] = {
        type: 'histogram',
        data: generateHistogramData(values, col)
      };
    }
  });

  // 分类列分析
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
  categoricalColumns.forEach(col => {
    const valueCounts = {};
    data.forEach(row => {
      const value = row[col] || '未知';
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    analysis.summary[col] = {
      uniqueValues: Object.keys(valueCounts).length,
      valueCounts: valueCounts
    };

    // 生成饼图数据
    analysis.charts[col] = {
      type: 'pie',
      data: Object.entries(valueCounts).map(([label, value]) => ({ label, value }))
    };
  });

  // 生成洞察
  analysis.insights = generateInsights(analysis.summary, data);

  return analysis;
}

// 生成直方图数据
function generateHistogramData(values, columnName) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
  const binSize = (max - min) / binCount;

  const bins = Array(binCount).fill(0).map(() => ({ count: 0, range: '' }));
  
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[binIndex].count++;
  });

  bins.forEach((bin, index) => {
    const start = min + index * binSize;
    const end = min + (index + 1) * binSize;
    bin.range = `${start.toFixed(2)} - ${end.toFixed(2)}`;
  });

  return bins;
}

// 生成数据洞察
function generateInsights(summary, data) {
  const insights = [];
  
  Object.entries(summary).forEach(([column, stats]) => {
    if (stats.mean !== undefined) {
      // 数值列洞察
      if (stats.std > 0) {
        const cv = (stats.std / stats.mean) * 100;
        if (cv > 50) {
          insights.push(`${column}列数据变异系数较大(${cv.toFixed(2)}%)，数据分布不均匀`);
        } else if (cv < 20) {
          insights.push(`${column}列数据变异系数较小(${cv.toFixed(2)}%)，数据相对稳定`);
        }
      }
      
      if (stats.max > stats.mean * 3) {
        insights.push(`${column}列存在异常值，最大值(${stats.max})远高于平均值(${stats.mean.toFixed(2)})`);
      }
    } else if (stats.uniqueValues !== undefined) {
      // 分类列洞察
      if (stats.uniqueValues === 1) {
        insights.push(`${column}列所有值都相同，该列可能没有分析价值`);
      } else if (stats.uniqueValues === data.length) {
        insights.push(`${column}列每个值都唯一，可能是ID列`);
      }
      
      const maxCount = Math.max(...Object.values(stats.valueCounts));
      const totalCount = Object.values(stats.valueCounts).reduce((a, b) => a + b, 0);
      const concentration = (maxCount / totalCount) * 100;
      
      if (concentration > 80) {
        insights.push(`${column}列数据高度集中，主要值占比${concentration.toFixed(1)}%`);
      }
    }
  });

  return insights;
}

// API路由

// 1. 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '数据分析服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 2. 文件上传和分析接口
app.post('/api/analyze', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: '请上传文件'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data = [];

    // 根据文件类型解析数据
    if (fileExt === '.csv') {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => {
          data = results;
          const analysis = analyzeData(data);
          
          res.json({
            status: 'success',
            message: '数据分析完成',
            data: {
              fileName: req.file.originalname,
              rowCount: data.length,
              columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
              analysis: analysis
            }
          });
        });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
      
      const analysis = analyzeData(data);
      
      res.json({
        status: 'success',
        message: '数据分析完成',
        data: {
          fileName: req.file.originalname,
          rowCount: data.length,
          columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
          analysis: analysis
        }
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: '不支持的文件格式，请上传CSV或Excel文件'
      });
    }
  } catch (error) {
    console.error('分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '分析过程中发生错误',
      error: error.message
    });
  }
});

// 3. 智能体工作流调用接口
app.post('/api/workflow/analyze', (req, res) => {
  try {
    const { data, options = {} } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        status: 'error',
        message: '请提供有效的数据数组'
      });
    }

    const analysis = analyzeData(data);
    
    // 根据选项过滤结果
    if (options.includeCharts === false) {
      delete analysis.charts;
    }
    
    if (options.includeInsights === false) {
      delete analysis.insights;
    }

    res.json({
      status: 'success',
      message: '工作流数据分析完成',
      data: {
        rowCount: data.length,
        columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        requestId: Date.now().toString()
      }
    });
  } catch (error) {
    console.error('工作流分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '工作流分析过程中发生错误',
      error: error.message
    });
  }
});

// 4. 获取分析历史接口
app.get('/api/history', (req, res) => {
  try {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        status: 'success',
        data: []
      });
    }

    const files = fs.readdirSync(uploadDir);
    const history = files.map(file => {
      const stats = fs.statSync(path.join(uploadDir, file));
      return {
        fileName: file,
        uploadTime: stats.birthtime,
        size: stats.size,
        path: path.join(uploadDir, file)
      };
    });

    res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取历史记录失败',
      error: error.message
    });
  }
});

// 5. 删除文件接口
app.delete('/api/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        status: 'success',
        message: '文件删除成功'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '删除文件失败',
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`数据分析服务已启动，端口: ${PORT}`);
  console.log(`前端地址: http://localhost:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}/api/health`);
});
