import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchWithAuth from '../../../fetch/FetchUser';
import { toast } from 'react-toastify';
import { environment } from '../../../environment/environment';
import Header from '../Header/HeaderClient';
import styles from './home.module.css';
import { CommodityDataResponse } from '../../../responses/commodity/Commodity.data.response';
import axios from 'axios';

interface Variant {
    price: number;
    totalDiscountPercentage: number;
}

interface Product {
    id: number;
    productName: string;
    commodityName: string;
    imageUrl: string;
    variant: Variant | null;
}

const HomeClient: React.FC = () => {
    const [commodities, setCommodities] = useState<CommodityDataResponse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [maxPriceProduct, setMaxPriceProduct] = useState(0);
    const [step, setStep] = useState(10);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);
    const [filters, setFilters] = useState({
        name: '',
        commodityName: '',
        isActive: true,
        maxPrice: 0,
        rating: 1
    });

    const fetchWithAuthClient = useFetchWithAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [currentPage, filters]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${environment.apiBaseUrl}/client/product`, {
                params: {
                    ...filters,
                    page: currentPage,
                    limit: 10
                }
            });
    
            const result = response.data;
    
            if (result.status !== "OK") {
                toast.error(result.message);
                return;
            }
    
            const filteredProducts = result.data.products
                .map((product: Product) => ({
                    ...product,
                    imageUrl: `${environment.apiBaseUrl}/products/images/${product.imageUrl}`
                }))
                .filter((p: Product) => p.variant);
    
            setProducts(filteredProducts);
            setTotalPages(result.data.totalPages);
            setVisiblePages(generateVisiblePageArray(currentPage, result.data.totalPages));
    
            const maxPrice = Math.round(Math.max(...filteredProducts.map((p: Product) => p.variant!.price)));
            setMaxPriceProduct(maxPrice);
            setStep(maxPrice / 10);
    
            if (filters.maxPrice === 0 && maxPrice > 0) {
                setFilters(prev => ({ ...prev, maxPrice }));
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCommodities();
    }, []);

    const fetchCommodities = async () => {
        try {
            const response = await axios.get(`${environment.apiBaseUrl}/client/commodity`);
            const { data, status } = response;

            if (status != 200) {
                toast.error(data.message || "Lỗi không xác định khi lấy danh sách sản phẩm");
                if (Array.isArray(data)) {
                    data.forEach((msg: string) => toast.error(msg));
                }
                return;
            }
            setCommodities(data.data);
        } catch (error: any) {
            toast.error("Không thể tải danh sách sản phẩm");
            console.error("Error fetching commodity:", error);
        }
    };


    const generateVisiblePageArray = (current: number, total: number): number[] => {
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(current - half, 1);
        let end = Math.min(start + maxVisible - 1, total);

        if (end - start + 1 < maxVisible) {
            start = Math.max(end - maxVisible + 1, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const redirectToDetail = (id: number) => {
        navigate(`/haiha/product/${id}`);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        debugger
        const target = e.target;
        const { id, type, value } = target;
    
        let newValue: string | number | boolean = value;
    
        if (type === 'checkbox') {
            newValue = (target as HTMLInputElement).checked;
        } else if (type === 'range') {
            newValue = +value;
        } else if(type == 'text') {
            newValue = value;
        }

        setFilters(prev => ({
            ...prev,
            [id]: newValue
        }));
    
        setCurrentPage(0);
    };

    return (
        <>
            <Header />
            <div className="container py-5">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-3">
                        <div className={styles.sidebar}>
                            <h4>Filter Products</h4>

                            <div className={styles.filterSection}>
                                <h5>Product name</h5>
                                <input
                                    className="form-control me-2"
                                    type="text"
                                    placeholder="Tên sản phẩm"
                                    aria-label="Search"
                                    id='name'
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className={styles.filterSection}>
                                <h5>Price</h5>
                                <input type="range" 
                                className="form-range" id="maxPrice" min={0} max={maxPriceProduct} step={step}
                                    value={filters.maxPrice} onChange={handleFilterChange} />
                                <label>Lên đến ₫{filters.maxPrice}</label>
                            </div>

                            <div className={styles.filterSection}>
                                <h5>Category</h5>
                                <select className="form-control" id="commodityName" value={filters.commodityName} onChange={handleFilterChange}>
                                    <option value="">Tất cả sản phẩm</option>
                                    {commodities.map(commotity => (
                                        <option key={commotity.id} value={commotity.commodityName}>{commotity.commodityName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterSection}>
                                <h5>Rating</h5>
                                <input type="range" className="form-range" id="rating" min={1} max={5} step={1}
                                    value={filters.rating} onChange={handleFilterChange} />
                                <label>{filters.rating} Stars</label>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="col-md-9 col-lg-9">
                        <div className="row">
                            {products.map(product => (
                                <div className="col-md-12 col-lg-4 mb-4" key={product.id}>
                                    <div className={styles.cardProduct}>
                                        <img src={product.imageUrl} className={styles.cardImgTop} alt="" onClick={() => redirectToDetail(product.id)} />
                                        <div className={styles.cardBody}>
                                            <div className="d-flex justify-content-between">
                                                <p className="small text-muted">{product.commodityName}</p>
                                                {product.variant!.totalDiscountPercentage > 0 && (
                                                    <p className="small text-danger">
                                                        <s>{product.variant!.price.toLocaleString('vi-VN')}₫</s>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <h5 className="mb-0">{product.productName}</h5>
                                                <h5 className="text-dark mb-0">
                                                    {(product.variant!.price * (1 - product.variant!.totalDiscountPercentage / 100)).toLocaleString('vi-VN')}₫
                                                </h5>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                {product.variant!.totalDiscountPercentage > 0 && (
                                                    <p className="text-muted mb-0">
                                                        Discount: <span className="fw-bold" style={{ color: 'red' }}>{product.variant!.totalDiscountPercentage}%</span>
                                                    </p>
                                                )}
                                                <div className="ms-auto text-warning">
                                                    {[...Array(5)].map((_, idx) => <i className="fa fa-star" key={idx}></i>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                    <ul className="pagination">
                        {currentPage > 0 && (
                            <>
                                <li className="page-item"><button className="page-link" onClick={() => handlePageChange(0)}>First</button></li>
                                <li className="page-item"><button className="page-link" onClick={() => handlePageChange(currentPage - 1)}><i className="fa fa-chevron-left"></i></button></li>
                            </>
                        )}
                        {visiblePages.map((page) => (
                            <li className={`page-item ${page === currentPage + 1 ? 'active' : ''}`} key={page}>
                                <button className="page-link" onClick={() => handlePageChange(page - 1)}>{page}</button>
                            </li>
                        ))}
                        {currentPage < totalPages - 1 && (
                            <>
                                <li className="page-item"><button className="page-link" onClick={() => handlePageChange(currentPage + 1)}><i className="fa fa-chevron-right"></i></button></li>
                                <li className="page-item"><button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>Last</button></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </>
    );
};


export default HomeClient;
