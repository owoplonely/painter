import React,{Component} from 'react';
import PixelGrid from './PixelGrid.js'
import ColorSelect from './ColorSelect.js'
import './App.css';
import io from 'socket.io-client'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pixelData: null,
    }
  }
  componentDidMount() {
    // Q:为什么发送ajax要在这个生命周期函数里执行？
    // A:此时DOM已经渲染好了，可以操作DOM。而且如果在willMount里运行setState的话，如果setState是异步更新，因为紧接着就运行render，状态就不会更新到state对象上。
    var socket = io('ws://localhost:8080')
    this.socket = socket
    socket.on('init-data', (data) => {
      console.log(data)
      // 拿到数据，接下来的任务就是用一个组件把它渲染出来了
      this.setState({
        pixelData: data
      })
    })
    socket.on('update-dot', ({x, y, color}) => {
      // 用户点了点：更新画布
      this.setState({
        pixelData: this.state.pixelData.map((row, ridx) => {
          // 这里想实现的是immer.js的功能
          if (ridx === y) {
            return row.map((col, cidx) => {
              if (cidx === x) {
                return color
              } else {
                return col
              }
            })
          } else {
            return row
          }
        })
      })
    })
  }
  handlePixelClick = (x, y) => {
    this.socket.emit('draw-dot', {
      x,
      y,
      color: this.state.currentColor
    })

  }
  handleChangeColor = (color) => {
    this.setState({
      currentColor: color
    })
  }
  render() {
    return (
      <div>
        <PixelGrid pixels={this.state.pixelData} onPixelClick={this.handlePixelClick}/>
        <ColorSelect color={this.state.currentColor} onChangeColor={this.handleChangeColor}/>
      </div>
    )
  }
}

export default App;
