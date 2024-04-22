import axios from '../api/axios';
import React, { Fragment, useEffect, useState } from 'react'
import { Collapse, Modal, Popover, Progress, Skeleton, Steps, message, Upload, Button } from "antd"
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout';


import Language from '../components/Language.js';
import { PiTreeLight, PiPlantLight } from "react-icons/pi";
import { LuNut, LuUsers2 } from "react-icons/lu";
import { format } from "date-fns";
import { FaEdit } from "react-icons/fa";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { FaHeart, FaRegHeart } from "react-icons/fa";


import "../stylesheets/ProjectDetail.scss"

import { useSelector } from 'react-redux';
import Comment from '../components/Comment.js';
import User from '../components/User.js';

const ShowProject = () => {
    const { id } = useParams();
    const loggedUser = useSelector(state => state.data.user);
    const token = useSelector(state => state.data.token);
    const navigate = useNavigate();

    const [errors, setErrors] = useState([]);
    const [project, setProject] = useState({});
    const [updateProject, setUpdateProject] = useState({});
    const [status, setStatus] = useState("");
    const [allLanguages, setAllLanguages] = useState([]);
    const [postComment, setPostComment] = useState([]);
    const [checkedState, setCheckedState] = useState([]);

    /**
     * Mise à jour du state updateProject
     */
    const handleUpdate = (e) => {
        setUpdateProject({
            ...updateProject,
            [e.target.name]: e.target.value,
        });
    }

    const handleImage = (e) =>{
        setUpdateProject({
            ...updateProject,
            image:e.target.files[0]
        })
    }

    /**
     * Gestion des skeleton antdesign
     */
    const [loading, setLoading] = useState(true);

    /**
     * Gestion des modales Antdesign
     */
    const [modals, setModals] = useState({
        steps: false,
        update: false,
        connexion: false,
        delete: false
    })

    const handleModals = (name, status) => {
        setModals({
            ...modals,
            [name]: status
        })
    }


    /**
     * Récupère le projet
     */
    const getProject = async () => {
        const res = await axios.get(`/api/project/${id}`);
        if(res.data.status === 200){
            document.title = `${res.data.project.title}`;
            setProject(res.data.project);
            
            const languagesID = res.data.project.languages.map((language) => language.id);
            
            setUpdateProject({
                title: res.data.project.title || "",
                description: res.data.project.description || "",
                languages: languagesID,
                collaborators_max: res.data.project.collaborators_max,
            });
        } else if (res.data.status === 404){
            navigate('/404')
        }

        setLoading(false);
    };


    /**
     *  Ajout / suppression d'un langage selon son état checked
     */
    const handleLanguage = (languageId) => {

        const updatedCheckedState = checkedState.map((item, index) =>
            // parcourt le tableau et ne change que le langage selectionné
            index === languageId - 1 ? !item : item
        );

        // Mise à jour du tableau checked avec cette nouvelle donnée
        setCheckedState(updatedCheckedState);

        // 2 actions possible selon l'état checked :
        if (updatedCheckedState[languageId - 1]) {
            // si checked : true
            // Ajout de l'id du langage dans le tableau project.languages
            setUpdateProject({
                ...updateProject,
                languages: [...updateProject.languages, languageId],
            });
        } else {
            // si checked : false
            // Filtre le tableau project.languages pour retirer l'id du langage
            setUpdateProject({
                ...updateProject,
                languages: [...updateProject.languages.filter((id) => id !== languageId)],
            });
        }
    };

    /**
     * Rejoindre/quitte un projet
     */
    const joinProject = async () => {
        if(loggedUser){
            await axios.put(`/api/project/${id}/join`, { headers: { "Authorization": `Bearer ${token}` } })
            getProject();
            if (project.collaboratorsList.find(collaborator => collaborator.id === loggedUser?.id)) {
                message.warning("Vous avez quitté le projet :(")
            } else {
                message.success("Vous avez rejoint le projet !")
            }
        } else {
            handleModals("connexion", true)
        }
    }

    /**
     * Récupère tous les langages
     */
    const getLanguages = async () => {
        const resLanguages = await axios("/api/languages").then(
            (res) => res.data.languages
        );
        setAllLanguages(resLanguages);
        const updatedCheckedState = resLanguages.map((language) =>
            project.languages.some((projectLanguage) => projectLanguage.id === language.id)
        );
        setCheckedState(updatedCheckedState);
    };


    /**
     * Met à jour les données du projet
     */
    const update = async (e) => {
        e.preventDefault();
        const res = await axios.post(`/api/project/${id}/update`, updateProject, { headers: {"Content-Type": "multipart/form-data" ,"Authorization": `Bearer ${token}` } });
        console.log(res.data.project);

        if (res.data.status === 200) {

            handleModals("update", false)
            getProject();
            setErrors([]);
            message.success("Le projet a été mis à jour !")
        } else {
            setErrors(res.data.errors);
        }
    };

    useEffect(() => {
        getProject();
    }, [id])


    /**
     * Change le statut du projet
     */
    const changeStatus = async (statusType) => {
        await axios.put(`/api/project/${id}/step`, { status: statusType }, { headers: { "Authorization": `Bearer ${token}` } })
        setStatus(project.status);
        getProject();
        message.success("Le projet a été mis à jour !")
    }



    const handleComment = (e) => {
        setPostComment({
            ...postComment,
            [e.target.name]: e.target.value
        })
    }


    /**
     * Ajoute un commentaire au projet
     */
    const postNewComment = async (e) => {
        e.preventDefault();
        if(loggedUser){

            const res = await axios.post(`/api/comment/${id}/store`, { comment: postComment.comment }, { headers: { "Authorization": `Bearer ${token}` } });
            if (res.data.status === 200) {
                setPostComment({ comment: "" })
                message.success("Commentaire ajouté !")
            } else {
                setErrors(res.data.errors);
            }
            getProject();
        } else {
            handleModals("connexion",true)
        }

    }


    /**
     * Génère les options pour 2 à 10 participants au projet
     */
    let participants = []
    for (let i = 2; i <= 10; i++) {
        participants.push(
            <option key={i} value={i}>{i}</option>
        )
    }

    /**
     * Liste des langages
     */
    const allLanguagesList = allLanguages.map((language, index) => (
        <Language
            key={language.id}
            name={language.name}
            checked={checkedState[index]}
            action={() => handleLanguage(language.id)}
            image={language.logo}
            type="checkbox"

        />
    ));


    /**
     * Affiche la liste des collaborateurs du projet
     */
    const collaboratorsList = project.collaboratorsList?.map((collaborator) => {
        return (
            <User
                key={collaborator.id}
                id={collaborator.id}
                name={collaborator.name}
                avatar={collaborator.avatar.url}
                creator={project.user_id}
            />
        );
    });

    /**
     * Affiche les commentaires du projet
     */
    const comments = project.comments?.map((comment) => {
        return (
            <Comment key={comment.id}
                id={comment.id}
                user={comment.user}
                date={comment.created_at}
                content={comment.content}
                loggedUserID={loggedUser?.id}
                creatorID = {project.user_id}
                token={token}
            />
        );
    });

    /**
     * Boutons de progression du projet (coté créateur)
     */
    const stepOne = () => {
        return (
            <button name='created' className='btn-green active'> <LuNut size={40} className='stepsIcons' />Projet créé</button>
        )
    }

    const stepTwo = () => {
        if (project.status === "created") {
            return (
                <button onClick={() => handleModals("steps", true)} name='ongoing' className='btn-green'><PiPlantLight size={40} className='stepsIcons' />Démarrer le projet</button>
            )
        } else {
            return (
                <button name='ongoing' className='btn-green active'><PiPlantLight size={40} className='stepsIcons' />Projet démarré</button>
            )
        }
    }

    const stepThree = () => {
        if(project.status === "created"){
            return (
                <button className='btn-orange inactive'><PiTreeLight size={40} className='stepsIcons'/>Terminer le projet</button>
            )
        } else if (project.status === "ongoing") {
            return (
                <button className='btn-orange' onClick={() => handleModals("steps", true)}><PiTreeLight size={40} className='stepsIcons'/>Terminer le projet</button>
            )
        } else {
            return (
                <button className='btn-orange active'><PiTreeLight size={40} className='stepsIcons'/>Projet terminé !</button>
            )
        }
    }

    /**
     * Statut du projet (coté collaborateur)
     */
    const statusIcon = () => {
        if (project.status === "ongoing") {
            return (
                <div className='statusInfo green'>
                    <div><PiPlantLight size={40} className='stepsIcons' /></div>
                    <p name='ongoing' >Le projet est en cours</p>
                </div>
            )
        } else if (project.status === "completed") {
            return (
                <div className='statusInfo orange'>
                    <div><PiTreeLight size={40} className='stepsIcons' /></div>
                    <p name='completed'>Le projet est terminé !</p>
                </div>

            )
        } else {
            return (
                <div className='statusInfo green'>
                    <div><LuNut size={40} className='stepsIcons' /></div>
                    <p name='created'>Le projet n'a pas encore démarré !</p>
                </div>
            )
        }
    }


    /**
     * Compteur de collaborateurs sur le projet
     */
    const collaboratorsCounter = () => {
        return (
            <Popover placement="left" content={project.collaborators === project.collaborators_max ? "Equipe complète" : ` ${project.collaborators_max - project.collaborators} place(s) restante(s)`}>
                <div className='progress'>
                    <LuUsers2 size={30} color="white" />
                    <Progress className='white' type='circle' percent={(project.collaborators / project.collaborators_max) * 100} size="small" format={(percent) => `${project.collaborators}/${project.collaborators_max}`} strokeColor={'white'} />
                </div>
            </Popover>
        )
    }

    /**
     * Bouton pour rejoindre le projet
     */
    const joinButton = () => {
        if (project.collaboratorsList?.find(collaborator => collaborator.id === loggedUser?.id)) {
            return (
                <button className='btn-orange-big' onClick={() => joinProject()}>{collaboratorsCounter()}Se retirer du projet</button>
            )
        } else if (project.status === "created" || project.status === "ongoing") {
            if (project.collaborators < project.collaborators_max) {
                return (
                    <button className='btn-green-big' onClick={() => joinProject()}>{collaboratorsCounter()}Rejoindre le projet</button>
                )
            } else {
                return (
                    <button className='btn-orange-big active'>{collaboratorsCounter()}Equipe complete</button>
                )
            }
        }
    }


    // Affichage de l'icone Favoris selon si le projet est un favori de l'utilisateur
    const favoris = () => {
        // if (user?.favorites.find(favorite => favorite.project_id === id)){
        if (project.favorites?.find(favorite => favorite.user_id === loggedUser?.id)) {
            return (
                <button type='button' className='btn-yellow-white favorites full' onClick={() => handleAction("favorite")} ><IoBookmark className='action-icon' size={25} />Retirer des favoris</button>
            )
        } else {
            return (
                <button type='button' className='btn-yellow favorites' onClick={() => handleAction("favorite")}><IoBookmarkOutline className='action-icon' size={25} />Ajouter aux favoris</button>
            )
        }
    }

    // Affichage de l'icone like selon si le projet est liké par l'utilisateur
    const like = () => {
        // if (user?.likes.find(like => like.project_id === id)){
        if (project.likes?.find(like => like.user_id === loggedUser?.id)){
            return (
                <button type='button' className='btn-red-white likes full' onClick={()=>handleAction("like")}><FaHeart className='action-icon' size={25} />{project.popularity}</button>
            )
        } else {
            return (
                <button type='button' className='btn-red likes' onClick={()=>handleAction("like")}><FaRegHeart className='action-icon' size={25} />{project.popularity}</button>
            )
        }
    }


    // Ajoute/Enlève un like/favori si l'utilisateur est connecté, sinon ouvre une modale
    const handleAction = async (action) => {
        if (loggedUser) {
            await axios.put(`/api/project/${id}/${action}`);
        } else {
            handleModals("connexion", true);
        }
        getProject()
    }

    // Supprime le projet
    const handleDeleteProject = async()=>{
        if(!loading && project.user_id === loggedUser?.id ){
            const res = await axios.delete(`/api/project/${project.id}/delete`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.status === 200) {
                message.success("Projet supprimé")
                navigate("/");
            }
          
        }
      }

    ////////////
    //MODALS
    ////////////

    /**
     * Modale du formulaire de modifiaction
     */
    const updateModal = () => {

        return(
            <Modal className='updateModal' title="Modifier" open={modals.update} onCancel={()=>handleModals("update", false)} footer={null} centered >
                <form onSubmit={(e)=>update(e)} className='params'>
                    <div className='flex'>
                        <div className='flex-col'>

                            <label htmlFor='title'>Titre :</label>
                            <input type='text' id='title' name='title' value={updateProject.title} onChange={(e) => handleUpdate(e)} />
                            <strong>{errors.title}</strong>
                        </div>

                        <div className='flex-col'>
                            <label>Nombre de collaborateurs max :</label>
                            <select id="collaborators_max" name="collaborators_max" min="1" max="20" value={updateProject?.collaborators_max || ""} onChange={(e) => handleUpdate(e)} required>
                                {participants}
                            </select>
                            <strong>{errors.collaborators_max}</strong>
                        </div>
                    </div>

                    <div className='flex-col'>
                        <label htmlFor='description'>Description :</label>
                        <textarea type='text' id='description' name='description' value={updateProject.description} onChange={(e) => handleUpdate(e)} ></textarea>
                        <strong>{errors.description}</strong>
                    </div>
                    
                    <div>
                        <label>Langages :</label>
                        <Collapse onChange={() => { getLanguages(); }} items={[
                        {
                            label: "Liste des langages",
                            children: (
                                <div className="languagesList-1">{allLanguagesList}</div>
                            )
                        }]} />
                    </div>

                    <div className='flex-col'>
                        <label htmlFor="image">Image d'illustration :</label>
                        <input type="file" id="image" name="image" accept="image/png, image/jpeg" onChange={(e) => handleImage(e)}/>
                        <strong>{errors.image}</strong>
                    </div>

                    <p className="delete" onClick={() => handleModals("delete", true)} aria-label="Supprimer le projet" title="Supprimer le projet">( ! ) Supprimer le projet</p>

                    <button type="submit" className="btn-green center">Valider</button>
                </form>
            </Modal>
        )
    }

    /**
     * Modale de progression du projet
     */
    const stepsModal = () => {
        return (
            <Modal title="" open={modals.steps} onCancel={() => handleModals("steps", false)} footer={null} centered >
                <h3>Etes vous sûr de vouloir passer à l'étape suivante ? </h3>
                <div className='flex center'>
                    <button type='button' onClick={() => (changeStatus(), handleModals("steps", false))} name='ongoing' className='btn-green'>Oui</button>
                    <button type='button' onClick={() => handleModals("steps", false)} name='closeModal' className='btn-red'>Non</button>
                </div>

            </Modal>
        )
    }

    /**
     * Modale de connexion
     */
    const connexionModal = () => {
        return(
            <Modal title="Connexion requise" open={modals.connexion} onCancel={() => handleModals("connexion", false)} footer={null} centered >
                <h3>Veuillez vous connecter pour réaliser cette action</h3>
                <div className='center flex'>
                    <button type='button' onClick={() => navigate('/login')} className='btn-green' >Me connecter</button>
                    <button type='button' onClick={() => handleModals("connexion", false)} className='btn-red' >Non merci</button>
                </div>
            </Modal>
        )
    }

    /**
     * Modale de suppression projet
     */
    const deleteModal = () => {
        return(
            <Modal title="Suppression de projet" open={modals.delete} onCancel={()=>handleModals("delete",false)} footer={null} centered >
              <h3>Voulez-vous supprimer votre projet ?</h3>
              <p>Cette action est définitive et irréversible.<br/>(Le projet sera supprimé, y compris pour vos collaborateurs)</p>
              <div className='center flex'>
              <button type='button' aria-label="Oui" title="Oui" onClick={() => handleDeleteProject()} className='btn-green' >Oui</button>
              <button type='button' aria-label="Non" title="Non" onClick={() => handleModals("delete",false)} className='btn-red' >Non</button>
              </div>
            </Modal>
        )
    }


    return (
        <Layout>

            {/* Modals */}
            {updateModal()}
            {stepsModal()}
            {connexionModal()}
            {deleteModal()}


            <div className='projectDetail'>
                <div className='projectDetailPosition'>
                    <div className='imagePosition'>
                        <img className='imageSize' src={`${process.env.REACT_APP_API_URL}/images/projects/${project.image?.includes("tandem_default_") ? "default/" : ""}`+project.image} alt="" />
                    </div>

                    <div className='descriptionPosition'>
                        <div className='projectTitle'>
                            <div className='titleDecoration'>
                                <h1 id='projectTitle'>{project.title}</h1>
                            </div>
                            <div className='creator'>
                                <h4 onClick={() => navigate(`/user/${project.user_id}`)} >{project.creator?.name}</h4>
                                <h5> {project.created_at ? format(project.created_at, "dd/MM/yyyy") : ""}</h5>
                            </div>
                        </div>

                        <p className='projectDescription'>{project.description}</p>

                        {!loading && project.user_id === loggedUser?.id ?
                            <Fragment>

                                <div className='btn-orange-position'>
                                    <button className='btn-orange' onClick={() => handleModals("update", true)}>
                                        <FaEdit />
                                        Modifier
                                    </button>
                                </div>

                                <Steps className='projectSteps' size="small" current={project.status === "created" ? 1 : project.status === "ongoing" ? 2 : 3} id="Steps" items={[
                                    {
                                        title: stepOne(),
                                    },
                                    {
                                        title: stepTwo(),
                                    },
                                    {
                                        title: stepThree(),

                                    },
                                ]} />

                            </Fragment>

                            :
                            <div className='userActions'>
                                <div className='joinProject'>
                                    {statusIcon()}
                                    {joinButton()}
                                </div>
                                <div className='actions'>
                                    {like()}
                                    {favoris()}
                                </div>
                            </div>
                        }
                    </div>

                </div>

                <div className='languagesList'>
                    <h3>Langages utilisés :</h3>
                    {project.languages && (
                        <legend name="languages" id="languages" value={project.languages} required>
                            {project.languages.map(lang => (
                                <Language
                                    key={lang.id}
                                    name={lang.name}
                                    image={lang.logo}
                                />
                            ))}
                        </legend>
                    )}
                </div>

                <div className='collabList'>
                    <div id='collaborators'>
                        <h3>Collaborateurs ({project.collaborators}/{project.collaborators_max})</h3>
                        <div className='collaboratorsList'>
                            {collaboratorsList}
                        </div>

                    </div>
                </div>

                <div className='collabList'>
                    <div id='collaborators'>
                        <h3>Laisser un commentaire</h3>
                        <form className='addComment' onSubmit={(e) => postNewComment(e)}>
                            <textarea onChange={(e) => handleComment(e)} placeholder='Votre commentaire' name='comment' id='comment' value={postComment.comment} minLength="3" maxLength="500" required />
                            <button type='submit' className="btn-green-big" >Poster</button>
                        </form>
                        <strong>{errors.comment}</strong>

                        <h3>Commentaires</h3>
                        {comments}
                    </div>
                </div>
            </div>


        </Layout>
    )

}

export default ShowProject

