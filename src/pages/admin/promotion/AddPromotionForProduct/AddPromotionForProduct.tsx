import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import PromotionService from '../../../../services/PromotionService';
import { toast } from 'react-toastify';
import VariantService from '../../../../services/VariantService';

interface Variant {
    id: number;
    skuId: string;
    variantName: string;
    quantity: number;
    price: number;
    active: boolean;
    promotionIds: number[];
}

interface Promotion {
    id: number;
    name: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
}

const AddPromotionVariant: React.FC = () => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const [name, setName] = useState('');
    const [productName, setProductName] = useState('');
    const [minQuantity, setMinQuantity] = useState<number>();
    const [maxQuantity, setMaxQuantity] = useState<number>();
    const [minPrice, setMinPrice] = useState<number | undefined>();
    const [maxPrice, setMaxPrice] = useState<number | undefined>();
    const [isActive, setIsActive] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const promotionId = Number(id);

    useEffect(() => {
        fetchVariants();
    }, [name, productName, minQuantity, maxQuantity, minPrice, maxPrice, isActive, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchPromotion();
    }, [])

    const fetchPromotion = async () => {
        try {
            
            PromotionService.getPromotionById(promotionId)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setPromotion(result.data);
                    }
                }).catch(error => {
                    toast.error(error);
                    console.log(error);
                })
        } catch (err: any) {
            console.log("Feiled fetching Promotion");
        }
    };

    const fetchVariants = async () => {
        try {
            VariantService.getVariants(name,
                productName,
                promotionId,
                minQuantity ?? 0,
                maxQuantity ?? 0,
                minPrice ?? 0,
                maxPrice ?? 0,
                isActive,
                currentPage,
                itemsPerPage)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setVariants(result.data.variants);
                        setTotalPages(result.data.totalPages);
                        setVisiblePages(generateVisiblePages(currentPage, result.data.totalPages));
                    }
                }).catch(error => {
                    console.log(error);
                    toast.error('Failed to fetch variants');
                })
        } catch (err: any) {
            console.log('Failed to fetch variants');
        }
    };

    const generateVisiblePages = (current: number, total: number): number[] => {
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(current + 1 - half, 1);
        let end = Math.min(start + maxVisible - 1, total);
        if (end - start < maxVisible) start = Math.max(end - maxVisible + 1, 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const handleCheckboxToggle = async (variantId: number, checked: boolean) => {
        try {
            if (checked) {
                PromotionService.addForVariant({ variantId, promotionId })
                    .then(result => {
                        if (result.status != "OK") {
                            toast.error(result.message);
                        } else {
                            toast.success(result.message);
                            window.location.reload();
                        }
                    }).catch(error => {
                        toast.error('Error updating promotion');
                        console.log(error);
                    })
            } else {
                PromotionService.deletePromotionVariant(variantId, promotionId)
                    .then(result => {
                        if (result.status != "OK") {
                            toast.error(result.message);
                        } else {
                            toast.success(result.message);
                            window.location.reload();
                        }
                    }).catch(error => {
                        toast.error('Error updating promotion');
                        console.log(error);
                    })
            }
            fetchVariants();
        } catch (err: any) {
            toast.error('Error updating promotion');
            console.log(err);
        }
    };

    const handleCheckAll = async (checked: boolean) => {
        for (const variant of variants) {
            if (variant.active) {
                await handleCheckboxToggle(variant.id, checked);
            }
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Add promotion for variant</h1>

            <div className="card shadow mb-4 p-3">
                <div className="row mb-2">
                    <div className="col-md-3">
                        <input className="form-control" placeholder="Variant name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <input className="form-control" placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-control" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-center">
                        <label className="custom-control custom-checkbox" >
                            <input type="checkbox" className="custom-control-input" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            <span className="custom-control-label"> Active</span>
                        </label>
                    </div>
                </div>

                {/* Price & Quantity Filters */}
                <div className="row mb-2">
                    <div className="col-md-3"><input className="form-control" type="number" placeholder="Min Price" onChange={(e) => setMinPrice(Number(e.target.value))} /></div>
                    <div className="col-md-3"><input className="form-control" type="number" placeholder="Max Price" onChange={(e) => setMaxPrice(Number(e.target.value))} /></div>
                    <div className="col-md-3"><input className="form-control" type="number" placeholder="Min Quantity" onChange={(e) => setMinQuantity(Number(e.target.value))} /></div>
                    <div className="col-md-3"><input className="form-control" type="number" placeholder="Max Quantity" onChange={(e) => setMaxQuantity(Number(e.target.value))} /></div>
                </div>

                {/* Table */}
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>SKU ID</th>
                            <th>Variant name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>
                                {isActive && (<input
                                    type="checkbox"
                                    onChange={(e) => handleCheckAll(e.target.checked)}
                                    checked={variants.length > 0 && variants.every(v => v.active && v.promotionIds?.includes(promotionId))}
                                />)}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((variant, index) => (
                            <tr key={variant.id}>
                                <td>{variant.id}</td>
                                <td>{variant.skuId}</td>
                                <td>{variant.variantName}</td>
                                <td>{variant.quantity}</td>
                                <td>{variant.price}</td>
                                <td>
                                    {isActive && (
                                        <input
                                            type="checkbox"
                                            checked={variant.promotionIds?.includes(promotionId)}
                                            onChange={(e) => handleCheckboxToggle(variant.id, e.target.checked)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <nav>
                    <ul className="pagination">
                        {currentPage > 0 && (
                            <>
                                <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(0)}>First</a></li>
                                <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</a></li>
                            </>
                        )}
                        {visiblePages.map((page) => (
                            <li key={page} className={`page-item ${page === currentPage + 1 ? 'active' : ''}`}>
                                <a className="page-link" onClick={() => setCurrentPage(page - 1)}>{page}</a>
                            </li>
                        ))}
                        {currentPage < totalPages - 1 && (
                            <>
                                <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</a></li>
                                <li className="page-item"><a className="page-link" onClick={() => setCurrentPage(totalPages - 1)}>Last</a></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AddPromotionVariant;
