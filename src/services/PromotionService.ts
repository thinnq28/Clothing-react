import { PromotionDTO } from "../dtos/promotion/promotion.dto";
import { PromotionVariantDTO } from "../dtos/promotion/promotion.variant.dto";
import useFetchWithAuth from "../fetch/FetchAdmin";

const API_URL = `/promotions`;

const PromotionService = {
    getAllPromotions: async (name: string, isActive: boolean, page: number, limit: number) => {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_URL, {
            params: { name, active: isActive, page, limit }
        });
    },

    insert: async (promotionDTO: PromotionDTO) => {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(API_URL, {
            method: "POST",
            body: JSON.stringify(promotionDTO)
        });
    },

    update: async (id: number, promotionDTO: PromotionDTO) => {
        const fetchWithAuth = useFetchWithAuth();
        return fetchWithAuth(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(promotionDTO)
        });
    },

    getPromotionById: async (id: number) => {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_URL}/details/${id}`);
    },

    delete: async (id: number) => {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_URL}/${id}`, {
            method: "DELETE"
        });
    },

    addForVariant: async (promotionVariantDTO: PromotionVariantDTO) => {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`/promotion-variants`, {
            method: "POST",
            body: JSON.stringify(promotionVariantDTO)
        });
    },

    deletePromotionVariant: async (variantId: number, promotionId: number) => {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`/promotion-variants`, {
            params: { variant_id: variantId, promotion_id: promotionId },
            method: "DELETE"
        });
    },
};

export default PromotionService;
