const express = require('express');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const app = express();

// SSL 配置
const options = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem'))
};

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

// 静态文件服务
app.use('/pc', express.static(path.join(__dirname, '../client/pc')));
app.use('/mobile', express.static(path.join(__dirname, '../client/mobile')));

// 存储所有连接的客户端
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('新客户端连接');
    clients.add(ws);
    
    ws.binaryType = 'arraybuffer';
    
    ws.on('message', (data) => {
        try {
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        } catch (error) {
            console.error('发送数据时出错:', error);
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
    });
    
    ws.on('close', () => {
        console.log('客户端断开连接');
        clients.delete(ws);
    });
});

const PORT = 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`服务器运行在 https://${HOST}:${PORT}`);
    console.log(`PC端访问: https://localhost:${PORT}/pc`);
    console.log(`手机端访问: https://<你的IP地址>:${PORT}/mobile`);
}); 