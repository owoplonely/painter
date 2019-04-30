// Painter server
const express = require('express')
const app = express()
const SocketIO = require('socket.io')
const path = require('path')
// express().listen()返回一个http server，
const server = SocketIO(app.listen(8080))
// 静态资源
app.use(express.static(path.join(__dirname, '../fe/build')))
const Jimp = require('jimp')
const fs = require('fs')
// plan1：用一个二维数组保存图片数据
// plan2：使用图片处理库JIMP 
;(async function main() {
  const pixelData = await Jimp.read('./pixelData.png')
  
  server.on('connection', async (socket) => {
    // 上次画点的时间
    var lastDrawTime = 0
    // 每当用户连接，返回服务器上保存的图片的Arraybuffer形式
    var InitPngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
    socket.emit('init-data', InitPngBuffer)
  
    // 每当用户画一个点，更新pixelData并把更改广播给所有用户
    socket.on('draw-dot', async ({x, y, color}) => {
      // 限制用户点击的频率(throttle)
      var now = Date.now()
      console.log(now - lastDrawTime)
      if (now - lastDrawTime > 3000) {
        // Jimp有操作像素的API
        pixelData.setPixelColor(Jimp.cssColorToHex(color), x, y)
        // 把用户操作保存到文件
        var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
        fs.writeFile('./pixelData.png', buf, (err) => {
          if (err) console.log(err)
          else console.log('successively saved.')
        })
        server.emit('update-dot', {x, y, color})
        lastDrawTime = now
      }
    })
    socket.on('disconnect', () => console.log('user--'))
  })
})()
