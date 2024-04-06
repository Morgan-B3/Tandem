import './stylesheets/App.scss';
import Home from './pages/Home';
import ShowProject from './pages/ShowProject'
import ShowUser from './pages/ShowUser'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Form from './components/Form.js';
import ScrollToTop from './components/ScrollToTop.js';
// import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Routes>
          <Route path='/' element={<Home />} />

          <Route path='/create' element={<Form content='newProject' />} />

          <Route path='/login' element={<Form content='login' />} />
          <Route path='/register' element={<Form content='register' />} />

          <Route path='/project/:id' element={<ShowProject />} />
          <Route path='/user/:id' element={<ShowUser />} />

          <Route path='*' element={<Form content="notFound" />} />
        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
}

export default App;
