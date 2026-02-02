import { createContext, useContext, useState } from "react";
import { initialState, type ActivityEntry, type Credentials, type FoodEntry, type User } from "../types";
import { useNavigate } from "react-router-dom";
import mockApi from "../assets/mockApi";
import { useEffect } from "react";

const AppContext = createContext(initialState);

export const AppProvider = ({children}: {children: React.ReactNode}) => {

  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
  const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

  const signup = async (credentials: Credentials) => {
    try {
      const {data} = await mockApi.auth.register(credentials);
      setUser(data.user);
      if(data?.user.age && data?.user?.weight && data?.user?.goal){
        setOnboardingCompleted(true);
      }
      localStorage.setItem('token', data?.jwt);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }

  const login = async (credentials: Credentials) => {
      const {data} = await mockApi.auth.login(credentials);
      setUser({...data.user, token: data?.jwt});
      if(data?.user.age && data?.user?.weight && data?.user?.goal){
        setOnboardingCompleted(true);
      }
      localStorage.setItem('token', data?.jwt);
  }

  const fetchUser = async (token: string) => {
      const {data} = await mockApi.user.me();
      setUser({...data, token});
      if(data?.user.age && data?.user?.weight && data?.user?.goal){
        setOnboardingCompleted(true);
      }
      setIsUserFetched(true);
  }

  const fetchFoodLogs = async () => {
    const {data} = await mockApi.foodLogs.list();
    setAllFoodLogs(data);
  }

  const fetchActivityLogs = async () => {
    const {data} = await mockApi.activityLogs.list();
    setAllActivityLogs(data);
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setOnboardingCompleted(false);;
    navigate('/login');
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token){
       (async () => {
        try {
          await fetchUser(token);
          await fetchFoodLogs();
          await fetchActivityLogs();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      })();
    } else {
      setIsUserFetched(true);
    }
  }, []);
  

  const value = {
    user,
    setUser,
    isUserFetched,
    fetchUser,
    signup,
    login,
    logout,
    onboardingCompleted,
    setOnboardingCompleted,
    allFoodLogs,
    allActivityLogs,
    setAllFoodLogs,
    setAllActivityLogs,
  }

  return <AppContext.Provider value={value}>
     {children}
  </AppContext.Provider>

}

export const useAppContext = () => useContext(AppContext)