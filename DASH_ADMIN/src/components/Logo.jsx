import React from 'react'
import {FireFilled} from '@ant-design/icons'
import { Image } from 'antd';
import second from '../assets/loogo.png'
const Logo = () => {
  return (
    <div className='logo' >
        <div className="logo-icon">
        <Image
    width={7000}
    src={second}
    className='lo'
    preview={false}
  />
        </div>
        <br />
    </div>
    
  )
}

export default Logo
