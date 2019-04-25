import React, {Component} from 'react'
import { NONAME } from 'dns';

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'aqua', 'purple']
const btnStyle = {
  width: '1em',
  height: '1em',
}
const liStyle = {
  listStyle: 'none',
  float: 'left',
}

function ColorSelect(props) {
  return (
    <ul>
      {
        colors.map(color => (
          <li key={color} style={liStyle}><button style={{...btnStyle, backgroundColor: color}} onClick={() => props.onChangeColor(color)}></button></li>
        ))
      }
    </ul>
  )
}

export default ColorSelect