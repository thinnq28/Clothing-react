import axios from 'axios';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { UserDataResponse } from '../models/UserDataResponse';
import { ChangePasswordDTO } from '../dtos/user/change-password.dto';
import { environment } from '../environment/environment';
import { UserResponse } from '../responses/user/user.response';
import useFetchWithAuth from '../fetch/FetchAdmin';

const apiBaseUrl = environment.apiBaseUrl;

class UserService {
  private apiRegister = `${apiBaseUrl}/users/admin/register`;
  private apiLogin = `${apiBaseUrl}/users/admin/login`;
  private apiUserDetail = `${apiBaseUrl}/users/admin/details`;
  private apiUpdateUser = `${apiBaseUrl}/users/admin`;
  private apiChangePassword = `${apiBaseUrl}/users/admin/change-password`;
  private apiGetAllUsers = `${apiBaseUrl}/users/admin`;


  async register(registerDTO: RegisterDTO) {
    return axios.post(this.apiRegister, registerDTO);
  }

  async login(loginDTO: LoginDTO) {
    return axios.post(this.apiLogin, loginDTO);
  }

  async getUserDetail() {
    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth(`/users/admin/details`, {
      method: "POST"
    });
  }

  removeUserFromLocalStorage() {
    try {
      localStorage.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
    }
  }

  async getAllUsers({
    name,
    phoneNumber,
    email,
    roleId,
    isActive,
    page,
    limit
  }: {
    name: string;
    phoneNumber: string;
    email: string;
    roleId: number;
    isActive: boolean;
    page: number;
    limit: number;
  }) {
    const params = {
      name,
      role_id: roleId.toString(),
      active: isActive.toString(),
      phone_number: phoneNumber,
      email,
      page: page.toString(),
      limit: limit.toString(),
    };

    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth("/users/admin", { params });
  }


  async deleteUser(id: number) {
    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth(`/users/admin/${id}`, {
      method: "DELETE"
    });
  }

  async updateUserDetail(userId: number, updateUserDTO: UpdateUserDTO) {
    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth(`/users/admin/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updateUserDTO)
    });
  }


  saveUserResponseToLocalStorage(userResponse?: UserDataResponse) {
    try {
      if (!userResponse) return;
      localStorage.setItem('user', JSON.stringify(userResponse));
      console.log('User response saved to local storage.');
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }

  getUserResponseFromLocalStorage(): UserDataResponse | null {
    try {
      const userResponseJSON = localStorage.getItem('user');
      return userResponseJSON ? JSON.parse(userResponseJSON) : null;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null;
    }
  }

}

export default new UserService();
