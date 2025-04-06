import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./OptionValue.css"; // Import CSS
import useFetchWithAuth from "../../../fetch/FetchAdmin";
import { FaCheck, FaEdit, FaTrash } from "react-icons/fa";
import { Pagination } from "react-bootstrap";

const OptionValueComponent: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
    const navigate = useNavigate();

    const [optionValues, setOptionValues] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [updatedName, setUpdatedName] = useState("");

    const [isUpdate, setIsUpdate] = useState(false);
    const [index, setIndex] = useState<number>();
    const [optionDelete, setOptionDelete] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const fetchWithAuth = useFetchWithAuth();

    useEffect(() => {
        getOptionById(Number(id));
    }, [id]);

    const getOptionById = async (optionId: number) => {
        await fetchWithAuth(`/options/details/${optionId}`)
            .then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    setOptionValues(result.data.optionValues);
                }
            }).catch(error => {
                toast.error(error);
                console.error("Error fetching options:", error);
            });
    };

    useEffect(() => {
        getAllOptionValues();
    }, [id, name, isActive, currentPage, itemsPerPage])

    const getAllOptionValues = async () => {
        await fetchWithAuth(`/option-values?option_id=${id}&name=${name}&active=${isActive}&page=${currentPage}&limit=${itemsPerPage}`)
            .then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    setOptionValues(result.data.optionValues);
                    setTotalPages(result.data.totalPages);
                }
            }).catch(error => {
                toast.error(error);
                console.error("Error fetching options:", error);
            });
    };

    const updateOptionValue = async (optionValueId: number) => {
        const payload = {
            optionValueId,
            optionId: Number(id),
            optionValueName: updatedName
        };
        await fetchWithAuth(`/option-values/${payload.optionValueId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }).then(result => {
            if (result.status !== "OK") {
                toast.error(result.message);
                if (Array.isArray(result.data)) {
                    result.data.forEach((msg: string) => toast.error(msg));
                }
            } else {
                toast.success(result.message);
                getAllOptionValues();
                setIsUpdate(false);
            }
        }).catch(error => {
            toast.error(error);
            console.error("Error fetching options:", error);
        });
    };

    const deleteOptionValue = async () => {
        if (optionDelete === null) return;

        await fetchWithAuth(`/option-values/${optionDelete}`, { method: "DELETE" })
            .then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    toast.success("Deleted successfully!");
                    getAllOptionValues();
                    setShowModal(false);
                }
            }).catch(error => {
                toast.error(error);
                console.error("Error fetching options:", error);
            });
    };

    return (
        <div className="container-option-value">
            <h1 className="title">Manage Option Values</h1>

            {/* Search & Filter */}
            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-md-6">
                    <label>Search:
                        <input type="text" className="form-control form-control-sm" placeholder="Search option" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                </div>
                <div className="col-md-6">
                    <label className="custom-control custom-checkbox" style={{ margin: "25px" }}>
                        <input
                            type="checkbox"
                            className="custom-control-input"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span className="custom-control-label"> Active</span>
                    </label>
                </div>
            </div>

            {/* Table */}
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Option Value Name</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {optionValues.map((option, i) => (
                        <tr key={option.id}>
                            <td>{option.id}</td>
                            <td>
                                {isUpdate && index == i ? (
                                    <input type="text" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} />
                                ) : (
                                    option.name
                                )}
                            </td>
                            <td>{option.active ? "Yes" : "No"}</td>
                            <td>
                                {option.active && (
                                    <>
                                        <button className="btn btn-danger" onClick={() => { setOptionDelete(option.id); setShowModal(true); }}>
                                            <FaTrash />
                                        </button>

                                        {isUpdate && index == i ?
                                            <button className="btn btn-success" onClick={() => {
                                                updateOptionValue(option.id);
                                            }
                                            }>
                                                <FaCheck />
                                            </button>
                                            :
                                            <button className="btn btn-primary" onClick={() => { setUpdatedName(option.name); setIsUpdate(true); setIndex(i); }}>
                                                <FaEdit />
                                            </button>}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination>
                <Pagination.First onClick={() => setCurrentPage(0)} disabled={currentPage === 0} />
                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={currentPage === 0} />

                {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i + 1}
                    </Pagination.Item>
                ))}

                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={currentPage === totalPages - 1} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1} />
            </Pagination>

            {/* Delete Modal */}
            {showModal && (
                <div className="modal">

                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete this option?</p>
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-danger" onClick={deleteOptionValue}>Yes</button>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>No</button>
                    </div>
                </div>

            )}
        </div>
    );
};

export default OptionValueComponent;
