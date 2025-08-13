// 智能数据分析平台前端脚本
// 实现文件上传、图表展示和API调用功能

// 全局变量
let currentAnalysis = null;
let chartInstances = {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('数据分析平台初始化中...');
    initializeApp();
});

// 初始化应用
function initializeApp() {
    setupFileUpload();
    loadHistory();
    setupDragAndDrop();
    console.log('应用初始化完成');
}

// 设置文件上传
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', handleFileSelect);
        
        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        console.log('文件上传功能已设置');
    }
}

// 设置拖拽上传
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
        console.log('拖拽上传功能已设置');
    }
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    console.log('开始处理文件:', file.name);
    
    // 验证文件类型
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        showError('不支持的文件格式，请上传CSV或Excel文件');
        return;
    }
    
    // 显示进度条
    showProgress();
    
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // 上传文件并分析
    fetch('/api/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideProgress();
        if (data.status === 'success') {
            currentAnalysis = data.data;
            displayResults(data.data);
            showSuccess('数据分析完成！');
            loadHistory(); // 刷新历史记录
        } else {
            showError(data.message || '分析失败');
        }
    })
    .catch(error => {
        hideProgress();
        console.error('上传错误:', error);
        showError('上传失败，请重试');
    });
}

// 显示进度条
function showProgress() {
    const progress = document.getElementById('uploadProgress');
    const uploadArea = document.getElementById('uploadArea');
    
    if (progress && uploadArea) {
        progress.style.display = 'block';
        uploadArea.style.display = 'none';
    }
}

// 隐藏进度条
function hideProgress() {
    const progress = document.getElementById('uploadProgress');
    const uploadArea = document.getElementById('uploadArea');
    
    if (progress && uploadArea) {
        progress.style.display = 'none';
        uploadArea.style.display = 'block';
    }
}

