import axios, { AxiosResponse } from 'axios';
import { UserResponse } from '../responses/user/user.response';
import { CommodityDTO } from '../dtos/commodity/commodity.dto';
import useFetchWithAuth from '../fetch/FetchAdmin';

const API_COMMODITIES = `/commodities`;
const CLIENT_COMMODITY_API = `/client-commodity`;

class CommodityService {
  async getAllCommodities(name: string, isActive: boolean, page: number, limit: number): Promise<UserResponse[]> {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(API_COMMODITIES, {
      params: { name, active: isActive, page, limit },
    });
  }

  async getAllCommoditiesWithoutParams(): Promise<UserResponse[]> {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(CLIENT_COMMODITY_API);
  }

  async getCommodities(name: string) {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${API_COMMODITIES}/by-name`, {
      params: { commotity_name: name },
    });
  }

  async register(commodityDTO: CommodityDTO): Promise<any> {
    const fetchWithAuth = useFetchWithAuth();
    const response = await fetchWithAuth(API_COMMODITIES, {
      method: "POST",
      body: JSON.stringify(commodityDTO)
    });
    return response.data;
  }

  async update(commodityDTO: CommodityDTO, id: number): Promise<any> {
    const fetchWithAuth = useFetchWithAuth();
    const response = await fetchWithAuth(`${API_COMMODITIES}/${id}`, {
      method: "PUT",
      body: JSON.stringify(commodityDTO)
    });
    return response.data;
  }

  async getCommodityById(id: number): Promise<UserResponse> {
    const fetchWithAuth = useFetchWithAuth();
    const response: AxiosResponse<UserResponse> = await fetchWithAuth(`${API_COMMODITIES}/details/${id}`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    const fetchWithAuth = useFetchWithAuth();
    await fetchWithAuth(`${API_COMMODITIES}/${id}`, {
      method: "DELETE"
    });
  }
}

export default new CommodityService();
