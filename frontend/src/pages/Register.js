import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from '../api/axios';
import { addUser } from '../slices';
import Layout from '../components/Layout';

const Register = () => {
    const [newUser, setNewUser] = useState({
        email: "",
        name: "",
        password: "",
        password_confirmation: "",
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name] : e.target.value
        })
    }

    const handleLogin = async (e) =>{
        e.preventDefault();
        await axios.get('/sanctum/csrf-cookie');
        const res = await axios.post('/api/register', { newUser });
        dispatch(addUser(res.data.user));
        navigate('/');
    }

    return (
        <Layout>
            <div>Login</div>
            <form onSubmit={(e)=>handleLogin(e)}>
                <div>
                    <label htmlFor='name'>Choisissez un pseudo :</label>
                    <input type='text' name='name' value={newUser.name} placeholder='Pseudo' onChange={(e)=> handleChange(e)} required/>
                </div>
                <div>
                    <label htmlFor='email'>Email :</label>
                    <input type='email' name='email' value={newUser.email} placeholder='Email' onChange={(e)=> handleChange(e)} required/>
                </div>
                <div>
                    <label htmlFor='password'>Mot de passe :</label>
                    <input type='password' name='password' value={newUser.password} placeholder='Mot de passe' onChange={(e)=> handleChange(e)} required/>
                </div>
                <div>
                    <label htmlFor='password_confirmation'>Confirmer le mot de passe :</label>
                    <input type='password' name='password_confirmation' value={newUser.password_confirmation} placeholder='Confirmer le mot de passe' onChange={(e)=> handleChange(e)} required/>
                </div>
                <button type='submit'>Valider</button>
            </form>
            <p>Déjà inscrit ?</p>
            <button onClick={() => navigate('/login')}>Se connecter</button>
        </Layout>
    )
}

export default Register