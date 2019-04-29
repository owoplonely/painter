import React, {Component} from 'react'
import { NONAME } from 'dns';

const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#800080', '#ffa500']
const btnStyle = {
  width: '1em',
  height: '1em',
}
const liStyle = {
  listStyle: 'none',
  float: 'left',
}

function ColorSelect(props) {
  console.log('cs rendered')
  return (
    <ul>
      <li><input type="color" value={props.color} onChange={(e) => props.onChangeColor(e.target.value)} /></li>
      {
        colors.map(color => (
          <li
            key={color}
            style={liStyle}>
              <button
                style={{...btnStyle, backgroundColor: color}}
                onClick={() => props.onChangeColor(color)}></button>
          </li>
        ))
      }
    </ul>
  )
}

export default ColorSelect