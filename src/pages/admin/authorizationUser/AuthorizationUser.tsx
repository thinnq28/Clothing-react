import React, { useEffect, useState } from "react";
import userService from "../../../services/userService";
import { getRoles } from "../../../services/RoleService";
import { toast } from "react-toastify";
import {addUserRole, deleteUserRole} from "../../../services/UserRoleService";
import "react-toastify/dist/ReactToastify.css";

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    fullname: string;
    phoneNumber: string;
    email: string;
    roles: Role[];
}

const AuthorizationUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [email, setEmail] = useState("");
    const [roleId, setRoleId] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, [currentPage, itemsPerPage]);

    const fetchRoles = async () => {
        try {
            const response = await getRoles();
            setRoles(response.data);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const fetchUsers = async () => {
        try {
            await userService.getAllUsers({ name, phoneNumber, email, roleId, isActive: true, page: currentPage, limit: itemsPerPage })
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
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSearch = () => {
        setCurrentPage(0);
        fetchRoles();
        fetchUsers();
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const generateVisiblePages = (current: number, total: number): number[] => {
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(current - half, 1);
        let end = Math.min(start + maxVisible - 1, total);

        if (end - start + 1 < maxVisible) {
            start = Math.max(end - maxVisible + 1, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const hasRole = (user: User, roleId: number) => {
        return user.roles.some(role => role.id === roleId);
    };

    const toggleUserRole = async (user: User, roleId: number) => {
        const alreadyHas = hasRole(user, roleId);
        try {
            if (alreadyHas) {
                await deleteUserRole(user.id, roleId);
                toast.success("Role removed");
            } else {
                await addUserRole(user.id, roleId);
                toast.success("Role added");
            }
            fetchUsers(); // Refresh user roles
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Permission Table</h2>

            <div className="row mb-3">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-4">
                    <select
                        className="form-control"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 25, 50, 100].map(n => (
                            <option key={n} value={n}>{n} entries</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-control"
                        value={roleId}
                        onChange={(e) => setRoleId(Number(e.target.value))}
                    >
                        <option value={0}>Tất cả</option>
                        <option value={1}>ADMIN</option>
                        <option value={2}>USER</option>
                        <option value={3}>GUEST</option>
                    </select>
                </div>
                <div className="col-md-4 d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={handleSearch}>
                        <i className="fas fa-search" /> Search
                    </button>
                </div>
            </div>

            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>Full name</th>
                        {roles.map(role => (
                            <th key={role.id}>{role.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.fullname}</td>
                            {roles.map(role => (
                                <td key={role.id} className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={hasRole(user, role.id)}
                                        onChange={() => toggleUserRole(user, role.id)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-center">
                <ul className="pagination">
                    {currentPage > 0 && (
                        <>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(0)}>First</button>
                            </li>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    <i className="fa fa-chevron-left" />
                                </button>
                            </li>
                        </>
                    )}
                    {visiblePages.map(page => (
                        <li
                            key={page}
                            className={`page-item ${page - 1 === currentPage ? "active" : ""}`}
                        >
                            <button className="page-link" onClick={() => handlePageChange(page - 1)}>{page}</button>
                        </li>
                    ))}
                    {currentPage < totalPages - 1 && (
                        <>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    <i className="fa fa-chevron-right" />
                                </button>
                            </li>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>Last</button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AuthorizationUser;
