import {Routes,BrowserRouter as Router,Route} from 'react-router-dom';
import React from 'react';


import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';


const App = () => {
  const {token,login,logout,userId} = useAuth();
  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" exact="true" element={<Users/>}>
        </Route>
        <Route path="/:userId/places" exact="true" element={<UserPlaces />}>
        </Route>
        <Route path="/places/new" exact="true" element={<NewPlace />}>
        </Route>
        <Route path="/places/:placeId" element={<UpdatePlace />}>
        </Route>
        
      </Routes>
    );
  } else {
    routes = (
      <Routes>
       <Route path="/" exact="true" element={<Users/>}>
        </Route>
        <Route path="/:userId/places" exact="true" element={<UserPlaces />}>
        </Route>
        <Route path="/auth" exact="true" element={<Auth />}>
        </Route>
      </Routes>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!token,userId:userId,token:token, login: login, logout: logout }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
