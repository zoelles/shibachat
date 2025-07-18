import { axiosInstance } from "./axios.ts";
import { AxiosError} from 'axios';

interface SignUpData { 
    fullName: string, 
    email: string, 
    password: string; 
}

interface LoginData {
    email: string, 
    password: string; 
}

interface OnboardingData {
    fullName: string,
    bio: string, 
    nativeLanguage: string,
    learningLanguage: string,
    location: string,
    profilePic: string
}

export const signup = async (signupData: SignUpData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
} 

export const completeOnboarding = async(onboardingData: OnboardingData) => {
    const response = await axiosInstance.post("/auth/onboarding", onboardingData);
    return response.data;
}

export const login = async (loginData: LoginData) => {
    const response = await axiosInstance.post("auth/login", loginData);
    return response.data;
}

export const getAuthUser = async() => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
}

export const getErrorMessage = (error: Error) => {
    if(error instanceof AxiosError) {
      return error.response?.data.message;
    } else {
      return "Unexpected Error";
    }
}