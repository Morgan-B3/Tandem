import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Collapse, Modal, Popover, Skeleton, message } from "antd";
import { format } from "date-fns";
import { FaGithub, FaDiscord, FaArrowLeft, FaUserPlus, FaUserMinus } from "react-icons/fa";
import { FaBookmark , FaGear, FaAddressBook } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";


import Project from "../components/Project";
import Layout from "../components/Layout";
import User from "../components/User";
import Language from "../components/Language";
import axios from "../api/axios.js";

import "../stylesheets/UserDetail.scss";
import { getUser, removeUser } from "../slices/index.js";

const UserPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const loggedUser = useSelector((state) => state.data.user) || {};
  const token = useSelector((state) => state.data.token) || null;

  //===========
  //STATE
  //===========
  const [user, setUser] = useState({});
  const [updateUser, setUpdateUser] = useState({});
  const [allLanguages, setAllLanguages] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState({
    user: true,
    languages: true,
  });
  const [modals, setModals] = useState({
    params: false,
    contacts: false,
    logout: false,
    avatars: false,
    favorites: false,
    connexion: false,
    delete: false,
  });
  const [checkedState, setCheckedState] = useState([]);

  // Ajout / suppression d'un langage selon son état checked
  const handleLanguage = (languageId) => {
    // Mise à jour de la valeur du checked du langage sélectionné (true devient false et vice versa)
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
      setUpdateUser({
        ...updateUser,
        languages: [...updateUser.languages, languageId],
      });
    } else {
      // si checked : false
      // Filtre le tableau project.languages pour retirer l'id du langage
      setUpdateUser({
        ...updateUser,
        languages: [...updateUser.languages.filter((id) => id !== languageId)],
      });
    }
  };

  const handleModals = (name, status) => {
    setModals({
      ...modals,
      [name]: status,
    });
  };

  const handleLoading = (name, status) => {
    setLoading({
      ...loading,
      [name]: status,
    });
  };

  const handleUpdateUser = (e) => {
    setUpdateUser({
      ...updateUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatar = (value) => {
    setUpdateUser({
      ...updateUser,
      avatar_id: value,
    });
  };

  //===========
  //API CALLS
  //===========

  /**
   * Récupère les données de l'utilisateur, ses projets, ses langages et ses favoris
   */
  const getData = async () => {
    const res = await axios.get(`/api/user/${id}`);
    console.log(res.data);
    if(res.data.status === 200){
      const resUser = res.data.user
      document.title = `${resUser.name}`;
      setUser(resUser);
      handleLoading("user", false);
      
      const resProjects = await axios
      .get(`/api/projects/${id}`)
      .then((res) => res.data.projects);
      setUserProjects(resProjects);
    
      const languagesID = resUser.languagesList.map((language) => language.id);
    
      setUpdateUser({
        name: resUser.name || "",
        description: resUser.description || "",
        languages: languagesID,
        github: resUser.github || "",
        discord: resUser.discord || "",
        avatar_id: resUser.avatar_id,
      });
      setDate(resUser.created_at);
      if(loggedUser?.id == id ){
        const resFavorites = await axios.get(`/api/projects/favorites/${id}`, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        });
        setUserFavorites(resFavorites.data.projects);
      }
    } else {
      navigate('/404')
    }
  };

  /**
   * Récupère tous les langages
   */
  const getLanguages = async () => {
    if (loading.languages) {
      const resLanguages = await axios.get("/api/languages").then(
        (res) => res.data.languages
      );
      setAllLanguages(resLanguages);
      handleLoading("languages", false);
      // remplissage conditionnel tu tableau d'etat checked pour la liste des langages
      resLanguages.map((language) => {
        if (updateUser.languages.find((userLanguage) => userLanguage === language.id)) {
          setCheckedState((checkedState) => [...checkedState, true]);
        } else {
          setCheckedState((checkedState) => [...checkedState, false]);
        }
      });
    }
  };

  /**
   * Récupère tous les avatars
   */
  const getAvatars = async () => {
    const resAvatars = await axios.get("/api/avatars");
    setAvatars(resAvatars.data.avatars);
  };

  /**
   * Met à jour l'avatar de l'utilisateur
   */
  const updateAvatar = async () => {
    if(loggedUser?.id == id ){

        await axios.put(
            `/api/user/${user.id}/update/avatar`,
            { avatar: updateUser.avatar_id },
            { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            );
            handleModals("avatars", false);
            message.success("Avatar mis à jour");
        }
  };

  const handleAvatars = () => {
    if (loggedUser?.id === user.id) {
      getAvatars();
      handleModals("avatars", true);
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    if(loggedUser?.id == id ){
        console.log(updateUser);
        const update = await axios.put(`/api/user/${id}/update`, updateUser, {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        });
        if (update.data.status === 200) {
            handleModals("params", false);
            message.success("Profil mis à jour");
        } else {
            message.error("Erreur");
        }
    }
  };

  const handleLogout = async () => {
      if(loggedUser?.id == id ){
        const res = await axios.post(`/api/logout/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === 200) {
            message.success(`Déconnexion réussie`);
            
            dispatch(removeUser(res.data));
            navigate("/");
        } else {
          message.error("Erreur de déconnexion")
        }
    }
  };


  const toggleContacts = async()=>{
    if(loggedUser.id){
        await axios.put(`/api/user/contact/${id}`, { "Content-Type": "application/json", Authorization: `Bearer ${token}` });
        getData()
        if(user.contacts?.find(contact=>contact.id === loggedUser?.id)){
            message.success("Contact supprimé")
        } else {
            message.success("Contact ajouté")
        }
    } else {
        handleModals("connexion",true);
    }
  }

  const handleDeleteAccount = async()=>{
    if(loggedUser?.id == id ){
      const res1 = await axios.post(`/api/logout/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res1.data.status === 200) {
        dispatch(removeUser(res1.data));
        const res2 = await axios.delete(`/api/user/${user.id}/delete`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res2.data.status === 200) {
            message.success("Compte supprimé")
            navigate("/");
        }
      }
    }
  }

  useEffect(() => {
    getData();
  }, [id, modals.avatars, modals.params, modals.contacts]);

  //===========
  //LISTS RENDERS
  //===========

  /**
   * Liste tous les avatars
   */
  const avatarsList = avatars.map((avatar, index) => {
    return (
      <div
        className="avatar"
        key={index}
        onClick={() => handleAvatar(avatar.id)}
        name="avatar_id"
      >
        <label htmlFor={avatar.url}></label>
        <input
          type="radio"
          id={avatar.url}
          value={avatar.id}
          checked={updateUser.avatar_id === avatar.id ? true : false}
          onChange={() => handleAvatar(avatar.id)}
          name="avatar_id"
        />
        <img
          src={`${process.env.REACT_APP_API_URL}/images/avatars/${avatar.url}`}
          alt={avatar.url}
        />
      </div>
    );
  });

  /**
   * Liste les projets créés par l'utilisateur
   */
  const createdProjects = userProjects.filter((project) => project.user_id == id).map((project) => {
      return (
        <Project
          key={project.id}
          title={project.title}
          name={project.name}
          image={project.image}
          status={project.status}
          description={project.description}
          profil={project.profil}
          languages={project.languages}
          creator_id={project.user_id}
          collaborators={project.collaborators}
          collaborators_max={project.collaborators_max}
          id={project.id}
        ></Project>
      );
    });

  /**
   * Liste les projets auxquels participe l'utilisateur
   */
  const projectsList = userProjects.map((project) => {
    return (
      <Project
        key={project.id}
        title={project.title}
        name={project.name}
        image={project.image}
        status={project.status}
        description={project.description}
        profil={project.profil}
        languages={project.languages}
        creator_id={project.user_id}
        collaborators={project.collaborators}
        collaborators_max={project.collaborators_max}
        id={project.id}
      ></Project>
    );
  });

  /**
   * Liste les projets favoris
   */
  const favoritesList = userFavorites.map((project) => {
    return (
      <Project
        key={project.id}
        title={project.title}
        name={project.name}
        image={project.image}
        status={project.status}
        description={project.description}
        profil={project.profil}
        languages={project.languages}
        creator_id={project.user_id}
        collaborators={project.collaborators}
        collaborators_max={project.collaborators_max}
        id={project.id}
      ></Project>
    );
  });

  /**
   * Liste les langages de l'utilisateur
   */
  const languagesList = user.languagesList?.map((language, index) => {
    return (
      <Language key={language.id} name={language.name} image={language.logo} />
    );
  });

  /**
   * Liste tous les langages
   */
  const allLanguagesList = allLanguages.map((language, index) => {
    return (
      <Language
        key={language.id}
        name={language.name}
        checked={checkedState[index]}
        action={() => handleLanguage(language.id)}
        image={language.logo}
        type="checkbox"
      />
    );
  });

  /**
   * Liste des contacts
   */
  const contactsList = user.contacts?.map((contact, index) =>{
    return(
        <User key={index}
            id={contact.id}
            name={contact.name}    
            avatar={contact.avatar}
            closeModal={()=>handleModals("contacts",false)}
        />
    )
  })

  /**
   * Formulaire de mise à jour utilisateur
   */
  const updateForm = () => {
    return (
      <form onSubmit={(e) => handleForm(e)} className="params">
        <div className="flex-col">
          <label htmlFor="name">Pseudo :</label>
          <input
            type="text"
            id="name"
            name="name"
            value={updateUser.name}
            onChange={(e) => handleUpdateUser(e)}
            required
            max={20}
            min={3}
          />
        </div>
        <div className="flex-col">
          <label htmlFor="description">Description :</label>
          <textarea
            id="description"
            name="description"
            onChange={(e) => handleUpdateUser(e)}
            value={updateUser.description}
            maxLength={500}
          ></textarea>
        </div>
        <div className="form-group">
          <div className="flex-col">
            <label htmlFor="github">Github :</label>
            <input
              type="text"
              id="github"
              name="github"
              value={updateUser.github}
              onChange={(e) => handleUpdateUser(e)}
              max={20}
            />
          </div>
          <div className="flex-col">
            <label htmlFor="discord">Discord :</label>
            <input
              type="text"
              id="discord"
              name="discord"
              value={updateUser.discord}
              onChange={(e) => handleUpdateUser(e)}
              max={20}
            />
          </div>
        </div>
        <div>
          <label htmlFor="langages">Langages :</label>
          <Collapse id="langages" onChange={() => { getLanguages(); }} items={[ {label: "Liste des langages", children: (
            <Skeleton loading={loading.languages} active>
              <div className="languagesList-1">{allLanguagesList}</div>
            </Skeleton>
          )}]} />
        </div>
        <p className="delete" onClick={() => handleModals("delete", true)} aria-label="Supprimer le compte" title="Supprimer le compte">( ! ) Supprimer le compte</p>
        <button type="submit"className="btn-green center" aria-label="Valider" title="Valider" >Valider</button>
      </form>
    );
  };

  const contactButton = () => {
    if(user.contacts?.find(contact => contact.id === loggedUser?.id)){
        return (
            <button type="button" aria-label="Supprimer le contact" title="Supprimer le contact" className="btn-red" onClick={()=>toggleContacts()}>
            <FaUserMinus />
            Supprimer
            </button>
        ) 
    } else {
        return (
            <button type="button" aria-label="Ajouter aux contacts" title="Ajouter aux contacts" className="btn-green" onClick={()=>toggleContacts()}>
            <FaUserPlus />
            Ajouter
            </button>
        ) 
    }
  }

  //===========
  //MODALS
  //===========
  const paramsModal = () => {
    return (
      <Modal
        title="Paramètres du profil"
        open={modals.params}
        onCancel={() => handleModals("params", false)}
        footer={null}
        centered
      >
        {updateForm()}
      </Modal>
    );
  };

  const contactsModal = () => {
    return (
      <Modal
        title={`Contacts de ${user.name}`}
        open={modals.contacts}
        onCancel={() => handleModals("contacts", false)}
        footer={null}
        centered
      >
        {contactsList?.length > 0 ? (
          <div className="usersList">
            {contactsList}
          </div>
        ):(
          <p>L'utilisateur n'a pas encore de contacts.</p>
        )}
      </Modal>
    );
  };

  const logoutModal = () => {
    return (
      <Modal
        title={`Déconnexion`}
        open={modals.logout}
        onCancel={() => handleModals("logout", false)}
        footer={null}
        centered
      >
        <p>Voulez-vous vous déconnecter ?</p>
        <div className="flex center">
            <button type="button" className="btn-red" aria-label="Oui" title="Oui" onClick={() => handleLogout()}>
            Oui
            </button>
            <button type="button" className="btn-green" aria-label="Non" title="Non" onClick={() => handleModals("logout", false)}>
            Non
            </button>
        </div>
      </Modal>
    );
  };

  const avatarsModal = () => {
    return (
      <Modal
        title={`Changer d'avatar`}
        open={modals.avatars}
        onCancel={() => handleModals("avatars", false)}
        footer={null}
        centered
      >
        <div className="avatarsList">{avatarsList}</div>
        <button type="button" className="center btn-green" aria-label="Valider" title="Valider" onClick={() => updateAvatar()}>
          Valider
        </button>
      </Modal>
    );
  };

  const favoritesModal = () => {
    return (
      <Modal
        title={`Favoris`}
        open={modals.favorites}
        onCancel={() => handleModals("favorites", false)}
        footer={null}
        centered
      >
        {favoritesList.length > 0 ? (
          <div className="projectsList">{favoritesList}</div>
        ):(
          <p>L'utilisateur n'a pas encore de projets favoris.</p>
        )}
      </Modal>
    );
  };

  const connexionModal = () => {
    return(
        <Modal title="Connexion requise" open={modals.connexion} onCancel={()=>handleModals("connexion",false)} footer={null} centered >
            <h3>Veuillez vous connecter pour réaliser cette action</h3>
            <div className='center flex'>
            <button type='button' aria-label="Se connecter" title="Se connecter" onClick={() => navigate('/login')} className='btn-green' >Me connecter</button>
            <button type='button' aria-label="Non" title="Non" onClick={() => handleModals("connexion",false)} className='btn-red' >Non merci</button>
            </div>
        </Modal>
    )
  }

  const deleteModal = () => {
    return(
      <Modal title="Suppression de compte" open={modals.delete} onCancel={()=>handleModals("delete",false)} footer={null} centered >
        <h3>Voulez-vous supprimer votre compte ?</h3>
        <p>Cette action est définitive et irréversible.<br/>(Tous vos projets seront supprimés, y compris pour vos collaborateurs)</p>
        <div className='center flex'>
        <button type='button' aria-label="Oui" title="Oui" onClick={() => handleDeleteAccount()} className='btn-green' >Oui</button>
        <button type='button' aria-label="Non" title="Non" onClick={() => handleModals("delete",false)} className='btn-red' >Non</button>
        </div>
      </Modal>
    )
  }

  return (
    <Layout>
      {/* Modals */}
      {paramsModal()}
      {contactsModal()}
      {logoutModal()}
      {avatarsModal()}
      {favoritesModal()}
      {connexionModal()}
      {deleteModal()}

      <div id="user">
        <div className="user-profile">
          <FaArrowLeft
            size={25}
            className="top-left-btn"
            onClick={() => navigate(-1)}
          />
          {loggedUser?.id == id ? (
            <div className="top-right-btn">
              <button type="button" aria-label='Favoris' title='Favoris' onClick={() => handleModals("favorites", true)} className="btn-yellow">
                <FaBookmark/>
                Favoris
              </button>
              <button type="button" aria-label='Paramètres' title='Paramètres' onClick={() => handleModals("params", true)} className="btn-green" >
                <FaGear/>
                Paramètres
              </button>
              <button type="button" aria-label='Déconnexion' title='Déconnexion' onClick={() => handleModals("logout", true)} className="btn-red" >
                <FiLogOut/>
                Déconnexion
              </button>
            </div>
          ) : (
            ""
          )}
          <div className="profile">
            <div className={loggedUser?.id === user.id ? "avatar img-hover" : "avatar"}  onClick={() => handleAvatars()} title={loggedUser?.id === user.id ? "Changer d'avatar" : ""} >
              {loading.user ? (
                <Skeleton.Avatar active size={100} />
              ) : (
                <Fragment>
                  <img src={`${process.env.REACT_APP_API_URL}/images/avatars/${user.avatar}`} alt={loggedUser?.id === user.id ? "Changer d'avatar" : ""} />
                  {loggedUser.id === user.id ? (
                    <p className="hidden">Changer d'avatar</p>
                  ) : (
                    ""
                  )}
                </Fragment>
              )}
            </div>
            <div className="links">
            <Skeleton loading={loading.user} active paragraph={false}>
              {user.github ? (
                <Popover placement="right" title="" content="Copié !" trigger="click">
                  <div className="github" aria-label="Copier le pseudo" title="Copier le pseudo" onClick={() => {navigator.clipboard.writeText(user.github);}} >
                    <FaGithub size={25} />
                    <p>{user.github}</p>
                  </div>
                </Popover>
              ) : (
                ""
              )}
              {user.discord ? (
                <Popover placement="right" title="" content="Copié !" trigger="click" >
                  <div className="discord" aria-label="Copier le pseudo" title="Copier le pseudo" onClick={() => { navigator.clipboard.writeText(user.discord); }} >
                    <FaDiscord size={25} className="discord-icon" />
                    <p>{user.discord}</p>
                  </div>
                </Popover>
              ) : (
                ""
              )}
                   
            </Skeleton>
            </div>
            <div className="contacts">
              {loggedUser?.id === user.id ? ( "" ) : ( contactButton() )}
              <button type="button" onClick={()=>handleModals("contacts", true)} className="btn-orange" >
                <FaAddressBook/>
                Contacts
              </button>
            </div>
          </div>
          <div className="description-profile">
            <div className="user-description">
              <Skeleton loading={loading.user} active>
                <div id="user-name">
                  <h1>{user.name}</h1>
                  <p className="date">
                    Membre depuis le : {date ? format(date, "dd/MM/yyyy") : ""}
                  </p>
                </div>
                {user.description ? (
                  <p className="description">{user.description}</p>
                ) : loggedUser?.id === user.id ? (
                  <p onClick={() => handleModals("params", true)} className="addDetails">
                    Ajouter une description
                  </p>
                ) : (
                  ""
                )}
              </Skeleton>
            </div>
            <div id="user-languages">
              <h2>Langages connus :</h2>
              <Skeleton loading={loading.user} active paragraph={false}>
                {languagesList?.length > 0 ? (
                  <div className="languagesList-profile">{languagesList}</div>
                ) : loggedUser?.id === user.id ? (
                  <p onClick={() => handleModals("params", true)} className="addDetails">
                    Ajouter des langages
                  </p>
                ) : (
                  <p className="blank">
                    L'utilisateur n'a indiqué aucun langage pour le moment.
                  </p>
                )}
              </Skeleton>
            </div>
          </div>
        </div>
        <div className="user-body">
          <div id="user-created">
            <h2>Projets créés :</h2>
            <Skeleton loading={loading.user} active>
              {createdProjects?.length > 0 ? (
                <div className="projectsList">{createdProjects}</div>
              ) : (
                <p className="blank">
                  L'utilisateur n'a pas encore créé de projets.
                </p>
              )}
            </Skeleton>
          </div>
          <div id="user-projects">
            <h2>Participation :</h2>
            <Skeleton loading={loading.user} active>
              {projectsList?.length > 0 ? (
                <div className="projectsList">{projectsList}</div>
              ) : (
                <p className="blank">
                  L'utilisateur n'a participé à aucun projet pour le moment.
                </p>
              )}
            </Skeleton>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserPage;
