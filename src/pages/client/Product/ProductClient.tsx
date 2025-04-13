import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToCart } from '../../../services/CartService';
import CommentService from '../../../services/CommentService';
import { ProductDataResponse } from '../../../responses/product/product.data.response';
import { VariantDataResponse } from '../../../responses/variant/variant.data.response';
import { ImageDataResponse } from '../../../responses/image/image.data.response';
import { CommentRateDTO } from '../../../dtos/comment-rate/comment-rate.dto';
import HeaderClient from '../../client/Header/HeaderClient';
import { toast } from 'react-toastify';
import { environment } from '../../../environment/environment';
import axios from 'axios';
import './ProductClient.css'
import Footer from '../Footer/FooterClient';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDataResponse | null>(null);
    const [variants, setVariants] = useState<VariantDataResponse[]>([]);
    const [variant, setVariant] = useState<VariantDataResponse | null>(null);
    const [images, setImages] = useState<ImageDataResponse[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<CommentRateDTO[]>([]);

    useEffect(() => {
        const productId = Number(id);
        if (!isNaN(productId)) {
            fetchProduct(productId);
            fetchVariants(productId);
        }
    }, [id]);


    const fetchProduct = async (productId: number) => {
        try {
            await axios.get(`${environment.apiBaseUrl}/client/product/details/${productId}`)
                .then(result => {
                    if (result.status != 200) {
                        toast.error(result.data.message);
                    } else {
                        setProduct(result.data.data);
                    }
                })

        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        }
    };

    const fetchVariants = async (productId: number) => {
        try {
            await axios.get(`${environment.apiBaseUrl}/client/variant/by-product/${productId}`)
                .then(result => {
                    if (result.status != 200) {
                        toast.error(result.data.message);
                    } else {
                        const updatedVariants = result.data.data.map((v: VariantDataResponse) => ({
                            ...v,
                            images: v.images.map(img => ({
                                ...img,
                                url: `${environment.apiBaseUrl}/variants/images/${img.url}`,
                            })),
                        }));
                        setVariants(updatedVariants);
                        setVariant(updatedVariants[0]);
                        setImages(updatedVariants[0]?.images || []);
                    }
                })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi tải biến thể');
        }
    };

    const showImage = (index: number) => {
        if (images.length > 0) {
            const newIndex = Math.max(0, Math.min(index, images.length - 1));
            setCurrentImageIndex(newIndex);
        }
    };

    const handleVariantChange = (variantId: number) => {
        const selected = variants.find(v => v.id === variantId);
        if (selected) {
            setVariant(selected);
            setImages(selected.images);
            setCurrentImageIndex(0);
        }
    };

    const handleAddToCart = () => {
        if (variant) {
            addToCart(variant.id, quantity);
            toast.success('Thêm vào giỏ hàng thành công');
        } else {
            toast.error('Vui lòng chọn biến thể sản phẩm');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const commentDTO: CommentRateDTO = {
            rating,
            content: newComment,
            product_id: Number(id),
        };

        try {
            await CommentService.insert(commentDTO);
            toast.success('Gửi bình luận thành công');
            setNewComment('');
            setRating(0);
            // TODO: reload comments
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi gửi bình luận');
        }
    };

    return (
        <>
            <HeaderClient />
            <div className="container">
                <h1 className="fw-semibold mb-4">Đây là trang chi tiết sản phẩm</h1>
                <h5>Tên sản phẩm: <p className="text-primary m-0 fw-bold">{product?.productName}</p></h5>

                <div className="row mt-4">
                    {/* Carousel */}
                    <div className="col-md-6">
                        <div className="carousel slide">
                            <div className="carousel-inner">
                                {images.map((img, i) => (
                                    <div key={i} className={`carousel-item ${i === currentImageIndex ? 'active' : ''}`}>
                                        <img src={img.url} alt="Product" className="d-block w-100" />
                                    </div>
                                ))}
                            </div>
                            <button className="carousel-control-prev" onClick={() => showImage(currentImageIndex - 1)}>
                                <span className="carousel-control-prev-icon" />
                            </button>
                            <button className="carousel-control-next" onClick={() => showImage(currentImageIndex + 1)}>
                                <span className="carousel-control-next-icon" />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        <div className="d-flex mt-3">
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img.url}
                                    alt="Thumb"
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`me-2 ${i === currentImageIndex ? 'border border-primary' : ''}`}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                    </div>


                    {/* Details */}
                    <div className="col-md-6">
                        <div style={{
                            maxHeight: '838px',
                            overflowY: 'auto',
                            border: '1px solid #dee2e6',
                            borderRadius: '0.25rem',
                            padding: '0.5rem',
                            marginBottom: '1rem',

                        }} className="mb-4">
                            {variants.map(v => (
                                <div key={v.id} className="mb-2">
                                    <div
                                        className={`variant-selector p-2 border rounded d-flex align-items-center ${variant?.id === v.id ? 'border-primary bg-light' : ''}`}
                                        style={{ cursor: v.quantity > 0 ? 'pointer' : 'not-allowed', opacity: v.quantity > 0 ? 1 : 0.5 }}
                                        onClick={() => v.quantity > 0 && handleVariantChange(v.id)}
                                    >
                                        <img
                                            src={v.images[0]?.url}
                                            alt="Variant"
                                            style={{ width: 60, height: 60, marginRight: 12 }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">{v.variantName}</h6>
                                            <p className="mb-1">Giá: {v.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                            <p className="mb-1">Số lượng: {v.quantity}</p>
                                            {v.options.map((opt, i) => (
                                                <p key={i} className="mb-0 small text-muted">
                                                    {opt.name}: {opt.optionValues.map(val => val.name).join(', ')}
                                                </p>
                                            ))}
                                        </div>
                                        {variant?.id === v.id && (
                                            <i className="fa fa-check-circle text-primary fs-4 ms-2" aria-hidden="true"></i>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quantity + Add to cart */}
                        <div className="d-flex align-items-center mt-3">
                            <button
                                className="btn btn-outline-info"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <input
                                type="text"
                                value={quantity}
                                readOnly
                                className="mx-2 text-center"
                                style={{ width: 50 }}
                            />
                            <button className="btn btn-outline-info" onClick={() => setQuantity(quantity + 1)}>
                                +
                            </button>
                            <button className="btn btn-primary ms-3" onClick={handleAddToCart}>
                                Thêm vào giỏ hàng
                            </button>
                        </div>

                    </div>
                </div>

                {/* Comment Section */}
                <div className="mt-5">
                    <h4>Để lại bình luận của bạn</h4>
                    <form onSubmit={handleCommentSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Chọn mức đánh giá</label>
                            <select className="form-select" value={rating} onChange={e => setRating(+e.target.value)} required>
                                {[1, 2, 3, 4, 5].map(val => <option key={val} value={val}>{val} sao</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Bình luận của bạn</label>
                            <textarea className="form-control" rows={4} value={newComment} onChange={e => setNewComment(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Gửi bình luận</button>
                    </form>
                </div>

                {/* Comment Display */}
                <hr />
                <h4>Các bình luận khác</h4>
                {/* {comments.map((c, i) => (
                    <div key={i} className="d-flex mb-3">
                        <img src="https://via.placeholder.com/50" className="rounded-circle me-3" alt="Avatar" />
                        <div>
                            <strong>{c.userName}</strong>
                            <p>{c.content}</p>
                            <small>Ngày gửi: {c.createdDate}</small>
                        </div>
                    </div>
                ))} */}
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;
