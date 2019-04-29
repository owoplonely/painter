import React, {PureComponent} from 'react'
import ReactDom from 'react-dom'

function makeColor(color) {
  // 现场画一个取色鼠标，并返回它的dataURL
  var cursor = document.createElement('canvas'),
  ctx = cursor.getContext('2d');
  cursor.width = 41;
  cursor.height = 41;

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.moveTo(0, 6);
  ctx.lineTo(12, 6);
  ctx.moveTo(6, 0);
  ctx.lineTo(6, 12);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(25, 25, 14, 0, 2 * Math.PI, false);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(25, 25, 13.4, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();

  return cursor.toDataURL()
}

// 用canvas重构pixelGrid
class PixelGrid extends PureComponent {
  constructor(props) {
    super(props)
    this.canvas = null
    this.state = {
      zoomRatio: 5,
      dothoverX: -1,
      dotHoverY: -1,
      isPickingColor: false
    }
  }

  setUpDragHandler = () => { 
    var initialTop, initialLeft, mouseInitialX, mouseInitialY, dragging = false
    var deltaLeft, deltaTop
    this.canvasWrapper.addEventListener('mousedown', e => {
      // 点击的时候记录拖拽开始时的鼠标位置和canvas位置，并把dragging状态置为true
      initialTop = parseFloat(this.canvasWrapper.style.top)
      initialLeft = parseFloat(this.canvasWrapper.style.left)
      mouseInitialX = e.clientX
      mouseInitialY = e.clientY
      dragging = true
    })
    this.canvasWrapper.addEventListener('mouseup', e => {
      // 拖拽结束
      dragging = false
      // 防止拖拽结束时的误点击
      if (Math.sqrt(deltaLeft ** 2 + deltaTop ** 2) < 3) {
        this.handleDotClick(e)
      }
    })
    this.canvasWrapper.addEventListener('mousemove', e => {
      if (dragging) {
        // 拖拽过程中
        // 偏移量
        deltaLeft = e.clientX - mouseInitialX
        deltaTop = e.clientY - mouseInitialY
        this.canvasWrapper.style.left = initialLeft + deltaLeft + 'px'
        this.canvasWrapper.style.top = initialTop + deltaTop + 'px'
      }
    })
    // 框出当前选中的格子
    this.canvasWrapper.addEventListener('mousemove', e => {
      var x = Math.floor(e.layerX / this.state.zoomRatio) * this.state.zoomRatio
      var y = Math.floor(e.layerY / this.state.zoomRatio) * this.state.zoomRatio
        this.setState({
          dothoverX: x + 'px',
          dothoverY: y + 'px'
        })
    })
  }

  setUpZoomHandler = () => {
    // 缩放
    this.canvasWrapper.addEventListener('wheel', e => {
      var prevZoom = this.state.zoomRatio
      var newZoom = e.deltaY < 0 ? prevZoom + 1 : prevZoom - 1
      if (newZoom < 5) {
        // zoom不应该小于1，如果小于1了将其重置为1并复位
        newZoom = 5
        this.canvasWrapper.style.left = 0
        this.canvasWrapper.style.top = 0
      }
      // 更新zoom属性
      this.setState({
        zoomRatio: newZoom
      })
      // 使缩放前后鼠标所在位置上的点的位置保持不变
      // zoom是以元素左上角为原点进行缩放的
      var dx = (newZoom / prevZoom - 1) * e.layerX
      var dy = (newZoom / prevZoom - 1) * e.layerY
      this.canvasWrapper.style.left = (parseFloat(this.canvasWrapper.style.left) - dx) + 'px'
      this.canvasWrapper.style.top = (parseFloat(this.canvasWrapper.style.top) - dy) + 'px'
      e.preventDefault()
    })
  }


  componentDidMount() {
    this.setUpZoomHandler()
    this.setUpDragHandler()
    this.setUpPickHandler()
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
    this.forceUpdate()
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

  setUpPickHandler = () => {
    this.canvas.addEventListener('mousemove', e => {
      if (this.state.isPickingColor) {
        console.log(e.layerX,e.layerY)
        // 取色中...
        // 鼠标所在位置的颜色
        var colorArr = this.ctx.getImageData(parseInt(e.layerX/this.state.zoomRatio), parseInt(e.layerY / this.state.zoomRatio), 1, 1).data
        var cssColor = 'rgba(' + colorArr + ')'
        var url = makeColor(cssColor)
        this.canvas.style.cursor = `url(${url}) 6 6, crosshair`
      }
    })
    this.canvas.addEventListener('click', e => {
      // 取色完毕
      // 向上层组件传递选中的颜色
      var colorArr = Array.from(this.ctx.getImageData(parseInt(e.layerX/this.state.zoomRatio), parseInt(e.layerY / this.state.zoomRatio), 1, 1).data).slice(0, 3)
      var hexColor = '#' + colorArr.map(it => it.toString(16).padEnd(2, '0')).join('')
      console.log(hexColor)
      this.props.onPickColor(hexColor)
      // 退出取色状态
      this.setState({
        isPickingColor: false
      })
      // 重置cursor样式
      this.canvas.style.cursor = ''
    })
  }

  setPickColorState = () => {
    this.setState({
      isPickingColor: true
    })
  }

  renderPickColorBtn() {
    var el = document.getElementById('colorPicker')
    if (!el) {
      return null
    }
    return ReactDom.createPortal((
      <button onClick={this.setPickColorState}>{this.state.isPickingColor ? '正在取色' : '取色'}</button>
    ), el)
  }

  render() {
    return (
      <div style={{border: '1px solid', display: 'inline-block', height: this.props.height, width: this.props.width, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0}} ref={el => this.canvasWrapper = el}>
          {this.renderPickColorBtn()}
          <span className="dot-hover-box" style={{
            boxShadow: '0 0 1px 1px black',
            width: this.state.zoomRatio + 'px',
            height: this.state.zoomRatio + 'px',
            position: 'absolute',
            left: this.state.dothoverX,
            top: this.state.dothoverY,
            pointerEvents: 'none'
          }}></span>
          <canvas
            ref={el => this.canvas = el}
            style={{zoom: this.state.zoomRatio, imageRendering: 'pixelated'}}></canvas>
        </div>
      </div>
    )
  }
}

export default PixelGrid