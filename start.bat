@echo off
echo ========================================
echo    �������ݷ���ƽ̨�����ű�
echo ========================================
echo.

echo ���ڼ��Node.js����...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ����: δ��⵽Node.js�����Ȱ�װNode.js
    echo ���ص�ַ: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js�汾: 
node --version
echo.



echo npm�汾:
call npm --version
echo.

echo ���ڰ�װ��Ŀ����...
call npm install
if %errorlevel% neq 0 (
    echo ����: ������װʧ��
    pause
    exit /b 1
)

echo.
echo ������װ��ɣ�
echo.

echo �����������ݷ���ƽ̨...
echo ���������������: http://localhost:3000
echo �� Ctrl+C ����ֹͣ����
echo.

npm start

