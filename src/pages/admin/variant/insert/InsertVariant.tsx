import React, { useEffect, useState } from 'react';
import { ProductDataResponse } from "../../../../responses/product/product.data.response";
import { OptionDataResponse } from '../../../../responses/option/option.data.response';
import { OptionVariantDTO } from '../../../../dtos/variant/insert.option.variant';
import { InsertVariantDTO } from '../../../../dtos/variant/insert.variant.dto';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import VariantService from '../../../../services/VariantService';
import ProductService from '../../../../services/product';
import Select from 'react-select';

const InsertVariant = () => {
    const [products, setProducts] = useState<ProductDataResponse[]>([]);
    const [productId, setProductId] = useState<number>(0);
    const [product, setProduct] = useState<ProductDataResponse | undefined>();
    const [options, setOptions] = useState<OptionDataResponse[]>([]);
    const [price, setPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [images, setImages] = useState<File[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});

    const navigate = useNavigate();

    useEffect(() => {
        getProducts('');
    }, []);

    const getProducts = async (name: string) => {
        try {
            ProductService.getProducts(name)
                .then(result => {
                    if (result.status !== "OK") {
                        toast.error(result.message);
                    } else {
                        setProducts(result.data);
                    }
                })
                .catch(error => {
                    console.log(error);
                    toast.error('Failed to load products');
                });
        } catch (error: any) {
            toast.error('Failed to load products');
        }
    };

    const selectProductById = async (id: number) => {
        setProductId(id);
        try {
            await ProductService.getProductById(id)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setProduct(result.data);
                        setOptions(result.data.options || []);
                        setSelectedOptions({});

                    }
                }).catch(error => {
                    toast.error(error);
                })

        } catch (error: any) {
            console.log(error)
        }
    };

    const handleOptionChange = (optionId: number, valueId: number, multiple: boolean) => {
        setSelectedOptions(prev => {
            const updated = { ...prev };
            if (multiple) {
                const existing = updated[optionId] || [];
                updated[optionId] = existing.includes(valueId)
                    ? existing.filter(v => v !== valueId)
                    : [...existing, valueId];
            } else {
                updated[optionId] = [valueId];
            }
            return updated;
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) {
            toast.error('You must choose Image')
            return;
        } else if (files.length > 5) {
            toast.error('Please select a maximum of 5 images');
            return;
        }

        setImages(Array.from(files));
    };

    const insert = async () => {
        const optionDtos: OptionVariantDTO[] = options.map(option => ({
            optionId: option.id,
            optionValueIds: selectedOptions[option.id] || []
        }));

        const payload: InsertVariantDTO = {
            productId,
            quantity,
            price,
            options: optionDtos
        };

        try {
            await VariantService.insert(payload)
                .then(result => {
                    if (result.status != "OK") {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        toast.success(result.message);
                        const variantIds = result.data;
                        if (images.length > 0) {
                            uploadImages(variantIds);
                        }
                    }
                }).catch(error => {
                    console.log(error);

                })

        } catch (err: any) {
            console.log(err);
        }
    };

    const uploadImages = async (variantIds: number[]) => {
        for (const id of variantIds) {
            try {
                await VariantService.uploadImages(id, images)
                    .then(result => {
                        if (result.status != "OK") {
                            toast.error(result.message);
                        } else {
                            toast.success(result.message);
                            setTimeout(() => {
                                navigate(0);
                            }, 3000);
                        }
                    }).catch(error => {
                        console.log(error);

                    })


            } catch (err: any) {
                console.log(err);
            }
        }
    };

    // React-Select options
    const productOptions = products.map(product => ({
        value: product.id,
        label: product.productName
    }));

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Create Variant</h1>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <form className="row g-3" onSubmit={(e) => { e.preventDefault(); insert(); }}>
                        <div className="col-md-6">
                            <label className="form-label">Choose product from the list</label>
                            <div className="mt-2">
                                <Select
                                    options={productOptions}
                                    placeholder="Choose the product"
                                    onChange={(selected) => {
                                        if (selected) {
                                            selectProductById(selected.value);
                                        }
                                    }}
                                    value={productOptions.find(p => p.value === productId) || null}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Price</label>
                            <input
                                type="text"
                                className="form-control"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </div>

                        {options.map(option => (
                            <div className="col-md-6" key={option.id}>
                                <label className="form-label">{option.name}</label>
                                {option.optionValues.map(value => (
                                    <div className="form-check form-switch" key={value.id}>
                                        <input
                                            className="form-check-input"
                                            type={option.isMultipleUsage ? 'checkbox' : 'radio'}
                                            name={`option-${option.id}`}
                                            value={value.id}
                                            checked={(selectedOptions[option.id] || []).includes(value.id)}
                                            onChange={() => handleOptionChange(option.id, value.id, option.isMultipleUsage)}
                                        />
                                        <label className="form-check-label ms-2">{value.name}</label>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <div className="col-md-12">
                            <label className="form-label">Image:</label>

                            <div className="d-flex align-items-center flex-wrap gap-2">
                                {/* Custom upload button */}
                                <label
                                    htmlFor="file-upload"
                                    className="d-flex justify-content-center align-items-center"
                                    style={{
                                        width: '100px',
                                        height: '120px',
                                        border: '2px dashed #ccc',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '40px',
                                        color: '#aaa',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.borderColor = '#888')}
                                    onMouseOut={e => (e.currentTarget.style.borderColor = '#ccc')}
                                >
                                    +
                                </label>

                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={onFileChange}
                                    style={{ display: 'none' }}
                                />

                                {/* Preview images */}
                                {images.map((file, idx) => (
                                    <img
                                        key={idx}
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                ))}
                            </div>
                        </div>


                        <div className="col-12">
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InsertVariant;
