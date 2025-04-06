import { Role } from "./Role";

export interface UserDataResponse {
    id: number;
    fullname: string;
    address: string;
    email: string;
    is_active: boolean;
    date_of_birth: Date;
    phone_number: string;
    roles: Role[];
}
