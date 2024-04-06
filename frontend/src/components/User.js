import React from 'react'
import "../stylesheets/UserIcon.scss"
import { useNavigate } from 'react-router'

const User = ({ name , avatar, id, creator }) => {
  const navigate = useNavigate()
  return (
    <div className={creator===id ?'user-display user-green' :  'user-display user-white'} onClick={()=>navigate(`/user/${id}`)}>
        <div className='img'>
            <img src={`${process.env.REACT_APP_API_URL}/images/avatars/${avatar}`} alt='' />
        </div>
        <p>{name}</p>
    </div>
  )
}

export default User