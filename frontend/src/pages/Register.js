import React, { Fragment, useEffect, useState } from 'react'

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from '../api/axios';
import { addUser } from '../slices';
import Layout from '../components/Layout';
import swal from 'sweetalert';
import { message } from 'antd';

const Register = () => {
    useEffect(()=> {
        document.title = `Inscription`;
    }, []);
    const [newUser, setNewUser] = useState({
        email: "",
        name: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState([]);
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
        // await axios.get('/sanctum/csrf-cookie');
        const res = await axios.post('/api/register', { newUser });
        if(res.data.status === 200){
            swal({
                title: "Bravo !",
                text: res.data.message,
                icon: "success",
                button: "OK"
            })
            dispatch(addUser(res.data));
            navigate("/");
        } else {
            message.error(res.data.message);
            setErrors(res.data.errors || []);
        }
    }

    // Pour empecher un message d'erreur car non-envoi du formulaire
    const handleNavigate = (e) =>{
        e.preventDefault();
        navigate('/login');
    }

    const handleErrors = (errors) => {
        return errors?.map(error => {
            return <p className='error'>{error}</p>
        });
    }

    return (
        <Fragment>
            <form onSubmit={(e)=>handleLogin(e)}>
                <h1 className="title">Inscription</h1>
                <div className='form-group'>
                    <div className='flex-col'>
                        <label htmlFor='name'>Choisissez un pseudo :</label>
                        <input type='text' name='name' value={newUser.name} placeholder='Pseudo' onChange={(e)=> handleChange(e)} autoFocus required/>
                        {handleErrors(errors.name)}
                    </div>
                    <div className='flex-col'>
                        <label htmlFor='email'>Email :</label>
                        <input type='email' name='email' value={newUser.email} placeholder='tandem@email.fr' onChange={(e)=> handleChange(e)} required/>
                        {handleErrors(errors.email)}
                    </div>
                </div>
                <div className='form-group'>
                    <div className='flex-col'>
                        <label htmlFor='password'>Mot de passe :</label>
                        <input type='password' name='password' value={newUser.password} placeholder='Mot de passe' onChange={(e)=> handleChange(e)} required/>
                        {handleErrors(errors.password)}
                    </div>
                    <div className='flex-col'>
                        <label htmlFor='password_confirmation'>Confirmer le mot de passe :</label>
                        <input type='password' name='password_confirmation' value={newUser.password_confirmation} placeholder='Confirmer le mot de passe' onChange={(e)=> handleChange(e)} required/>
                    </div>
                </div>
                <button type='submit' className='btn-green-big' aria-label='Valider' title='Valider'>Valider</button>
                <div className='connect'>
                    <p>Déjà inscrit ?</p>
                    <button type='button' aria-label='Se connecter' title='Se connecter' className='btn-green' onClick={(e) => handleNavigate(e)}>Se connecter</button>
                </div>
            </form>
        </Fragment>
    )
}

export default Register