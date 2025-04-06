import { OptionDTO } from '../dtos/option/option.dto';
import { OptionUpdateDTO } from '../dtos/option/option.update.dto';
import { OptionValueUpdateDTO } from '../dtos/option-value/optionValue.dto';
import useFetchWithAuth from '../fetch/FetchAdmin';

const API_OPTIONS = `/options`;
const API_OPTION_VALUES = `/option-values`;

class OptionService {
    async getAllOptions(name: string, isActive: boolean, page: number, limit: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_OPTIONS, {
            params: { name, active: isActive, page, limit },
        });
    }

    async getOptions(name: string): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_OPTIONS}/by-name`, {
            params: { option_name: name },
        });
    }

    async register(optionDTO: OptionDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_OPTIONS, {
            method: "POST",
            body: JSON.stringify(optionDTO)
        });
    }

    async update(optionDTO: OptionUpdateDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_OPTIONS}/${optionDTO.optionId}`, {
            method: "PUT",
            body: JSON.stringify(optionDTO)
        });
    }

    async updateOptionValue(optionDTO: OptionValueUpdateDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        const response = await fetchWithAuth(`${API_OPTION_VALUES}/${optionDTO.optionValueId}`, {
            method: "PUT",
            body: JSON.stringify(optionDTO)
        });
        return response.data;
    }

    async deleteOption(id: number): Promise<void> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_OPTIONS}/${id}`, {
           method: "DELETE"
        });
    }

    async getOptionById(id: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_OPTIONS}/details/${id}`);
    }

    async getAllOptionValueByOptionId(optionId: number, name: string, isActive: boolean, page: number, limit: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_OPTION_VALUES, {
            params: { option_id: optionId, name, active: isActive, page, limit },
        });
    }

    async deleteOptionValue(id: number): Promise<void> {
        const fetchWithAuth = useFetchWithAuth();
        await fetchWithAuth(`${API_OPTION_VALUES}/${id}`, {
            method: "DELETE"
        });
    }
}

export default new OptionService();
