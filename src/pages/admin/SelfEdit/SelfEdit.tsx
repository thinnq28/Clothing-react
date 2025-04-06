import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useFetchWithAuth from '../../../fetch/FetchAdmin';
import userService from '../../../services/userService';
import { UpdateUserDTO } from '../../../dtos/user/update.user.dto';
import './SelfEdit.css';


interface UserDataResponse {
    id: number;
    fullname: string;
    address: string;
    date_of_birth: string;
    email: string;
    phone_number: string;
}

export const SelfEdit: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<UpdateUserDTO>();
    const [userId, setUserId] = useState<number>();

    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }

        userService.getUserDetail()
            .then((res) => {
                const data: UserDataResponse = res.data;
                setUserId(data.id);
                setValue('fullname', data.fullname || '');
                setValue('email', data.email || '');
                setValue('address', data.address || '');
                const rawDate = data.date_of_birth;
                const formattedDate = new Date(rawDate).toISOString().split('T')[0]; // "YYYY-MM-DD"
                setValue('date_of_birth', formattedDate);
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || 'Error fetching user');
            });
    }, [navigate, setValue, token]);

    const onSubmit = (data: UpdateUserDTO) => {
        if (!userId) {
            navigate('/admin/login');
            return;
        }

        userService.updateUserDetail(userId, data)
            .then((res) => {
                debugger
                if (res.status != "OK") {
                    if (Array.isArray(res.data)) {
                        res.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    toast.success(res.data.message);
                    setTimeout(() => {
                        navigate('/admin');
                        window.location.reload();
                    }, 3000);
                }
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || 'Failed updating user');
            });
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>User Profile</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="profile-details">
                    <div className="profile-item">
                        <label htmlFor="fullname">Full Name:</label>
                        <input
                            id="fullname"
                            type="text"
                            {...register('fullname')}
                        />
                    </div>

                    <div className="profile-item">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                        />
                    </div>

                    <div className="profile-item">
                        <label htmlFor="address">Address:</label>
                        <input id="address" type="text" {...register('address')} />
                    </div>

                    <div className="profile-item">
                        <label htmlFor="date_of_birth">Date of Birth:</label>
                        <input
                            id="date_of_birth"
                            type="date"
                            {...register('date_of_birth')}
                        />
                    </div>

                    <div className="button-container">
                        <button type="submit" className="submit-button">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    );
};
