import { formatDate } from 'date-fns'
import React from 'react'
import "../stylesheets/Comment.scss"
import { useNavigate } from 'react-router'
import { BsTrash, BsFillTrashFill  } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";


const Comment = ({user, name, date, content, loggedUserID =""}) => {
    const navigate = useNavigate();



  return (
    <div className='commentItem'>
        <div className='commentImg' onClick={()=>navigate(`/user/${user.id}`)}>
            <img src={`${process.env.REACT_APP_API_URL}/images/avatars/${user.avatar.url}`}/>
        </div>
        <div className='content'>
            <div className='userInfo'>
                <p onClick={()=>navigate(`/user/${user.id}`)}>{user.name}</p>
                <div className='flex'>
                    <p>{formatDate(date, "dd/MM/yyyy - HH")}h{formatDate(date, "mm")}</p>
                    {loggedUserID === user.id ? 
                        <div>
                            <FaEdit size={20}/>
                            <BsFillTrashFill size={20}/>
                        </div>
                    :""}
                 </div>
            </div>
            <p>{content}</p>
        </div>
    </div>
  )
}

export default Comment