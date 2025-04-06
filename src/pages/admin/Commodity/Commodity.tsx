import React, { useEffect, useState } from "react";
import useFetchWithAuth from "../../../fetch/FetchAdmin";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { toast } from "react-toastify";
import { CommodityDataResponse } from "../../../responses/commodity/Commodity.data.response";
import "./Commodity.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlus } from "react-icons/fa";


const CommodityComponent = () => {
    const fetchWithAuth = useFetchWithAuth();
    const [commodities, setCommodities] = useState<CommodityDataResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [newCommodity, setNewCommodity] = useState({
        commodityName: ""
    });

    const [updateCommodity, setUpdateCommodity] = useState({
        id: 0,
        name: "",
        isActive: true
    });

    const [deleteCommodity, setDeleteCommodity] = useState<{ id: number; name: string }>({ id: 0, name: "" });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => {
        fetchCommodities();
    }, [currentPage, itemsPerPage, isActive, name]); // Gọi lại API khi thay đổi bộ lọc

    useEffect(() => {
        if (currentPage >= totalPages) {
            setCurrentPage(0); // Reset về trang đầu nếu currentPage vượt quá totalPages
        }
    }, [totalPages]);

    const fetchCommodities = async () => {
        try {
            await fetchWithAuth(`/commodities?name=${name}&isActive=${isActive}&page=${currentPage}&limit=${itemsPerPage}`, {
                method: "GET",
            }).then(result => {
                if (result.status != "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    setCommodities(result.data.commodities);
                    setTotalPages(result.data.totalPages);

                }
            }).catch(error => {
                toast.error(error);
                console.error("Error fetching commodity:", error);
            })
        } catch (error) {
            console.error("Error fetching commodity:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await fetchWithAuth(`/commodities/${deleteCommodity.id}`, {
                method: "DELETE"
            }).then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    fetchCommodities();
                    setShowDeleteModal(false);
                    toast.success(`Commodity "${deleteCommodity.name}" deleted successfully!`);
                }
            }).catch(error => {
                toast.error("Error deleting commodity");
                console.error("Error deleting commodity:", error);
            });

        } catch (error) {
            console.error("Error deleting commodity:", error);
        }
    };


    const handleCreate = async () => {
        try {
            await fetchWithAuth(`/commodities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCommodity)
            }).then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    fetchCommodities();
                    toast.success(result.message);
                    setShowCreateModal(false);
                }
            }).catch(error => {
                toast.error("Error creating commodity");
                console.error("Error creating commodity:", error);
            });

        } catch (error) {
            console.error("Error creating commodity:", error);
        }
    };


    const handleUpdate = async () => {
        try {
            await fetchWithAuth(`/commodities/${updateCommodity.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commodityName: updateCommodity.name,
                    isActive: updateCommodity.isActive
                })
            }).then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    fetchCommodities();
                    setShowUpdateModal(false);
                    toast.success(result.message);
                }
            }).catch(error => {
                toast.error("Error updating commodity");
                console.error("Error updating commodity:", error);
            });

        } catch (error) {
            console.error("Error updating commodity:", error);
        }
    };


    const handleShowUpdateModal = (commodity: CommodityDataResponse) => {
        setUpdateCommodity({
            id: commodity.id,
            name: commodity.commodityName,
            isActive: commodity.active
        });
        setShowUpdateModal(true);
    };

    const handleShowDeleteModal = (commodity: CommodityDataResponse) => {
        setDeleteCommodity({ id: commodity.id, name: commodity.commodityName });
        setShowDeleteModal(true);
    };

    return (
        <div className="container">
            <h1>Manage Commodity</h1>
            <div className="mb-3 d-flex justify-content-between">
                <Form.Control
                    type="text"
                    placeholder="Search by name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Button onClick={() => setShowCreateModal(true)}>
                    <FaPlus />
                </Button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Commodity Name</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {commodities.map((commodity, index) => (
                        <tr key={index}>
                            <td>{commodity.id}</td>
                            <td>{commodity.commodityName}</td>
                            <td>{commodity.active ? "Yes" : "No"}</td>
                            <td>
                                {commodity.active && (
                                    <>
                                        <Button variant="danger" onClick={() => {
                                            handleShowDeleteModal(commodity);
                                            setShowDeleteModal(true);
                                        }}>Delete</Button>
                                        <Button variant="warning" onClick={() => handleShowUpdateModal(commodity)}>Edit</Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* <Pagination>
                {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i + 1}
                    </Pagination.Item>
                ))}
            </Pagination> */}

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
                <div className="modal">
                    <div className="modal-header d-flex justify-content-center">
                        <Modal.Title>Add New Commodity</Modal.Title>
                    </div>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Commodity Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCommodity.commodityName}
                                    onChange={(e) => setNewCommodity({ ...newCommodity, commodityName: e.target.value })}
                                    placeholder="Enter commodity name"
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <hr />
                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreate}>Create</Button>
                    </div>
                </div>
            )}

            {showUpdateModal && (
                <div className="modal" >
                    <div className="modal-header d-flex justify-content-center">
                        <Modal.Title>Update Commodity</Modal.Title>
                    </div>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Commodity Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={updateCommodity.name}
                                    onChange={(e) => setUpdateCommodity({ ...updateCommodity, name: e.target.value })}
                                    placeholder="Enter commodity name"
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdate}>Update</Button>
                    </div>
                </div>
            )}

            {
                showDeleteModal && (
                    <div className="modal" >
                        <div className="modal-header d-flex justify-content-center">
                            <Modal.Title>Confirm Delete</Modal.Title>
                        </div>
                        <Modal.Body>
                            <p>Are you sure you want to delete <strong>{deleteCommodity.name}</strong>?</p>
                        </Modal.Body>
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default CommodityComponent;
