import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProductDataResponse } from "../../../../responses/product/product.data.response";
import { OptionDataResponse } from '../../../../responses/option/option.data.response';
import { VariantDataResponse } from '../../../../responses/variant/variant.data.response';
import { ImageDataResponse } from '../../../../responses/image/image.data.response';
import VariantService from '../../../../services/VariantService';
import { environment } from '../../../../environment/environment';
import { UpdateVariantDTO } from '../../../../dtos/variant/update.variant.dto';

export const UpdateVariant: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDataResponse>();
    const [options, setOptions] = useState<OptionDataResponse[]>([]);
    const [variant, setVariant] = useState<VariantDataResponse>();
    const [imageResponses, setImageResponses] = useState<ImageDataResponse[]>([]);

    const [productId, setProductId] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [images, setImages] = useState<File[]>([]);

    const baseUrl = `${environment.apiBaseUrl}/variants/images/`;

    useEffect(() => {
        if (id) {
            VariantService.getVariantById(Number(id)).then(response => {
                const data = response.data;
                setVariant(data);
                setProduct(data.product);
                setOptions(data.product.options);
                setProductId(data.product.id);
                setQuantity(data.quantity);
                setPrice(data.price);
                setImageResponses(data.images);
            }).catch(error => {
                toast.error(error.message);
            });
        }
    }, [id]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (!files || files.length === 0) {
            toast.error('You must choose image(s)');
            return;
        } else if(files.length + imageResponses.length > 5) {
            toast.error('Please select a maximum of 5 images because new image and old image, which has larger 5 files');
            return;
        } 
        else if (files.length > 5) {
            toast.error('Please select a maximum of 5 images');
            return;
        }

        const fileArray = Array.from(files);
        setImages(fileArray);
    };

    const handleUpdate = () => {
        const selectedValues: string[] = Array.from(
            document.querySelectorAll<HTMLInputElement>('input.property:checked')
        ).map(input => input.value);

        const updateDTO: UpdateVariantDTO = {
            productId,
            quantity,
            price,
            properties: selectedValues,
            imageIds: imageResponses.map(img => img.id)
        };

        VariantService.update(Number(id), updateDTO).then(response => {
            const variantId = response.data.id;
            if (images.length > 0) {
                VariantService.uploadImages(variantId, images).then(() => {
                    toast.success('Update successful');
                    setTimeout(() => {
                        navigate(0); // refresh page
                    }, 3000);
                }).catch(error => {
                    toast.error(error.message);
                });
            } else {
                toast.success('Update successful');
            }
        }).catch(error => {
            toast.error(error.message);
        });
    };

    const removeImage = (index: number) => {
        const updated = [...imageResponses];
        updated.splice(index, 1);
        setImageResponses(updated);
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Update Variant</h1>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <form className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Product Name: </label>
                            <p>{product?.productName}</p>
                            <label className="form-label">Variant Name: </label>
                            <p>{variant?.variantName}</p>
                        </div>

                        <div className="col-md-6">
                            {options.map((option, i) => (
                                <div key={i}>
                                    <label>{option.name}</label>
                                    {option.optionValues.map((value, j) => (
                                        <div className="form-check form-switch" key={j}>
                                            <input
                                                type="radio"
                                                className="form-check-input property"
                                                id={`flexSwitchCheckChecked${i}${j}`}
                                                name={`option-value${i}`}
                                                defaultChecked={variant?.optionValueIds.includes(value.id)}
                                                value={value.id}
                                            />
                                            <label htmlFor={`flexSwitchCheckChecked${i}${j}`} className="form-check-label">
                                                {value.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="inputQuantity" className="form-label">Quantity</label>
                            <input type="text" className="form-control" id="inputQuantity"
                                value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="inputPrice" className="form-label">Price</label>
                            <input type="text" className="form-control" id="inputPrice"
                                value={price} onChange={e => setPrice(Number(e.target.value))} />
                        </div>

                        <div className="col-md-12">
                            <label htmlFor="images" className="form-label">Images:</label>
                            <div className="d-flex flex-wrap">
                                {imageResponses.map((img, i) => (
                                    <div className="img-wrap position-relative m-2" key={i}>
                                        <span className="position-absolute top-0 end-0 btn btn-danger btn-sm"
                                            onClick={() => removeImage(i)}>&times;</span>
                                        <img src={baseUrl + img.url} alt="Thumbnail" width="200" className="rounded-square" />
                                    </div>
                                ))}
                            </div>


                            <label htmlFor="images" className="form-label">New Images:</label>
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
                                    onChange={handleFileChange}
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
{/* 
                            {newImagePreview.length > 0 && (
                                <div>
                                    <p>New Image Added:</p>
                                    {newImagePreview.map((src, i) => (
                                        <img src={src} key={i} className="rounded-square me-2" width="100" height="100" />
                                    ))}
                                </div>
                            )} */}
                            {/* <input type="file" multiple accept="image/*"
                                className="form-control mt-2"
                                onChange={handleFileChange} /> */}
                        </div>

                        <div className="col-12">
                            <button type="button" className="btn btn-primary" onClick={handleUpdate}>Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
