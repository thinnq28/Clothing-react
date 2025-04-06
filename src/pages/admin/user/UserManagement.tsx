import React, { useEffect, useState } from 'react';
import { UserDataResponse } from '../../../responses/user/user.data.response';
import { RegisterDTO } from '../../../dtos/user/register.dto'
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import userService from '../../../services/userService';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserDataResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);

    const [filters, setFilters] = useState({
        name: '',
        phoneNumber: "",
        email: '',
        roleId: 0,
        isActive: true
    });

    const [userDelete, setUserDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState<RegisterDTO>({
        fullname: '',
        phone_number: '',
        email: '',
        address: '',
        password: '',
        retype_password: '',
        date_of_birth: '',
        role_id: 2
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage, filters]);

    const fetchUsers = async () => {
        try {
            await userService.getAllUsers({
                ...filters,
                page: currentPage,
                limit: itemsPerPage
            })
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setUsers(result.data.users);
                        setTotalPages(result.data.totalPages);
                        setVisiblePages(generateVisiblePages(currentPage, result.data.totalPages));
                    }
                }).catch(error => {
                    toast.error(error.message);
                    console.log(error);
                })


        } catch (err: any) {
            console.log(err.message);
        }
    };

    const generateVisiblePages = (current: number, total: number) => {
        const maxVisible = 5;
        let start = Math.max(current - 2, 1);
        let end = Math.min(start + maxVisible - 1, total);
        if (end - start < maxVisible) start = Math.max(end - maxVisible + 1, 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const handleDeleteUser = async () => {
        if (userDelete == null) return;
        try {
            await userService.deleteUser(userDelete)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        toast.success(result.message);
                        setShowDeleteModal(false);
                        fetchUsers();
                    }
                })
                .catch(error => {
                    console.log(error);
                    toast.error(error);
                })

        } catch (err: any) {
            console.log(err);
        }
    };

    const handleRegister = async () => {
        try {
            await userService.register(formData)
                .then(result => {
                    console.log(result);
                    if (result.status != 200) {
                        toast.error(result.data.message);
                    } else {
                        toast.success(result.data.message);
                        setShowCreateModal(false);
                        fetchUsers();
                    }
                }).catch(error => {
                    console.log(error);
                    if (Array.isArray(error.response.data.data)) {
                        error.response.data.data.forEach((msg: string) => toast.error(msg));
                    }
                })
        } catch (err: any) {
            console.log(err);
        }
    };

    return (
        <div className="container mt-4">
            <h3>Manage User</h3>
            <div className="mb-3 d-flex gap-2">
                <input className="form-control" placeholder="Phone number" onChange={e => setFilters({ ...filters, phoneNumber: e.target.value })} />
                <input className="form-control" placeholder="Full name" onChange={e => setFilters({ ...filters, name: e.target.value })} />
                <input className="form-control" placeholder="Email" onChange={e => setFilters({ ...filters, email: e.target.value })} />
                <button className="btn btn-outline-primary" onClick={() => setShowCreateModal(true)} >
                    <FaPlus />
                </button>
            </div>

            {/* Filter row */}
            <div className="d-flex justify-content-between mb-3">
                <select className="form-select w-25" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} entries</option>)}
                </select>

                <select className="form-select w-25" value={filters.roleId} onChange={(e) => setFilters({ ...filters, roleId: Number(e.target.value) })}>
                    <option value={0}>Tất cả</option>
                    <option value={1}>ADMIN</option>
                    <option value={2}>USER</option>
                    <option value={3}>GUEST</option>
                </select>

                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={filters.isActive} onChange={() => setFilters({ ...filters, isActive: !filters.isActive })} />
                    <label className="form-check-label">Active</label>
                </div>
            </div>

            {/* User Table */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Full name</th>
                        <th>Phone number</th>
                        <th>Email</th>
                        <th>Date of birth</th>
                        <th>Address</th>
                        <th>Active</th>
                        <th>Role</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.fullname}</td>
                            <td>{u.phone_number}</td>
                            <td>{u.email}</td>
                            <td>{new Date(u.date_of_birth).toLocaleDateString()}</td>
                            <td>{u.address}</td>
                            <td>{u.is_active ? 'Yes' : 'No'}</td>
                            <td>{u.roles[0]?.name}</td>
                            <td>
                                {u.is_active && (
                                    <button className="btn btn-outline-danger" onClick={() => { setUserDelete(u.id); setShowDeleteModal(true); }} >
                                        <FaTrash />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-center">
                <ul className="pagination">
                    {currentPage > 0 && (
                        <>
                            <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(0)}>First</a></li>
                            <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&lt;</a></li>
                        </>
                    )}
                    {visiblePages.map(page => (
                        <li className={`page-item ${page === currentPage + 1 ? 'active' : ''}`} key={page}>
                            <a className="page-link" onClick={() => setCurrentPage(page - 1)}>{page}</a>
                        </li>
                    ))}
                    {currentPage < totalPages - 1 && (
                        <>
                            <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&gt;</a></li>
                            <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(totalPages - 1)}>Last</a></li>
                        </>
                    )}
                </ul>
            </div>

            {/* Modals */}
            {showDeleteModal && (
                <div className="modal">

                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                    </div>
                    <div className="modal-body">
                        <h5>Are you sure you want to delete this user?</h5>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        <Button label="Close" onClick={() => setShowDeleteModal(false)} />
                        <Button label="Delete" className="p-button-danger" onClick={handleDeleteUser} />
                    </div>
                </div>
            )}

            {showCreateModal && (

                <div className="modal">
                    <div className="modal-header d-flex justify-content-center">
                        <Modal.Title>Create User</Modal.Title>
                    </div>

                    <Modal.Body>
                        <input className="form-control mb-2" placeholder="Full name" value={formData.fullname} onChange={(e) => setFormData({ ...formData, fullname: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Phone number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        <input type="date" className="form-control mb-2" value={formData.date_of_birth.toString()} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                        <input type="password" className="form-control mb-2" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        <input type="password" className="form-control mb-2" placeholder="Retype password" value={formData.retype_password} onChange={(e) => setFormData({ ...formData, retype_password: e.target.value })} />
                    </Modal.Body>
                    <hr />
                    <div className="d-flex justify-content-center gap-3">
                        <Button label="Save" onClick={handleRegister} />
                        <Button type="button" label="Cancle" onClick={() => setShowCreateModal(false)} />
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default UserManagement;
