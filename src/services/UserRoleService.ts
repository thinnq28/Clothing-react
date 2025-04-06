import { UserRoleDTO } from "../dtos/user-role/UserRoleDTO";
import useFetchWithAuth from "../fetch/FetchAdmin";

// Biến môi trường
const API_USER_ROLES = `/user_roles`;

// Gọi API thêm quyền cho user
export const addUserRole = (userId: number, roleId: number) => {
    const userRoleDTO: UserRoleDTO = { userId, roleId };
    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth(API_USER_ROLES, {
        method: "POST",
        body: JSON.stringify(userRoleDTO)
    });
};

// Gọi API xóa quyền của user
export const deleteUserRole = (userId: number, roleId: number) => {
    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth(`${API_USER_ROLES}?user_id=${userId}&role_id=${roleId}`, {
        method: "DELETE"
    });
};
