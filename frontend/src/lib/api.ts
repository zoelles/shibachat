import { axiosInstance } from "./axios.ts";

interface SignUpData { 
    fullName: string, 
    email: string, 
    password: string; 
}

export const signup = async (signupData: SignUpData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data();
} 