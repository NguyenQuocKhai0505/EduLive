import axios from "axios"
import Cookies from 'js-cookie';
import api from '@/lib/axios';
//BACKEND ADDRESS
const API_URL = 'http://localhost:3000';

export const registerUser = async(userData:any) =>{
    try{
        //CALL API
        const response = await axios.post<any>(`${API_URL}/users/register`,userData)
        return response.data
    }catch(error:any){
        if(error.response){
            throw new Error(error.response.data.message || "Server Error")
        }else if(error.request){
            throw new Error("Unable to connect to the server. Please check the backend!")
        }else{
            throw new Error("An error occurred.")
        }
    }
}
export const login = async (email: string, pass: string) => {
  try {
    
    // Sửa tên key 'pass' thành 'password' để khớp với Backend
    const response = await api.post('/auth/login', { 
      email: email, 
      password: pass 
    });
    
    // Lưu token vào Cookie
    const { access_token } = response.data;
    Cookies.set('accessToken', access_token, { expires: 1, path: '/' });
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed";
  }
};