// 显示分析结果
function displayResults(data) {
    console.log('显示分析结果:', data);
    
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        
        // 显示文件信息
        displayFileInfo(data);
        
        // 显示数据概览
        displayOverview(data.analysis.summary);
        
        // 显示图表
        displayCharts(data.analysis.charts);
        
        // 显示数据洞察
        displayInsights(data.analysis.insights);
        
        // 滚动到结果区域
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 显示文件信息
function displayFileInfo(data) {
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <h3>📄 文件信息</h3>
            <p><strong>文件名:</strong> ${data.fileName}</p>
            <p><strong>行数:</strong> ${data.rowCount}</p>
            <p><strong>列数:</strong> ${data.columnCount}</p>
            <p><strong>分析时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
        `;
    }
}

// 显示数据概览
function displayOverview(summary) {
    const overviewGrid = document.getElementById('overviewGrid');
    if (!overviewGrid) return;
    
    overviewGrid.innerHTML = '';
    
    Object.entries(summary).forEach(([column, stats]) => {
        const card = document.createElement('div');
        card.className = 'overview-card';
        
        if (stats.mean !== undefined) {
            // 数值列
            card.innerHTML = `
                <h4>📊 ${column}</h4>
                <div class="stat-item">
                    <span class="stat-label">数据量:</span>
                    <span class="stat-value">${stats.count}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">平均值:</span>
                    <span class="stat-value">${stats.mean.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">中位数:</span>
                    <span class="stat-value">${stats.median.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">最小值:</span>
                    <span class="stat-value">${stats.min.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">最大值:</span>
                    <span class="stat-value">${stats.max.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">标准差:</span>
                    <span class="stat-value">${stats.std.toFixed(2)}</span>
                </div>
            `;
        } else {
            // 分类列
            card.innerHTML = `
                <h4>🏷️ ${column}</h4>
                <div class="stat-item">
                    <span class="stat-label">唯一值数量:</span>
                    <span class="stat-value">${stats.uniqueValues}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">主要值:</span>
                    <span class="stat-value">${getTopValues(stats.valueCounts, 3)}</span>
                </div>
            `;
        }
        
        overviewGrid.appendChild(card);
    });
}

// 获取前N个主要值
function getTopValues(valueCounts, count) {
    return Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([value, count]) => `${value}(${count})`)
        .join(', ');
}

// 显示图表
function displayCharts(charts) {
    const chartsGrid = document.getElementById('chartsGrid');
    if (!chartsGrid) return;
    
    chartsGrid.innerHTML = '';
    
    // 清除之前的图表实例
    Object.values(chartInstances).forEach(chart => {
        if (chart && chart.destroy) {
            chart.destroy();
        }
    });
    chartInstances = {};
    
    Object.entries(charts).forEach(([column, chartData]) => {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        
        const chartTitle = document.createElement('h4');
        chartTitle.textContent = `${column} - ${getChartTypeName(chartData.type)}`;
        chartContainer.appendChild(chartTitle);
        
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-wrapper';
        chartContainer.appendChild(chartWrapper);
        
        chartsGrid.appendChild(chartContainer);
        
        // 创建图表
        createChart(chartWrapper, column, chartData);
    });
}

// 获取图表类型名称
function getChartTypeName(type) {
    const typeNames = {
        'histogram': '直方图',
        'pie': '饼图',
        'bar': '柱状图',
        'line': '折线图'
    };
    return typeNames[type] || type;
}

// 创建图表
function createChart(container, column, chartData) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js未加载，跳过图表创建');
        return;
    }
    
    const ctx = document.createElement('canvas');
    container.appendChild(ctx);
    
    let chart;
    
    if (chartData.type === 'histogram') {
        // 直方图
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.data.map(bin => bin.range),
                datasets: [{
                    label: column,
                    data: chartData.data.map(bin => bin.count),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${column} 分布直方图`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '频次'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '数值范围'
                        }
                    }
                }
            }
        });
    } else if (chartData.type === 'pie') {
        // 饼图
        const colors = generateColors(chartData.data.length);
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.data.map(item => item.label),
                datasets: [{
                    data: chartData.data.map(item => item.value),
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${column} 分布饼图`
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    if (chart) {
        chartInstances[column] = chart;
    }
}

// 生成颜色数组
function generateColors(count) {
    const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// 显示数据洞察
function displayInsights(insights) {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;
    
    insightsList.innerHTML = '';
    
    if (insights.length === 0) {
        insightsList.innerHTML = '<p class="loading">暂无数据洞察</p>';
        return;
    }
    
    insights.forEach(insight => {
        const insightItem = document.createElement('div');
        insightItem.className = 'insight-item';
        insightItem.innerHTML = `<div class="insight-text">${insight}</div>`;
        insightsList.appendChild(insightItem);
    });
}

// 加载历史记录
function loadHistory() {
    fetch('/api/history')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayHistory(data.data);
            }
        })
        .catch(error => {
            console.error('加载历史记录失败:', error);
            const historyList = document.getElementById('historyList');
            if (historyList) {
                historyList.innerHTML = '<p class="error">加载历史记录失败</p>';
            }
        });
}

// 显示历史记录
function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="loading">暂无分析历史</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    history.forEach(file => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const fileSize = (file.size / 1024).toFixed(2);
        const uploadTime = new Date(file.uploadTime).toLocaleString('zh-CN');
        
        historyItem.innerHTML = `
            <div class="history-info">
                <h4>${file.fileName}</h4>
                <p>上传时间: ${uploadTime} | 文件大小: ${fileSize} KB</p>
            </div>
            <button class="delete-btn" onclick="deleteFile('${file.fileName}')">删除</button>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// 删除文件
function deleteFile(filename) {
    if (confirm(`确定要删除文件 "${filename}" 吗？`)) {
        fetch(`/api/file/${filename}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showSuccess('文件删除成功');
                loadHistory();
            } else {
                showError(data.message || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除失败:', error);
            showError('删除失败，请重试');
        });
    }
}

// 测试工作流API
function testWorkflowAPI() {
    const testData = document.getElementById('testData').value;
    const includeCharts = document.getElementById('includeCharts').checked;
    const includeInsights = document.getElementById('includeInsights').checked;
    
    if (!testData.trim()) {
        showError('请输入测试数据');
        return;
    }
    
    let data;
    try {
        data = JSON.parse(testData);
    } catch (error) {
        showError('测试数据格式错误，请检查JSON格式');
        return;
    }
    
    const requestBody = {
        data: data,
        options: {
            includeCharts: includeCharts,
            includeInsights: includeInsights
        }
    };
    
    console.log('测试工作流API:', requestBody);
    
    fetch('/api/workflow/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(result => {
        const apiResult = document.getElementById('apiResult');
        if (apiResult) {
            apiResult.textContent = JSON.stringify(result, null, 2);
            
            if (result.status === 'success') {
                apiResult.className = 'api-result success';
            } else {
                apiResult.className = 'api-result error';
            }
        }
    })
    .catch(error => {
        console.error('API测试失败:', error);
        const apiResult = document.getElementById('apiResult');
        if (apiResult) {
            apiResult.textContent = `API调用失败: ${error.message}`;
            apiResult.className = 'api-result error';
        }
    });
}

// 显示成功消息
function showSuccess(message) {
    showMessage(message, 'success');
}

// 显示错误消息
function showError(message) {
    showMessage(message, 'error');
}

// 显示消息
function showMessage(message, type) {
    console.log(`${type}: ${message}`);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // 自动移除消息
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// 添加消息样式
const style = document.createElement('style');
style.textContent = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }
    
    .message.success {
        background: #27ae60;
    }
    
    .message.error {
        background: #e74c3c;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

console.log('数据分析平台前端脚本加载完成');
