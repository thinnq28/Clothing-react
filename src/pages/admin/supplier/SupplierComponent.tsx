import React, { useEffect, useState } from "react";
import SupplierService from "../../../services/SupplierService";
import "./SupplierComponent.css"; // Import CSS riêng
import { toast, ToastContainer } from "react-toastify";
import "./SupplierComponent.css"
import { FaEdit, FaTrash } from "react-icons/fa";

interface Supplier {
    id: number;
    supplierName: string;
    phoneNumber: string;
    email: string;
    address: string;
    active: boolean;
}

const SupplierComponent: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);
    const [searchParams, setSearchParams] = useState({ name: "", phoneNumber: "", email: "", isActive: true });

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Supplier Data for Create/Update/Delete
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [newSupplier, setNewSupplier] = useState({ supplierName: "", phoneNumber: "", email: "", address: "" });

    useEffect(() => {
        fetchSuppliers();
    }, [currentPage, itemsPerPage, searchParams]);


    const generateVisiblePageArray = (currentPage: number, totalPages: number): number[] => {
        const maxVisiblePages = 5;
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(currentPage - halfVisiblePages, 1);
        let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(endPage - maxVisiblePages + 1, 1);
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    };

    const fetchSuppliers = async () => {
        try {
            await SupplierService.getAllSuppliers(
                searchParams.name,
                searchParams.phoneNumber,
                searchParams.email,
                searchParams.isActive,
                currentPage,
                itemsPerPage
            ).then(result => {
                if (result.status == "OK") {
                    setSuppliers(result.data.suppliers);
                    setTotalPages(result.data.totalPages);
                    setVisiblePages(generateVisiblePageArray(currentPage, result.data.totalPages));
                } else {
                    toast.error(result.message);
                }
            }).catch(error => {
                console.error("Error fetching suppliers", error);
                toast.error("Failed to fetch suppliers");
            })

        } catch (error) {
            console.error("Error fetching suppliers", error);
            toast.error("Failed to fetch suppliers");
        }
    };

    // Handle Create Supplier
    const handleCreateSupplier = async () => {
        try {
            await SupplierService.register(newSupplier)
                .then(result => {
                    if (result.status === "OK") {
                        toast.success(result.message);
                        setTimeout(() => {
                            fetchSuppliers();
                            setIsCreateModalOpen(false);
                            setNewSupplier({ supplierName: "", phoneNumber: "", email: "", address: "" });
                        }, 3000);

                    } else {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    }
                }).catch(error => {
                    toast.error("Error creating supplier");
                })

        } catch (error) {
            toast.error("Error creating supplier");
        }
    };

    // Handle Update Supplier
    const handleUpdateSupplier = async () => {
        if (!selectedSupplier) return;
        try {
            await SupplierService.update(selectedSupplier, selectedSupplier.id)
                .then(result => {
                    if (result.status == "OK") {
                        toast.success(result.message);
                        setTimeout(() => {
                            fetchSuppliers();
                            setIsUpdateModalOpen(false);
                            setSelectedSupplier(null);
                        }, 3000);
                    } else {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    }
                }).catch(error => {
                    toast.error("Error updating supplier");
                })

        } catch (error) {
            toast.error("Error updating supplier");
        }
    };

    // Handle Delete Supplier
    const handleDeleteSupplier = async () => {
        if (!selectedSupplier) return;
        try {
            await SupplierService.delete(selectedSupplier.id)
                .then(result => {
                    if (result.status == "OK") {
                        toast.success(result.message);
                        setTimeout(() => {
                            fetchSuppliers();
                            setIsDeleteModalOpen(false);
                            setSelectedSupplier(null);
                        }, 3000);
                    } else {
                        toast.error(result.message);
                    }
                }).catch(error => {
                    toast.error("Error deleting supplier");
                    console.log(error)
                })

        } catch (error) {
            toast.error("Error deleting supplier");
        }
    };

    return (
        <div className="supplier-container">
            <h1 className="supplier-h1">Manage Suppliers</h1>

            {/* Search Filters */}
            <div className="supplier-filters">
                <input type="text" placeholder="Phone Number" value={searchParams.phoneNumber} onChange={(e) => setSearchParams({ ...searchParams, phoneNumber: e.target.value })} />
                <input type="text" placeholder="Full Name" value={searchParams.name} onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} />
                <input type="text" placeholder="Email" value={searchParams.email} onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })} />

                <select className="form-control form-control-product" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    {[10, 25, 50, 100].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>

                <button className="btn btn-primary" onClick={() => { setIsCreateModalOpen(true); }}>
                    +
                </button>

            </div>

            {/* Supplier Table */}
            <table className="supplier-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Supplier Name</th>
                        <th>Phone Number</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                            <td>{supplier.id}</td>
                            <td>{supplier.supplierName}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.address}</td>
                            <td>{supplier.active ? "Yes" : "No"}</td>
                            <td>
                                <button className="btn btn-outline-primary" onClick={() => { setSelectedSupplier(supplier); setIsUpdateModalOpen(true); }}>
                                    <FaEdit />
                                </button>
                                <button className="btn btn-outline-danger" onClick={() => { setSelectedSupplier(supplier); setIsDeleteModalOpen(true); }}>
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <nav>
                <ul className="pagination">
                    {visiblePages.map((page) => (
                        <li key={page} className={`page-item ${page - 1 === currentPage ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setCurrentPage(page - 1)}>{page}</button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Create Supplier Modal */}
            {isCreateModalOpen && (
                <>
                    <div className="modal">
                        <h2>Create Supplier</h2>
                        <input type="text" placeholder="Supplier Name" value={newSupplier.supplierName} onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })} />
                        <input type="text" placeholder="Address" value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} />
                        <input type="text" placeholder="Email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                        <input type="text" placeholder="Phone Number" value={newSupplier.phoneNumber} onChange={(e) => setNewSupplier({ ...newSupplier, phoneNumber: e.target.value })} />
                        <br />
                        <hr />
                        <div className="d-flex justify-content-center gap-3">
                            <button className="col-md-6" onClick={handleCreateSupplier}>Save</button>
                            <button className="col-md-6" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                    <ToastContainer /></>
            )}

            {/* Update Supplier Modal */}
            {isUpdateModalOpen && selectedSupplier && (
                <>
                    <div className="modal">
                        <h2>Update Supplier</h2>
                        <input type="text" value={selectedSupplier.supplierName} onChange={(e) => setSelectedSupplier({ ...selectedSupplier, supplierName: e.target.value })} />
                        <input type="text" placeholder="Address" value={selectedSupplier.address} onChange={(e) => setSelectedSupplier({ ...selectedSupplier, address: e.target.value })} />
                        <input type="text" placeholder="Email" value={selectedSupplier.email} onChange={(e) => setSelectedSupplier({ ...selectedSupplier, email: e.target.value })} />
                        <input type="text" placeholder="Phone Number" value={selectedSupplier.phoneNumber} onChange={(e) => setSelectedSupplier({ ...selectedSupplier, phoneNumber: e.target.value })} />
                        <div className="d-flex justify-content-center gap-3">
                            <button onClick={handleUpdateSupplier}>Update</button>
                            <button onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                    <ToastContainer />
                </>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <>
                    <div className="modal">
                        <div className="modal-header d-flex justify-content-center">
                            <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                        </div>
                        <div className="modal-body">
                            <h5>Are you sure you want to delete this supplier?</h5>
                        </div>
                        <div className="d-flex justify-content-center gap-3">
                            <button onClick={handleDeleteSupplier}>Delete</button>
                            <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                    <ToastContainer />
                </>
            )
            }
        </div >
    );
};

export default SupplierComponent;
