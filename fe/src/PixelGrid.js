import React, {PureComponent} from 'react'

// 用canvas重构pixelGrid
class PixelGrid extends PureComponent {
  constructor(props) {
    super(props)
    this.canvas = null
    this.zoomRatio = 20
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')
    // 接收初始数据并渲染
    this.props.socket.on('init-data', pixelData => {
      this.canvas.height = pixelData.length
      this.canvas.weight = pixelData[0].length
      pixelData.forEach((row, ridx) => {
        row.forEach((color, cidx) => {
          this.draw(cidx, ridx, color)
        })
      })
    })
    this.props.socket.on('update-dot', ({x, y, color}) => {
      this.draw(x, y, color)
    })
  }

  draw = (x, y, color) => {
    this.ctx.fillStyle = color
    // 画一个点
    this.ctx.fillRect(x, y, 1, 1)
  }

  handleDotClick = (e) => {
    // e是react的事件对象，通过e.nativeEvent取得浏览器的原生事件对象
    var x = parseInt(e.nativeEvent.layerX/this.zoomRatio)
    var y = parseInt(e.nativeEvent.layerY/this.zoomRatio)
    this.props.socket.emit('draw-dot', {
      x,
      y,
      color: this.props.color
    })
  }
  render() {
    console.log('PG rendered')
    return (
      <div>
        <h1>online painter</h1>
        <canvas
          ref={el => this.canvas = el}
          style={{zoom: 20, imageRendering: 'pixelated'}}
          onClick={this.handleDotClick}></canvas>
      </div>
    )
  }
}

export default PixelGrid