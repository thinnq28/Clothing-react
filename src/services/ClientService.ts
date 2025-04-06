import axios, { AxiosRequestConfig } from 'axios';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { ChangePasswordDTO } from '../dtos/user/change-password.dto';
import { UserDataResponse } from '../responses/user/user.data.response';
import { environment } from '../environment/environment';

const baseURL = environment.apiBaseUrl;
class ClientService {
  private apiRegister = `/users/register`;
  private apiLogin = `${baseURL}/users/login`;
  private apiUserDetail = `/users/details`;
  private apiUpdateUser = `/users`;
  private apiChangePassword = `/users/change-password`;

  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async register(registerDTO: RegisterDTO) {
    const response = await axios.post(this.apiRegister, registerDTO);
    return response.data;
  }

  async login(loginDTO: LoginDTO) {
    return await axios.post(this.apiLogin, loginDTO);
  }

  async getUserDetail(token: string) {
    const config: AxiosRequestConfig = {
      headers: this.getAuthHeaders(token),
    };
    const response = await axios.post(this.apiUserDetail, {}, config);
    return response.data;
  }

  saveUserResponseToLocalStorage(userResponse?: UserDataResponse) {
    try {
      if (!userResponse) return;
      const userResponseJSON = JSON.stringify(userResponse);
      localStorage.setItem('user', userResponseJSON);
      console.log('User response saved to local storage.');
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }

  getUserResponseFromLocalStorage(): UserDataResponse | null {
    try {
      const userResponseJSON = localStorage.getItem('user');
      if (!userResponseJSON) return null;
      const userResponse = JSON.parse(userResponseJSON);
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null;
    }
  }

  async updateUserDetail(token: string, updateUserDTO: UpdateUserDTO) {
    const userResponse = this.getUserResponseFromLocalStorage();
    if (!userResponse?.id) throw new Error('User ID not found in local storage');
    const config: AxiosRequestConfig = {
      headers: this.getAuthHeaders(token),
    };
    const response = await axios.put(`${this.apiUpdateUser}/${userResponse.id}`, updateUserDTO, config);
    return response.data;
  }

  async changePassword(token: string, changePasswordDTO: ChangePasswordDTO) {
    const config: AxiosRequestConfig = {
      headers: this.getAuthHeaders(token),
    };
    const response = await axios.post(this.apiChangePassword, changePasswordDTO, config);
    return response.data;
  }

  removeUserFromLocalStorage() {
    try {
      localStorage.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
    }
  }
}

export default new  ClientService()