import React from 'react'
import {HiOutlineSun,HiOutlineMoon} from 'react-icons/hi'
import { Button } from 'antd'

export const ToggleTheme = ({darkTheme,toggleThemee}) => {
  console.log("@.0",darkTheme)
  return (
    <div className='toggle-theme-btn'>
      <Button onClick={toggleThemee} theme="dark" style={{backgroundColor:"transparent",color: darkTheme ? '#ffffff' : '#000000',}}>
        {darkTheme ? <HiOutlineSun/>:<HiOutlineMoon />
        }
      </Button>
    </div>
  )
}

export default ToggleTheme