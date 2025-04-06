import axios from 'axios';
import { InsertVariantDTO } from '../dtos/variant/insert.variant.dto';
import { UpdateVariantDTO } from '../dtos/variant/update.variant.dto';
import { QuantityVariantDTO } from '../dtos/variant/quantity.variant.dto';
import { VariantResponse } from '../responses/variant/variant.response';
import useFetchWithAuth from '../fetch/FetchAdmin';

const apiVariants = `/variants`;

const VariantService = {
  getAllVariant: async (
    name: string,
    isActive: boolean,
    page: number,
    limit: number
  ) => {
    const params = {
      name,
      active: isActive,
      page,
      limit
    };
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(apiVariants, { params });
  },

  getVariants: async (
    name: string,
    productName: string,
    minQuantity: number,
    maxQuantity: number,
    minPrice: number,
    maxPrice: number,
    isActive: boolean,
    page: number,
    limit: number
  ) => {
    const params = {
      name,
      product_name: productName,
      min_quantity: minQuantity,
      max_quantity: maxQuantity,
      min_price: minPrice,
      max_price: maxPrice,
      active: isActive,
      page,
      limit
    };
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/for_promotion`, { params });
  },

  insert: async (insertVariantDTO: InsertVariantDTO) => {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(apiVariants, {
        method: "POST",
        body: JSON.stringify(insertVariantDTO)
    });
  },

  update: async (variantId: number, updateVariantDTO: UpdateVariantDTO) => {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/${variantId}`, {
        method: "PUT",
        body: JSON.stringify(updateVariantDTO)
    });
  },

  updateQuantity: async (variantDTOs: QuantityVariantDTO[]) => {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/update-quantity`, {
        method: "POST",
        body: JSON.stringify(variantDTOs)
    });
  },

  uploadImages: async (variantId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/uploads/${variantId}`, {
        method: "POST",
        body: formData
    });
  },

  delete: async (id: number) => {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/${id}`, {
        method: "DELETE"
    });
  },

  getVariantById: async (id: number) => {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/details/${id}`);
  },

  getVariantByIds: async (ids: number[]) => {
    const params = {
      ids: ids.toString()
    };
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/by-ids`, { params });
  },

  getVariantByProductId: async (id: number) => {
    const fetchWithAuth = useFetchWithAuth();
    return await fetchWithAuth(`${apiVariants}/by-product/${id}`);
  }
};

export default VariantService;
