import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import "./ProductComponent.scss"; // Nếu có file CS
import { environment } from "../../../environment/environment";
import useFetchWithAuth from "../../../fetch/FetchAdmin";
import { FaCreativeCommons, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import "./ProductComonent.css"

interface Product {
    id: number;
    productName: string;
    supplierName: string;
    commodityName: string;
    imageUrl: string;
    active: boolean;
}

const ProductComponent: React.FC = () => {

    const fetchWithAuth = useFetchWithAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);
    const [name, setName] = useState<string>("");
    const [supplierName, setSupplierName] = useState<string>("");
    const [commodityName, setCommodityName] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        getAllProducts();
    }, [currentPage, itemsPerPage, name, supplierName, commodityName, isActive]);

    const getAllProducts = async () => {
        try {
            await fetchWithAuth(`/products`, {
                method: "GET",
                params: { name, supplierName, commodityName, isActive, page: currentPage, limit: itemsPerPage }
            }).then(result => {
                if (result.status != "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    const fetchedProducts = result.data.products.map((product: Product) => ({
                        ...product,
                        imageUrl: `${environment.apiBaseUrl}/products/images/${product.imageUrl}`
                    }));
                    setProducts(fetchedProducts);
                    setTotalPages(result.data.totalPages);
                    setVisiblePages(generateVisiblePageArray(currentPage, result.data.totalPages));
                }
            }).catch(error => {
                console.error("Error getting product:", error);
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error fetching products");
        }
    };

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

    const handleDelete = async () => {
        if (!productIdToDelete) return;

        try {
            await fetchWithAuth(`/products/${productIdToDelete}`, {
                method: "DELETE"
            })
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        toast.success(result.message);
                        getAllProducts();
                        // closeModal();
                    }
                }).catch(error => {
                    console.error("Error delete product:", error);
                })

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error deleting product");
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Manage Product</h1>

            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="table-responsive">
                        <div className="input-group-append">
                            {/* <button className="btn btn-primary btn-circle" onClick={getAllProducts}>
                                <i className="fas fa-search fa-sm"></i>
                            </button> */}
                            <button className="btn btn-primary btn-circle" onClick={() => navigate("/admin/products/create")}>
                                <FaPlus />
                            </button>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-product" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-product" placeholder="Supplier name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-product" placeholder="Commodity name" value={commodityName} onChange={(e) => setCommodityName(e.target.value)} />
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-6">
                                <select className="form-control form-control-product" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                    {[10, 25, 50, 100].map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
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
                        </div>

                        <table className="table mt-3">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product Name</th>
                                    <th>Supplier Name</th>
                                    <th>Commodity Name</th>
                                    <th>Active</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td><img src={product.imageUrl} alt="Thumbnail" width="100" height="100" /></td>
                                        <td>{product.productName}</td>
                                        <td>{product.supplierName}</td>
                                        <td>{product.commodityName}</td>
                                        <td>{product.active ? "Yes" : "No"}</td>
                                        {product.active && (
                                            <>
                                                <td>
                                                    <button className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" onClick={() => {
                                                        setProductIdToDelete(product.id);
                                                        setIsDeleteModalOpen(true);
                                                    }}>
                                                        <FaTrash />
                                                    </button>
                                                    <button className="btn btn-outline-primary" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                                                        <FaEdit />
                                                    </button>
                                                </td>
                                            </>
                                        )}
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
                    </div>
                </div>
            </div>

            {/* Bootstrap Modal */}
            {isDeleteModalOpen && (
                <div className="modal">
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title w-100 text-center" id="deleteModalLabel">Confirm Deletion</h5>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete this product?
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={handleDelete} data-bs-dismiss="modal">Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductComponent;
