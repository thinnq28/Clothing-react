export interface RegisterDTO {
    fullname: string;
    phone_number: string;
    address: string;
    password: string;
    retype_password: string;
    email: string;
    date_of_birth: String;
    role_id?: number;
}
