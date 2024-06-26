import React, { Fragment, useEffect, useState } from 'react'
import { Modal, Tag, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from '../api/axios';
import swal from 'sweetalert';
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout';
import Language from '../components/Language.js';

import "../stylesheets/Language.scss"
import { useSelector } from 'react-redux';

const CreateProject = () => {
    useEffect(()=> {
        document.title = `Nouveau Projet`;
    }, []);

    const navigate = useNavigate();

    const user = useSelector(state => state.data.user);
    const token = useSelector(state => state.data.token);

    // State du projet qui récupère les données du formulaire
    const [project, setProject] = useState({
        title: '',
        collaborators_max: 0,
        description: '',
        languages: [],
        user_id: user? user.id : null,
    });

    // Liste de tous les langages dans la BDD, rempli via appel API
    const [languages, setLanguages] = useState([]);

    // Tableau de l'etat checked de toutes les checkbox, rempli après appel API des langages
    const [checkedState, setCheckedState] = useState([]);

    // Tableau des erreurs renvoyées par l'API après validation du formulaire
    const [errors, setErrors] = useState([]);

    // Gestion de la modale langages
    const [isModal1Open, setIsModal1Open] = useState(false);
    const showModal1 = () => {
        setIsModal1Open(true);
    };
    const handleCancel1 = () => {
        setIsModal1Open(false);
    };

    // Gestion de la modale connexion
    const [isModal2Open, setIsModal2Open] = useState(false);
    const showModal2 = () => {
      setIsModal2Open(true);
    };
    const handleCancel2 = () => {
      setIsModal2Open(false);
    };


    // Appel API pour la liste des langages
    const getLanguages = async () => {
        try{

            const res = await axios.get("/api/languages");
            // Remplissage du tableau langages
            setLanguages(res.data.languages);
            // Remplissage du tableau checked en suivant le nombre de langages
            setCheckedState(new Array(res.data.languages.length).fill(false))
        } catch {
            return{
                status: 500,
                message:"Connexion échouée"
            }
        }
    }

    const getMessage =() =>{
        return(
            !user? 
            message.warning("Pour créer un projet, veuillez vous connecter")
        :""
        )
    }

    useEffect(() => {
        getLanguages();
        getMessage();
    }, []);

    // Mise à jour du state project à chaque modification d'un champ du formulaire
    const handleInput = (e) => {
        setProject({
            ...project,
            [e.target.name]: e.target.value
        })
    };

    const handleImage = (e) =>{
        setProject({
            ...project,
            image:e.target.files[0]
        })
    }

    // Ajout / suppression d'un langage selon son état checked
    const handleOnChange = (languageId) => {
        // Mise à jour de la valeur du checked du langage sélectionné (true devient false et vice versa)
        const updatedCheckedState = checkedState.map((item, index) =>
            // parcourt le tableau et ne change que le langage selectionné
            index === languageId-1 ? !item : item
        );

        // Mise à jour du tableau checked avec cette nouvelle donnée
        setCheckedState(updatedCheckedState);

        // 2 actions possible selon l'état checked :
        if (updatedCheckedState[languageId-1]) { // si checked : true
            // Ajout de l'id du langage dans le tableau project.languages
            setProject({...project, languages:[...project.languages, languageId]});
        } else { // si checked : false
            // Filtre le tableau project.languages pour retirer l'id du langage
            setProject({...project, languages:[...project.languages.filter(id => id !== languageId)]});
        }
    };

    // Création de la liste des langages
    const languagesList = languages?.map((language, index) => {
        return (
            <Language key={language.id}
                name={language.name}
                checked={checkedState[index]}
                action={() => handleOnChange(language.id)}
                image={language.logo}
                type='checkbox'
            />
        );
    });

    // Création de la liste des langages selectionnés
    const selectedLanguages = languages?.filter((language, index)=>project.languages.includes(language.id)).map((language, index) => {
        return (
            <Language key={language.id}
            name={language.name}
            checked={checkedState[language.id-1]}
            action={() => handleOnChange(language.id)}
            image={language.logo}
            type='checkbox'
        />
        )
    })

    // Enregistrement du projet
    const saveProject = async (e) => {
        e.preventDefault();

        try{
            // Appel à l'API
            const res = await axios.post(`/api/project/store`, project, { headers: { "Content-Type": "multipart/form-data" , "Authorization":`Bearer ${token}`} });
            
            if (res.data.status === 200) {
                swal({
                    title: "Bravo !",
                    text: res.data.message,
                    icon: "success",
                    button: "OK"
                })
                setProject({
                    title: '',
                    collaborators_max: '',
                    description: '',
                    languages: [],
                })
                setErrors([]);
                navigate('/', project);
            } else {
                message.error("Champ(s) invalide(s)")
                setErrors(res.data.errors || []);
            }
        } catch {
            return{
                status: 500,
                message:"Connexion échouée"
            }
        }
    };

    let participants = []
    for(let i=2; i<=10; i++){
        participants.push(
            <option key={i} value={i}>{i}</option>
        )
    }

    const handleErrors = (errors) => {
        return errors?.map(error => {
            return <p className='error'>{error}</p>
        });
    }

    return (
        <Fragment>
            <form onSubmit={(e) => saveProject(e)}>
                <h1 className="title">Création de projet</h1>
              
                <div className='form-group'>
                    <div className='flex-col'>
                        <label htmlFor='title'>Nom du projet :</label>
                        <input type='text' id='title' name='title' placeholder='Mon super projet' value={project.title} onChange={(e)=>handleInput(e)} autoFocus required/>
                        {handleErrors(errors.title)}
                    </div>

                    <div className='flex' >
                        <label htmlFor="collaborators_max">Nombre de participants :</label>
                        <select id="collaborators_max" name="collaborators_max" value={project.collaborators_max} onChange={(e) => handleInput(e)} required >
                            <option value="">Choisir</option>
                            {participants}
                        </select>
                        {handleErrors(errors.collaborators_max)}
                    </div>
                </div>

                <div className='flex-col'>
                    <label htmlFor="description">Description du projet :</label>
                    <textarea type="text" id="description" name="description" minLength="10" maxLength="1000" placeholder='Une jolie description' size="10" value={project.description} onChange={(e) => handleInput(e)} required />
                    {handleErrors(errors.description)}
                </div>


                <div className='form-group'>
                    <div>
                        <label htmlFor="image">Image d'illustration :</label>
                        <input type="file" id="image" name="image" accept="image/png, image/jpeg" onChange={(e) => handleImage(e)}/>
                        {handleErrors(errors.image)}
                    </div>
                    <div className='flex'>
                        <label htmlFor="languages">Langages envisagés:</label>
                        <button type='button' className='btn-green' name='languages' onClick={()=>showModal1()}>Selectionner</button>
                        {handleErrors(errors.languages)}
                        
                        <Modal title="Choisir des langages" open={isModal1Open} width="fit-content" onCancel={()=> handleCancel1()} footer={null} centered>
                            <div className='languagesList-1'>
                                {languagesList}
                            </div>
                            <button className='btn-green center' onClick={()=>handleCancel1()}>Valider</button>
                        </Modal>
                    </div>

                </div>
                <div className='languagesList-2'>
                    {selectedLanguages}
                </div>
                {user ?
                    <button type='submit' className='btn-green-big'> Créer le projet</button>
                :
                    <button className='btn-orange-big-forbidden' onClick={()=>showModal2()}>Créer le projet<br/>(Connexion requise)</button>
                }
                <Modal title="Connexion requise" open={isModal2Open} width="fit-content" onCancel={()=>handleCancel2()} footer={null} centered>
                    <p>Pour créer un projet, veuillez vous connecter</p>
                    <div className='flex center'>
                        <button className='btn-green' onClick={()=>navigate('/login')}>Connexion</button>
                        <button className='btn-green' onClick={()=>navigate('/register')}>Inscription</button>
                    </div>
                </Modal>

            </form>

        </Fragment>
    )

}
export default CreateProject