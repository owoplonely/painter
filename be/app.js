// Painter server
const express = require('express')
const SocketIO = require('socket.io')
const path = require('path')
// express().listen()返回一个http server，
const server = SocketIO(express().listen(8080))
// 静态资源...

// plan1：用一个二维数组保存图片数据
const pixelData = [
  ['red', 'yellow', 'blue', 'green'],
  ['red', 'yellow', 'blue', 'green'],
  ['red', 'yellow', 'blue', 'green'],
  ['red', 'yellow', 'blue', 'green'],
]

server.on('connection', (socket) => {
  // 每当用户连接，返回服务器上保存的图片
  socket.emit('init-data', pixelData)

  // 每当用户画一个点，更新pixelData并把更改广播给所有用户
  socket.on('draw-dot', ({x, y, color}) => {
    console.log(x, y, color)
    pixelData[y][x] = color
    server.emit('update-dot', {x, y, color})
  })
  socket.on('disconnect', () => console.log('user--'))
})
