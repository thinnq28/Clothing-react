import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import VariantService from '../../../services/VariantService';
import { FaChevronLeft, FaChevronRight, FaEdit, FaFileImport, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';

interface Variant {
    id: number;
    skuId: string;
    variantName: string;
    quantity: number;
    price: number;
    active: boolean;
}

const VariantManager: React.FC = () => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<Boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVariants();
    }, [name, isActive, currentPage, itemsPerPage]);

    const fetchVariants = () => {
        VariantService.getAllVariant(
            name,
            isActive,
            currentPage,
            itemsPerPage
        ).then(res => {
            if (res.status != "OK") {
                toast.error(res.message);
            } else {
                const { variants, totalPages } = res.data;
                setVariants(res.data.variants);
                setTotalPages(res.data.totalPages);
                setVisiblePages(generateVisiblePageArray(currentPage, totalPages));
            }
        }).catch(err => {
            toast.error(err.response?.data?.message || 'Error fetching variants');
        });
    };

    const generateVisiblePageArray = (currentPage: number, totalPages: number): number[] => {
        const maxVisiblePages = 5;
        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(currentPage - half, 0);
        let end = Math.min(start + maxVisiblePages, totalPages);

        if (end - start < maxVisiblePages) {
            start = Math.max(end - maxVisiblePages, 0);
        }

        return Array.from({ length: end - start }, (_, i) => start + i + 1);
    };

    const handleDelete = () => {
        if (selectedVariantId !== null) {
            VariantService.delete(selectedVariantId)
                .then(res => {
                    debugger
                    if (res.status != "OK") {
                        toast.error(res.message);
                    } else {
                        toast.success(res.message);
                        setTimeout(() => fetchVariants(), 2000);
                    }
                }).catch(err => {
                    toast.error(err.response?.data?.message || 'Delete failed');
                });
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Manage Variant</h1>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="input-group mb-3 gap-2">
                        <button className="btn btn-primary btn-circle" onClick={fetchVariants}>
                            <FaSearch />
                        </button>
                        <button className="btn btn-primary btn-circle" onClick={() => navigate('/admin/variants/create')}>
                            <FaPlus />
                        </button>
                        <button className="btn btn-primary btn-circle" onClick={() => navigate('/admin/variants/import')}>
                            <FaFileImport />
                        </button>
                    </div>

                    <div className="row mt-2">
                        <div className="col-md-4">
                            <label>Search:
                                <input
                                    type="search"
                                    className="form-control form-control-sm"
                                    placeholder="Variant name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="col-md-4">
                            <label>Show:
                                <select
                                    className="custom-select custom-select-sm form-control form-control-sm"
                                    value={itemsPerPage}
                                    onChange={e => setItemsPerPage(Number(e.target.value))}
                                >
                                    {[10, 25, 50, 100].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select> entries
                            </label>
                        </div>

                        <div className="col-md-4 d-flex align-items-center">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="activeSwitch"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                            />
                            <label className="form-check-label ms-2" htmlFor="activeSwitch">Active</label>
                        </div>
                    </div>

                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>SKU ID</th>
                                <th>Variant name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Active</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {variants.map(variant => (
                                <tr key={variant.id}>
                                    <td>{variant.id}</td>
                                    <td>{variant.skuId}</td>
                                    <td>{variant.variantName}</td>
                                    <td>{variant.quantity}</td>
                                    <td>{variant.price}</td>
                                    <td>{variant.active ? 'Yes' : 'No'}</td>
                                    {variant.active && (
                                        <>
                                            <td>
                                                <button className="btn" onClick={() => {
                                                     setSelectedVariantId(variant.id);
                                                     setIsOpenDeleteModal(true);
                                                }}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn button-option-edit" onClick={() => navigate(`/admin/variants/edit/${variant.id}`)}>
                                                    <FaEdit></FaEdit>
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-center">
                        <ul className="pagination">
                            {currentPage > 0 && (
                                <>
                                    <li className="page-item">
                                        <button className="page-link" onClick={() => setCurrentPage(0)}>First</button>
                                    </li>
                                    <li className="page-item">
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                            <FaChevronLeft />
                                        </button>
                                    </li>
                                </>
                            )}
                            {visiblePages.map(page => (
                                <li key={page} className={`page-item ${page === currentPage + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(page - 1)}>{page}</button>
                                </li>
                            ))}
                            {currentPage < totalPages - 1 && (
                                <>
                                    <li className="page-item">
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                            <FaChevronRight />
                                        </button>
                                    </li>
                                    <li className="page-item">
                                        <button className="page-link" onClick={() => setCurrentPage(totalPages - 1)}>Last</button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <ToastContainer />

            {/* Modal */}
            {isOpenDeleteModal && (
                <div className="modal" >
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                    </div>
                    <div className="modal-body">
                        <h5>Are you sure you want to delete this Variant?</h5>
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-secondary" onClick={() => {
                            setSelectedVariantId(null);
                            setIsOpenDeleteModal(false);
                        }}>Close</button>
                        <button className="btn btn-danger" onClick={() => {
                            handleDelete();
                            setSelectedVariantId(null);
                            setIsOpenDeleteModal(false);
                        }}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantManager;
