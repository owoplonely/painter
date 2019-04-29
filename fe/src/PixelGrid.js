import React, {PureComponent} from 'react'

// 用canvas重构pixelGrid
class PixelGrid extends PureComponent {
  constructor(props) {
    super(props)
    this.canvas = null
    this.state = {
      zoomRatio: 5,
      dothoverX: -1,
      dotHoverY: -1,
    }
  }

  setUpDragHandler = () => { 
    var initialTop, initialLeft, mouseInitialX, mouseInitialY, dragging = false
    var deltaLeft, deltaTop
    this.canvas.addEventListener('mousedown', e => {
      // 点击的时候记录拖拽开始时的鼠标位置和canvas位置，并把dragging状态置为true
      initialTop = parseFloat(this.canvas.style.top)
      initialLeft = parseFloat(this.canvas.style.left)
      mouseInitialX = e.clientX
      mouseInitialY = e.clientY
      dragging = true
    })
    this.canvas.addEventListener('mouseup', e => {
      // 拖拽结束
      dragging = false
      // 防止拖拽结束时的误点击
      if (Math.sqrt(deltaLeft ** 2 + deltaTop ** 2) < 3) {
        this.handleDotClick(e)
      }
    })
    this.canvas.addEventListener('mousemove', e => {
      if (dragging) {
        // 拖拽过程中
        // 偏移量
        deltaLeft = e.clientX - mouseInitialX
        deltaTop = e.clientY - mouseInitialY
        this.canvas.style.left = initialLeft + deltaLeft / this.state.zoomRatio + 'px'
        this.canvas.style.top = initialTop + deltaTop / this.state.zoomRatio + 'px'
      }
    })
  }

  setUpZoomHandler = () => {
    // 缩放
    this.canvas.addEventListener('wheel', e => {
      var prevZoom = this.state.zoomRatio
      var newZoom = e.deltaY < 0 ? prevZoom + 1 : prevZoom - 1
      if (newZoom < 5) {
        // zoom不应该小于1，如果小于1了将其重置为1并复位
        newZoom = 5
        this.canvas.style.left = 0
        this.canvas.style.top = 0
      }
      // 更新zoom属性
      this.setState({
        zoomRatio: newZoom
      })
      // 使缩放前后鼠标所在位置上的点的位置保持不变
      // zoom是以元素左上角为原点进行缩放的
      var dx = (newZoom / prevZoom - 1) * e.layerX
      var dy = (newZoom / prevZoom - 1) * e.layerY
      this.canvas.style.left = (parseFloat(this.canvas.style.left) * prevZoom - dx) / newZoom + 'px'
      this.canvas.style.top = (parseFloat(this.canvas.style.top) * prevZoom - dy) / newZoom + 'px'
      e.preventDefault()
    })
  }


  componentDidMount() {
    this.setUpZoomHandler()
    this.setUpDragHandler()
    this.ctx = this.canvas.getContext('2d')
    // 接收初始数据并渲染
    this.props.socket.on('init-data', async pixelData => {
      // 将pixelData转换成一个image对象
      var image = await createImageFromArrayBuffer(pixelData)
      // 这里的image的宽高为为什么是0？--要到image的onload时候再画
      this.canvas.width = 20
      this.canvas.height = 20
      // 把image画canvas上
      this.ctx.drawImage(image, 0, 0)
      function createImageFromArrayBuffer(buf) {
        return new Promise(resolve => {
          var blob = new Blob([buf], {type: 'image/png'})
          var image = new Image()
          image.onload = () => resolve(image)
          var url = URL.createObjectURL(blob)
          image.src = url
        })
      }
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
    var x = parseInt(e.layerX/this.state.zoomRatio)
    var y = parseInt(e.layerY/this.state.zoomRatio)
    this.props.socket.emit('draw-dot', {
      x,
      y,
      color: this.props.color
    })
  }
  render() {
    return (
      <div style={{border: '1px solid', display: 'inline-block', height: this.props.height, width: this.props.width, overflow: 'hidden'}}>
        <div style={{position: 'relative'}}>
          <span className="dot-hover-box" style={{
            boxShadow: '0 0 3px 3px black',
            width: this.state.zoomRatio + 'px',
            height: this.state.zoomRatio + 'px'
          }}></span>
          <canvas
            ref={el => this.canvas = el}
            style={{zoom: this.state.zoomRatio, imageRendering: 'pixelated', position: 'absolute', left: 0, top: 0}}></canvas>
        </div>
      </div>
    )
  }
}

export default PixelGrid