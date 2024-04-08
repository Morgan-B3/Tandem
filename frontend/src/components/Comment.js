import { formatDate } from 'date-fns'
import React, { useState } from 'react'
import "../stylesheets/Comment.scss"
import { useNavigate } from 'react-router'
import { BsTrash, BsFillTrashFill  } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { message, Modal } from "antd"
import axios from '../api/axios.js';



const Comment = ({user, id, name, date, content, loggedUserID ="", token, creatorID}) => {
    const navigate = useNavigate();

    const [update, setUpdate] = useState(false)
    const [updateComment, setUpdateComment] = useState(content)
    const [comment, setComment] = useState(content)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [commentExists, setCommentExists] = useState(true)

    const handleUpdateComment = async()=>{
        const res = await axios.put(`/api/comment/${id}/update`, {content: updateComment}, { headers: { "Authorization": `Bearer ${token}` } })
        console.log(res);
        if(res.data.status === 200){
            message.success("Message modifié")
            setComment(updateComment)
            setUpdate(false)
        } else {
            message.error(res.data.errors)
        }
    }

    const handleDeleteComment = async()=>{
        const res = await axios.delete(`/api/comment/${id}/delete`, { headers: { "Authorization": `Bearer ${token}` } })
        if(res.data.status === 200){
            message.success("Commentaire supprimé")
            setIsModalOpen(false)
            setCommentExists(false)
        }
    }

    const deleteModal = () => {
        return(
                <Modal title="Suppression du commentaire" open={isModalOpen} onCancel={()=>setIsModalOpen(false)} footer={null} centered >
                <h3>Voulez-vous supprimer ce commentaire ?</h3>
                <div className='center flex'>
                <button type='button' aria-label="Oui" title="Oui" onClick={() => handleDeleteComment()} className='btn-green' >Oui</button>
                <button type='button' aria-label="Non" title="Non" onClick={() => setIsModalOpen(false)} className='btn-red' >Non</button>
                </div>
                </Modal>
        )
    }

    if(commentExists){
        return (
            <>
            {deleteModal()}
            <div className={user.id === creatorID ?'commentItem commentAdmin' : 'commentItem'}>
                <div className='commentImg' onClick={()=>navigate(`/user/${user.id}`)}>
                    <img src={`${process.env.REACT_APP_API_URL}/images/avatars/${user.avatar.url}`}/>
                </div>
                <div className='content'>
                    <div className='userInfo'>
                        <p onClick={()=>navigate(`/user/${user.id}`)} className='userName'>{user.name}</p>
                        <div className='flex'>
                            <p>{formatDate(date, "dd/MM/yyyy - HH")}h{formatDate(date, "mm")}</p>
                            {loggedUserID === user.id ? update ?
                                <div className='icons'>
                                    <MdCheckCircle size={20} className='validate-icon' title='Valider' onClick={()=>handleUpdateComment()} />
                                    <MdCancel size={20} className='delete-icon' title='Annuler' onClick={()=>setUpdate(false)} />
                                </div>
                                :
                                <div className='icons'>
                                    <FaEdit size={20} title='Modifier' onClick={()=>setUpdate(true)} className='edit-icon'/>
                                    <BsFillTrashFill size={20} title='Supprimer' onClick={()=>setIsModalOpen(true)} className='delete-icon'/>
                                </div>
                                :  loggedUserID === creatorID ?
                                <div className='icons'>
                                    <BsFillTrashFill size={20} title='Supprimer' onClick={()=>setIsModalOpen(true)} className='delete-icon'/>
                                </div>
                                :""
                            }
                        </div>
                    </div>
                    {loggedUserID === user.id && update ?
                        <textarea onChange={(e) => setUpdateComment(e.target.value)} placeholder='Votre commentaire' name='comment' id='comment'>{comment}</textarea>
                        :
                        <p>{comment}</p>
                    }
                </div>
            </div>
            </>
        )
    }
}

export default Comment