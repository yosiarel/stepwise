import axios, { type AxiosResponse, type AxiosError } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag untuk menghindari beberapa pemanggilan refresh token secara paralel
let isRefreshing = false;
let failedRequestsQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Interceptor Respon Cerdas untuk Silent Refresh Token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Jangan lakukan silent refresh untuk semua endpoint authentication (/auth/login, /auth/register, /auth/refresh)
    if (originalRequest?.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // Jika mendapat status 401 Unauthorized (Akses Ditolak / Token Expired)
    if (error.response?.status === 401 && originalRequest) {
      
      // Jika token sedang diperbarui oleh request lain, antre request ini
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Tandai bahwa proses perpanjangan token sedang berlangsung
      isRefreshing = true;

      try {
        console.log('⚠️ Sesi Access Token habis/tidak ditemukan. Memperbarui token otomatis...');
        
        // Panggil endpoint refresh token di backend
        await axiosInstance.post('/auth/refresh');
        
        isRefreshing = false;
        processQueue(null);
        
        console.log('✅ Token berhasil diperbarui secara senyap (Silent Refresh)! Mengulangi request asli...');
        
        // Ulangi request asli yang gagal dengan token baru
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        
        console.error('❌ Sesi masuk telah kedaluwarsa. Mengarahkan kembali ke halaman Login.', refreshError);
        
        // Bersihkan data auth dan arahkan ke login jika token benar-benar habis masa berlakunya
        localStorage.removeItem('auth-storage'); // Bersihkan sisa zustand auth
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;