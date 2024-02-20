import "../stylesheets/Home.scss";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Project from "../components/Project";
import { useNavigate } from "react-router-dom";
import Carousel from "../components/Carousel";
import germe from '../img/germe.png'
import axios from "../api/axios.js";

const Home = () => {
    useEffect(() => {
        document.title = `Tandem`;
    }, []);

    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

  const getProjects = async () => {
    const res = await axios.get("/api/projects");
    setProjects(res.data.projects);
  };

  useEffect(() => {
    getProjects();
  }, []);
  
  const listProject = projects.map(project => {
      return (
          <Project
              key={project.id}            
              title={project.title}
              image={project.image}
              description={project.description}
              status={project.status}
              languages={project.languages}
              creator_id={project.user_id} 
              id={project.id}>
          </Project>
      );
  });

    return (
        <Layout>
            <div className="hero">
                <img src={germe} alt="Faites germer vos projets" className="hero-image" />
                <div className="hero-content">
                    <h2 className="hero-slogan">Faites germer vos projets</h2>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <h3>Nombre d'abonnés</h3>
                            <p>4 052 470 001</p>
                        </div>
                        <div className="hero-stat">
                            <h3>Nombre de projets en cours</h3>
                            <p>300</p>
                        </div>
                        <div className="hero-stat">
                            <h3>Nombre de projets terminés</h3>
                            <p>69</p>
                        </div>
                    </div>
                </div>
            </div>
            <div id="home-top">
                <h3>Faites germer vos projets</h3>
                <button id="home-button" onClick={() => navigate("/create")}>Créer un projet</button>
            </div>

            <div>
                <p>Barre de recherche</p>
                <p>Filtre x3 </p>
            </div>
            <div>
                <h1>Liste des projets</h1>
            </div>
            <div>
                <div className="carousel">
                    <h1>Les coups de coeur</h1>
                    <Carousel />
                </div>
            </div>
            <div>
                <div>
                    <h1>Recommandations</h1>
                    {listProject}
                </div>
                <div>
                    <p>En voir plus</p>
                </div>
                <div>
                    <h1>Les créateurs les plus actifs</h1>
                    <div>
                        <p>Liste des profil</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
