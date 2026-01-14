import axios from "axios"

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