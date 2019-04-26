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
      currentColor: 'black',
    }
    this.socket = io('ws://localhost:8080')
  }
  componentDidMount() {
    // Q:为什么发送ajax要在这个生命周期函数里执行？
    // A:此时DOM已经渲染好了，可以操作DOM。而且如果在willMount里运行setState的话，如果setState是异步更新，因为紧接着就运行render，状态就不会更新到state对象上。
    this.socket.on('init-data', (data) => {
      console.log(data)
      // 拿到数据，接下来的任务就是用一个组件把它渲染出来了
      this.setState({
        pixelData: data
      })
    })
  }
  handlePixelClick = (x, y) => {
    

  }
  handleChangeColor = (color) => {
    this.setState({
      currentColor: color
    })
  }
  render() {
    console.log('app rendered')
    return (
      <div>
        <PixelGrid socket={this.socket} color={this.state.currentColor}/>
        <ColorSelect color={this.state.currentColor} onChangeColor={this.handleChangeColor}/>
      </div>
    )
  }
}

export default App;
