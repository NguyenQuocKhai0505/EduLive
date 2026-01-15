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

// Google Login - Mở popup window để đăng nhập
export const loginWithGoogle = (): Promise<{access_token: string, user: any}> => {
    return new Promise((resolve, reject) => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const popupUrl = `${backendUrl}/auth/google`;
        const callbackUrl = `${frontendUrl}/auth/google/callback`;
        
        // Mở popup window
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const popup = window.open(
            popupUrl,
            'google-login',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
        }

        // Lắng nghe message từ popup
        const messageHandler = (event: MessageEvent) => {
            // Kiểm tra origin để đảm bảo an toàn
            if (event.origin !== frontendUrl) {
                return;
            }

            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                const { access_token, user } = event.data;
                
                // Lưu token và user
                Cookies.set('accessToken', access_token, { expires: 1, path: '/' });
                localStorage.setItem('user', JSON.stringify(user));
                
                // Dispatch custom event để NavBar cập nhật
                window.dispatchEvent(new Event('userUpdated'));
                
                // Đóng popup
                popup.close();
                
                // Xóa listener
                window.removeEventListener('message', messageHandler);
                clearInterval(checkClosed);
                
                resolve({ access_token, user });
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                popup.close();
                window.removeEventListener('message', messageHandler);
                clearInterval(checkClosed);
                reject(new Error(event.data.error || 'Authentication failed'));
            }
        };

        window.addEventListener('message', messageHandler);

        // Kiểm tra nếu popup bị đóng thủ công
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageHandler);
                reject(new Error('Authentication cancelled'));
            }
        }, 1000);
    });
};

// Xử lý sau khi Google OAuth callback thành công
export const handleGoogleCallback = async () => {
    try {
        // Kiểm tra xem có token trong cookie không
        const token = Cookies.get('accessToken');
        const userInfoCookie = Cookies.get('userInfo');
        
        if (token) {
            // Nếu có userInfo trong cookie, lưu vào localStorage
            if (userInfoCookie) {
                try {
                    const user = JSON.parse(userInfoCookie);
                    localStorage.setItem('user', JSON.stringify(user));
                    Cookies.remove('userInfo'); // Xóa cookie sau khi đã lưu
                } catch (e) {
                    console.error('Error parsing userInfo cookie:', e);
                }
            } else {
                // Nếu không có userInfo trong cookie, gọi API để lấy
                try {
                    const response = await api.get('/auth/me');
                    if (response.data) {
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error);
                }
            }
            
            // Reload page để NavBar nhận dữ liệu mới
            window.location.href = '/';
        } else {
            // Nếu không có token, có thể là lỗi
            throw new Error('Authentication failed');
        }
    } catch (error: any) {
        console.error('Google callback error:', error);
        throw error;
    }
};