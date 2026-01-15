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
      const response = await api.post('/auth/login', { email, password: pass });
      
      // Log này cực kỳ quan trọng để xác định vị trí 'user'
      console.log("Kiểm tra response:", response.data);
  
      // Thay đổi dòng này tùy theo kết quả console.log ở trên
      const { access_token, user } = response.data; 
  
      if (access_token && user) {
        // Lưu Token vào Cookie
        Cookies.set('accessToken', access_token, { expires: 1, path: '/' });
        
        // Chỉ lưu vào localStorage khi user chắc chắn không undefined
        localStorage.setItem('user', JSON.stringify(user));
        
        // Ép tải lại trang để NavBar nhận dữ liệu mới
        window.location.href = "/"; 
      } else {
        console.error("Backend không trả về user hoặc token!");
      }
  
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Fail to login';
    }
  };

export const logout = async () =>{
    try{
        await api.post(`auth/logout`)
    }catch(error){
        console.log("Logout API error:",error)
    }finally{
        Cookies.remove("accessToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
    }
}