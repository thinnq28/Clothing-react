import React, { useEffect, useState } from "react";
import PromotionService from "../../../services/PromotionService";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PromotionComponent.css";
import { Link } from "react-router-dom";


type Promotion = {
    id: number;
    name: string;
    discountPercentage: number;
    startDate: Date;
    endDate: Date;
    active: boolean;
};

const PromotionComponent: React.FC = () => {

    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);
    const [startDateFilter, setStartDateFilter] = useState<string>("");
    const [endDateFilter, setEndDateFilter] = useState<string>("");

    const [promotionName, setPromotionName] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [promotionId, setPromotionId] = useState<number | null>(null);

    const [isCreate, setIsCreate] = useState(true);
    const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
    const [deletedId, setDeletedId] = useState<number>();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchPromotions();
    }, [currentPage, isActive, itemsPerPage, name, startDateFilter, endDateFilter]);

    const fetchPromotions = async () => {
        try {
            PromotionService.getAllPromotions(name, isActive, currentPage, itemsPerPage)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setPromotions(result.data.promotions.map((p: any) => ({
                            ...p,
                            startDate: new Date(p.startDate),
                            endDate: new Date(p.endDate)
                        })));
                        setTotalPages(result.data.totalPages);
                        setVisiblePages(generateVisiblePages(currentPage, result.data.totalPages));
                    }
                }).catch(error => {
                    console.log(error.message);
                    console.log("Error fetching promotions");
                })

        } catch (error) {
            console.log("Error fetching promotions");
        }
    };

    const generateVisiblePages = (current: number, total: number): number[] => {
        const maxPages = 5;
        const halfPages = Math.floor(maxPages / 2);
        let start = Math.max(current - halfPages, 1);
        let end = Math.min(start + maxPages - 1, total);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };


    const savePromotion = async () => {
        try {
            const discountPercentageValue = Number(discountPercentage);
            PromotionService.insert({ name: promotionName, discountPercentage: discountPercentageValue, startDate, endDate })
                .then(result => {
                    if (result.status != "OK") {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        toast.success(result.message);
                        fetchPromotions();
                        setPromotionName("");
                        setDiscountPercentage("");
                        setStartDate(new Date());
                        setEndDate(new Date());
                        setIsOpenCreateModal(false);
                    }
                }).catch(error => {
                    console.log(error.message);
                    console.log("Error saving promotions");
                })
        } catch (error) {
            console.log("Error saving promotion");
            console.log(error);
        }
    };

    const openUpdateModal = (promotion: Promotion) => {
        setIsCreate(false);
        setPromotionName(promotion.name);
        setDiscountPercentage(promotion.discountPercentage.toString());
        setStartDate(promotion.startDate);
        setEndDate(promotion.endDate);
        setPromotionId(promotion.id);
        setIsOpenCreateModal(true);
    };

    const updatePromotion = async () => {
        try {
            if (promotionId) {
                const discountPercentageValue = Number(discountPercentage);
                PromotionService.update(promotionId, { name: promotionName, discountPercentage: discountPercentageValue, startDate, endDate })
                    .then(result => {
                        if (result.status != "OK") {
                            if (Array.isArray(result.data)) {
                                result.data.forEach((msg: string) => toast.error(msg));
                            }
                        } else {
                            toast.success(result.message);
                            fetchPromotions();
                            setIsOpenCreateModal(false);
                        }
                    }).catch(error => {
                        console.log(error.message);
                        console.log("Error updating promotions");
                    })

            }
        } catch (error) {
            console.log("Error updating promotions");
            console.log(error);
        }
    };

    const deletePromotion = async () => {
        try {
            PromotionService.delete(deletedId ? deletedId : 0)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        toast.success(result.message);
                        fetchPromotions();
                        setDeletedId(0);
                        setIsDeleteModalOpen(false);
                    }
                }).catch(error => {
                    toast.error(error.message);
                    console.log("Error updating promotions");
                })
        } catch (error) {
            console.log("Error deleting promotion");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Create Promotion for Variant</h1>

            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-md-4">
                    <label>Show:
                        <select
                            className="form-control form-control-sm"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                </div>
                <div className="col-md-4">
                    <label>Search:
                        <input
                            type="search"
                            className="form-control form-control-sm"
                            placeholder="Promotion name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>
                </div>
                <div className="col-md-4">
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
            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-md-4">
                    <label>Start date:
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={startDateFilter ? new Date(startDateFilter).toISOString().split('T')[0] : ""}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                        />
                    </label>
                </div>
                <div className="col-md-4">
                    <label>End date:
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={endDateFilter ? new Date(endDateFilter).toISOString().split('T')[0] : ""}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                        />
                    </label>
                </div>

                <div className="col-md-4" >
                    <label className="custom-control custom-checkbox" style={{ marginRight: "20px", marginTop: "15px" }}>
                        <button className="btn btn-primary" onClick={() => { setIsOpenCreateModal(true); setIsCreate(true); }}>
                            <FaPlus />
                        </button>
                    </label>
                </div>
            </div>
            <table className="table mt-3">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Promotion Name</th>
                        <th>Discount %</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Active</th>
                        <th>Actions</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map((promotion, index) => (
                        <tr key={index}>
                            <td>{promotion.id}</td>
                            <td>{promotion.name}</td>
                            <td>{promotion.discountPercentage}%</td>
                            <td>{promotion.startDate.toLocaleDateString()}</td>
                            <td>{promotion.endDate.toLocaleDateString()}</td>
                            <td>{promotion.active ? "Active" : "In-active"}</td>
                            <td>
                               {isActive ? <>
                                <button className="btn btn-warning" onClick={() => openUpdateModal(promotion)}>Edit</button>
                                <button className="btn btn-danger ms-2" onClick={() => { setDeletedId(promotion.id); setIsDeleteModalOpen(true) }}>Delete</button>
                               </> : "" }
                            </td>
                            <td>
                                <Link to={`/admin/promotions/add-for-variant/${promotion.id}`} >
                                <FaPlus/>
                                </Link>
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

            {/* Modal create Promotion */}
            {isOpenCreateModal && (<>
                <div className="modal">
                    <h2>Create Promotion</h2>
                    <div className="container-create-promotion">
                        <form className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="inputPromotionName" className="form-label">Promotion Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="inputPromotionName"
                                    value={promotionName}
                                    onChange={(e) => setPromotionName(e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="discountPercent" className="form-label">Discount Percentage</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="discountPercent"
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="startDate" className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="startDate"
                                    value={startDate.toISOString().split("T")[0]} // ✅ Chuyển thành chuỗi "YYYY-MM-DD"
                                    onChange={(e) => setStartDate(new Date(e.target.value))} // ✅ Chuyển ngược lại thành Date khi thay đổi
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="endDate" className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="endDate"
                                    value={endDate.toISOString().split("T")[0]}
                                    onChange={(e) => setEndDate(new Date(e.target.value))}
                                />
                            </div>
                        </form>

                        <div className="d-flex justify-content-center gap-3">
                            {isCreate ? <button className="col-md-6" onClick={savePromotion}>Save</button> :
                                <button className="col-md-6" onClick={updatePromotion}>Update</button>}
                            <button className="col-md-6" onClick={() => setIsOpenCreateModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </>)
            }

            {isDeleteModalOpen && (
                <>
                    <div className="modal">
                        <div className="modal-header d-flex justify-content-center">
                            <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                        </div>
                        <div className="modal-body">
                            <h5>Are you sure you want to delete this promotion?</h5>
                        </div>
                        <hr></hr>
                        <div className="d-flex justify-content-center gap-3">
                            <button onClick={deletePromotion}>Delete</button>
                            <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}

        </div >
    );
};

export default PromotionComponent;
