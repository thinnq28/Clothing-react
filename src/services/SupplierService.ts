import axios, { AxiosResponse } from 'axios';
import { UserResponse } from '../responses/user/user.response';
import { SupplierDTO } from '../dtos/supplier/supplier.dto';
import useFetchWithAuth from '../fetch/FetchAdmin';

const API_SUPPLIERS = `/suppliers`;

class SupplierService {
    async getAllSuppliers(
        name: string,
        phoneNumber: string,
        email: string,
        isActive: boolean,
        page: number,
        limit: number
    ) {
        const fetchWithAuth = useFetchWithAuth();
        return fetchWithAuth(API_SUPPLIERS, {
            params: { name, active: isActive, phone_number: phoneNumber, email, page, limit },
        });
    }

    async getSuppliers(name: string) {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_SUPPLIERS}/by-name`, {
            params: { supplier_name: name },
        });
    }

    async register(supplierDTO: SupplierDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_SUPPLIERS, {
            method: "POST",
            body: JSON.stringify(supplierDTO)
        });
    }

    async update(supplierDTO: SupplierDTO, id: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_SUPPLIERS}/${id}`, {
            method: "PUT",
            body: JSON.stringify(supplierDTO)
        });
    }

    async getSupplierById(id: number): Promise<UserResponse> {
        const fetchWithAuth = useFetchWithAuth();
        const response: AxiosResponse<UserResponse> = await fetchWithAuth(`${API_SUPPLIERS}/details/${id}`);
        return response.data;
    }

    async delete(id: number) {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_SUPPLIERS}/${id}`, {
            method: "DELETE"
        });
    }
}

export default new SupplierService();
