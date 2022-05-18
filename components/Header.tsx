import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import Paul_Logo_Full from '../images/Paul_Logo_Full.png';

function Header() {
  return (
    <header className='flex justify-center p-5 max-w-7xl mx-auto'> 
        <div className='flex items-center space-x-5'>
            <Link href="/">
                <img className='w-44 object-contain cursor-pointer' src="https://cdn.discordapp.com/attachments/972007130792075304/972010444032192573/Paul_Logo_Full.png"/>
            </Link>
        </div>
    </header>
  )
}

export default Header