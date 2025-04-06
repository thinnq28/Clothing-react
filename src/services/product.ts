import axios, { AxiosResponse } from 'axios';
import { ProductResponse } from '../responses/product/product.response';
import { InsertProductDTO } from '../dtos/product/insert.product.dto';
import { UpdateProductDTO } from '../dtos/product/update.product.dto';
import { environment } from '../environment/environment';
import useFetchWithAuth from "../fetch/FetchAdmin";

const API_PRODUCTS = `/products`;

class ProductService {

    async getAllProducts(
        name: string,
        supplierName: string,
        commodityName: string,
        isActive: boolean,
        page: number,
        limit: number
    ): Promise<ProductResponse[]> {
        const fetchWithAuth = useFetchWithAuth();
        const response: AxiosResponse<ProductResponse[]> = await fetchWithAuth(API_PRODUCTS, {
            params: { name, supplier_name: supplierName, commodity_name: commodityName, active: isActive, page, limit },
        });
        return response.data;
    }

    async getProducts(name: string) {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_PRODUCTS}/by-name`, {
            params: { product_name: name },
        });
    }

    insertProduct(fetchWithAuth: (url: string, options?: any) => Promise<any>, insertProductDTO: InsertProductDTO): Promise<any> {
        return fetchWithAuth(API_PRODUCTS, {
            method: "POST",
            body: JSON.stringify(insertProductDTO),
        });
    }
    

    async updateProduct(productId: number, updatedProduct: UpdateProductDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuth();
        const response = await fetchWithAuth(`${API_PRODUCTS}/${productId}`, {
           method: "PUT",
           body: JSON.stringify(updatedProduct)
        });
        return response.data;
    }

    async uploadImages(productId: number | string, file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_PRODUCTS}/uploads/${productId}`, {
            method: "POST",
            body: formData
        });
    }

    async uploadImageForUpdate(productId: number | string, formData: FormData): Promise<any> {
        // const formData = new FormData();
        // formData.append('file', file);
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_PRODUCTS}/uploads/${productId}`, {
            method: "POST",
            body: formData
        });
    }

    async deleteProduct(id: number): Promise<void> {
        const fetchWithAuth = useFetchWithAuth();
        await fetchWithAuth(`${API_PRODUCTS}/${id}`, {
            method: "DELETE"
        });
    }

    async getProductById(id: number) {
        const fetchWithAuth = useFetchWithAuth();
        return await fetchWithAuth(`${API_PRODUCTS}/details/${id}`);
    }
}

export default new ProductService();
