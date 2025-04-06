import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { VoucherService } from '../../../services/VourcherService';
import { toast } from "react-toastify";
import { VoucherDTO } from "../../../dtos/voucher/voucher.dto";
import { FaPlus } from "react-icons/fa";

interface Voucher {
    id: number;
    code: string;
    discount: number;
    discountType: string;
    startDate: string;
    endDate: string;
    maxUsage?: number;
    timesUsed: number;
    active: boolean;
    description?: string;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
}

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [searchCode, setSearchCode] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [newVoucher, setNewVoucher] = useState<VoucherDTO>({
        code: "", discount: 0, discountType: "percentage", startDate: "", endDate: "",
        maxUsage: "", description: "", minPurchaseAmount: 0, maxDiscountAmount: 0
    });

    useEffect(() => {
        fetchVouchers();
    }, [currentPage, itemsPerPage, searchCode, startDateFilter, endDateFilter, isActive]);

    const fetchVouchers = async () => {
        try {
            VoucherService.getAllVouchers(searchCode, startDateFilter, endDateFilter, isActive, currentPage, itemsPerPage)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setVouchers(result.data.vouchers);
                        setTotalPages(result.data.totalPages);
                    }
                }).catch(error => {
                    toast.error(error.message);
                    console.error("Error fetching vouchers:", error);
                })
        } catch (error) {
            console.error("Error fetching vouchers:", error);
        }
    };

    const handleCreateVoucher = async () => {
        try {
            await VoucherService.insert(newVoucher)
                .then(result => {
                    if (result.status !== "OK") {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        toast.success(result.message);
                        fetchVouchers();
                        setShowCreateModal(false);
                    }
                }).catch(error => {
                    toast.error(error.message);
                    console.error("Error creating vouchers:", error);
                })
        } catch (error) {
            toast.error("Error creating voucher");
            console.error("Error creating voucher:", error);
        }
    };

    const handleUpdateVoucher = async () => {
        try {
            if (!selectedVoucher) return;
            const id = selectedVoucher.id;
            await VoucherService.update(id, newVoucher)
                .then(result => {
                    if (result.status !== "OK") {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        toast.success(result.message);
                        setShowUpdateModal(false);
                        fetchVouchers();
                    }
                }).catch(error => {
                    toast.error(error.message);
                    console.error("Error updating vouchers:", error);
                })
        } catch (error) {
            toast.error("Error creating voucher");
            console.error("Error creating voucher:", error);
        }
    };

    const handleDeleteVoucher = async () => {
        if (!selectedVoucher) return;
        const voucherId = selectedVoucher.id;
        VoucherService.delete(voucherId)
            .then(result => {
                if (result.status != "OK") {
                    toast.error(result.message);
                } else {
                    setShowDeleteModal(false);
                    fetchVouchers();
                    toast.success(result.message);
                }
            }).catch(error => {
                console.log("Error deleting voucher: " + error)
            })
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Manage Vouchers</h1>
            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-md-4">
                    <label>Name:
                        <Form.Control className="form-control form-control-sm" type="text" placeholder="Voucher code" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
                    </label>
                </div>
                <div className="col-md-4">
                    <label>Start date:
                        <Form.Control type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
                    </label>
                </div>
                <div className="col-md-4">
                    <label>End date:
                        <Form.Control type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
                    </label>
                </div>
            </div>

            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-md-4">
                    <label>Show:
                        <select
                            className="form-control form-control-sm"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                </div>

                <div className="col-md-4">
                    <label className="custom-control custom-checkbox">
                        <input
                            type="checkbox"
                            className="custom-control-input"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span className="custom-control-label"> Active</span>
                    </label>
                </div>

                <div className="col-md-4" >
                    <label className="custom-control custom-checkbox">
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <FaPlus />
                        </button>
                    </label>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.map((voucher) => (
                        <tr key={voucher.id}>
                            <td>{voucher.id}</td>
                            <td>{voucher.code}</td>
                            <td>{voucher.discount}</td>
                            <td>{voucher.discountType}</td>
                            <td>{voucher.startDate}</td>
                            <td>{voucher.endDate}</td>
                            <td>{voucher.maxUsage || "Unbounded"}</td>
                            <td>
                                <Button variant="warning" onClick={() => {
                                    setSelectedVoucher(voucher); setShowUpdateModal(true);
                                }}>Edit</Button>
                                <Button variant="danger" onClick={() => { setSelectedVoucher(voucher); setShowDeleteModal(true); }}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
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

            {showCreateModal && (
                <div className="modal" style={{ width: "600px" }}>
                    <div className="modal-header d-flex justify-content-center">
                        <Modal.Title>Create Voucher</Modal.Title>
                    </div>
                    <div className="modal-body">
                        <Form>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Voucher Code</Form.Label>
                                        <Form.Control type="text" value={newVoucher.code} onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Discount</Form.Label>
                                        <Form.Control type="text" value={newVoucher.discount} onChange={(e) => setNewVoucher({ ...newVoucher, discount: Number(e.target.value) })} />
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Group>
                                <Form.Label>Discount Type: &nbsp;</Form.Label>
                                <Form.Select value={newVoucher.discountType} onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value })}>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed</option>
                                </Form.Select>
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control type="date"
                                            value={newVoucher.startDate}
                                            onChange={(e) => setNewVoucher({ ...newVoucher, startDate: e.target.value })} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control type="date" value={newVoucher.endDate ? new Date(newVoucher.endDate).toISOString().split('T')[0] : ""} onChange={(e) => setNewVoucher({ ...newVoucher, endDate: e.target.value })} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Min Purchase Amount</Form.Label>
                                        <Form.Control type="text" value={newVoucher.minPurchaseAmount} onChange={(e) => setNewVoucher({ ...newVoucher, minPurchaseAmount: Number(e.target.value) })} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Max Discount Amount</Form.Label>
                                        <Form.Control type="text" value={newVoucher.maxDiscountAmount} onChange={(e) => setNewVoucher({ ...newVoucher, maxDiscountAmount: Number(e.target.value) })} />
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Group>
                                <Form.Label>Max Usage</Form.Label>
                                <Form.Control type="text" value={newVoucher.maxUsage} onChange={(e) => setNewVoucher({ ...newVoucher, maxUsage: e.target.value })} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" value={newVoucher.description} onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })} />
                            </Form.Group>
                        </Form>
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => handleCreateVoucher()}>Save</Button>
                    </div>
                </div>
            )
            }

            {showUpdateModal && (
                <div className="modal" style={{ width: "600px" }}>
                    <div className="modal-header d-flex justify-content-center">
                        <Modal.Title>Update Voucher</Modal.Title>
                    </div>
                    <div className="modal-body">
                        <Form>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Voucher Code</Form.Label>
                                        <Form.Control type="text" value={newVoucher.code} onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Discount</Form.Label>
                                        <Form.Control type="number" value={newVoucher.discount} onChange={(e) => setNewVoucher({ ...newVoucher, discount: Number(e.target.value) })} />
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Group>
                                <Form.Label>Discount Type</Form.Label>
                                <Form.Select value={newVoucher.discountType} onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value })}>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed</option>
                                </Form.Select>
                            </Form.Group>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control type="date" value={newVoucher.startDate} onChange={(e) => setNewVoucher({ ...newVoucher, startDate: e.target.value })} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control type="date" value={newVoucher.endDate} onChange={(e) => setNewVoucher({ ...newVoucher, endDate: e.target.value })} />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Min Purchase Amount</Form.Label>
                                        <Form.Control type="text" value={newVoucher.minPurchaseAmount} onChange={(e) => setNewVoucher({ ...newVoucher, minPurchaseAmount: Number(e.target.value) })} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Max Discount Amount</Form.Label>
                                        <Form.Control type="text" value={newVoucher.maxDiscountAmount ? newVoucher.maxDiscountAmount : "" } onChange={(e) => setNewVoucher({ ...newVoucher, maxDiscountAmount: Number(e.target.value) })} />
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Group>
                                <Form.Label>Max Usage</Form.Label>
                                <Form.Control type="text" value={newVoucher.maxUsage ? newVoucher.maxUsage : ""} onChange={(e) => setNewVoucher({ ...newVoucher, maxUsage: e.target.value })} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" value={newVoucher.description ? newVoucher.description : ""} onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })} />
                            </Form.Group>
                        </Form>
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleUpdateVoucher}>Update</Button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <>
                    <div className="modal">
                        <div className="modal-header d-flex justify-content-center">
                            <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                        </div>
                        <div className="modal-body">
                            <h5>Are you sure you want to delete this voucher?</h5>
                        </div>
                        <hr></hr>
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDeleteVoucher}>Delete</Button>
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};

export default VoucherManagement;