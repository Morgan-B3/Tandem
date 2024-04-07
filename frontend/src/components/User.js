import React from 'react'
import "../stylesheets/UserIcon.scss"
import { useNavigate } from 'react-router'

const User = ({ name , avatar, id, creator, closeModal =()=>{} }) => {
  const navigate = useNavigate()
  const handleNavigate = () => {
    closeModal();
    navigate(`/user/${id}`);
  }
  return (
    <div className={creator===id ?'user-display user-green' :  'user-display user-white'} onClick={()=>handleNavigate()}>
        <div className='img'>
            <img src={`${process.env.REACT_APP_API_URL}/images/avatars/${avatar}`} alt='' />
        </div>
        <p>{name}</p>
    </div>
  )
}

export default User