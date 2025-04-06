import axios from 'axios';
import { CommentRateDTO } from '../dtos/comment-rate/comment-rate.dto';
import { environment } from '../environment/environment';
import useFetchWithAuthUser from '../fetch/FetchUser';

const api = `/comment-rate`;

class CommentService {
    async insert(commentRateDTO: CommentRateDTO): Promise<any> {
        const fetchWithAuth = useFetchWithAuthUser();
        return await fetchWithAuth(api, {
            method: "POST",
            body: JSON.stringify(commentRateDTO)
        });
    
    }
    
    async getCommentsByProductId(productId: number): Promise<any> {
        const fetchWithAuth = useFetchWithAuthUser();
        return await fetchWithAuth(`${environment.apiBaseUrl}/products/${productId}/comments`);
    }
}



export default new CommentService();