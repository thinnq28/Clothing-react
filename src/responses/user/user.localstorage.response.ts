import { Role } from "../../models/Role";
import { UserResponse } from "./user.response";

export interface UserLocalStorageResponse {
    data: UserResponse,
    message: string,
    status: string,
    date_of_birth: string
}