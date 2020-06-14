'use strict'

import React from 'react'

const Files = ({handleOpenFile, files}) => (
  <div className='files-list-container'>
    <h2>Files</h2>
    <ul>
      {Object.keys(files).map((id) => (
        <li key={id}>
          <button onClick={handleOpenFile(id)}>{files[id].title}</button>
        </li>
      ))}
    </ul>
  </div>
)

export default Files
