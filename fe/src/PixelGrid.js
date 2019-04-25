import React, {Component} from 'react'

function PixelGrid(props) {
  if (!props.pixels) {
    return null
  } else {
    return (
      <table>
        <tbody>
          {
            props.pixels.map((row, ridx) => (
              <tr key={ridx}>
                {row.map((col, cidx) => <td style={{backgroundColor: col, width: '5px', height:'5px'}} onClick={() => props.onPixelClick(cidx, ridx)} key={cidx}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }
}

export default PixelGrid