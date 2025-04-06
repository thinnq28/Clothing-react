import { VoucherDTO } from '../dtos/voucher/voucher.dto';
import useFetchWithAuth from '../fetch/FetchAdmin';

const API_URL = `/vouchers`;

export class VoucherService {
    static async getAllVouchers(code: string, startDate: string, endDate: string, isActive: boolean, page: number, limit: number) {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_URL, {
            params: { code, startDate, endDate, active: isActive, page, limit }
        });
    }

    static async insert(voucherDTO: VoucherDTO) {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_URL, {
            body: JSON.stringify(voucherDTO),
            method: "POST"
        });
    }

    static async update(id: number, voucherDTO: VoucherDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(voucherDTO)
        });
    }

    static async getVoucherById(id: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_URL}/details/${id}`);
    }

    static async delete(id: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_URL}/${id}`, {
            method: "DELETE"
        });

    }

    static async getVoucherByCode(voucherCode: string, userId: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_URL}/by-code`, {
            params: { code: voucherCode, userId },
        });
    }
}
