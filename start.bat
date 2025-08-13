@echo off
echo ========================================
echo    智能数据分析平台启动脚本
echo ========================================
echo.

echo 正在检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js版本: 
node --version
echo.



echo npm版本:
call npm --version
echo.

echo 正在安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 依赖安装完成！
echo.

echo 正在启动数据分析平台...
echo 服务启动后，请访问: http://localhost:3000
echo 按 Ctrl+C 可以停止服务
echo.

npm start

