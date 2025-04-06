import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import ProductService from '../../../../services/product';
import SupplierService from '../../../../services/SupplierService';
import CommodityService from '../../../../services/CommodityService';
import OptionService from '../../../../services/optionService';
import { toast } from 'react-toastify';
import useFetchWithAuth from '../../../../fetch/FetchAdmin';

// Định nghĩa kiểu dữ liệu cho Select Option
interface OptionType {
    value: number;
    label: string;
}

const InsertProduct: React.FC = () => {
    const fetchWithAuth = useFetchWithAuth();
    const [suppliers, setSuppliers] = useState<OptionType[]>([]);
    const [commodities, setCommodities] = useState<OptionType[]>([]);
    const [options, setOptions] = useState<OptionType[]>([]);
    const [productName, setProductName] = useState('');
    const [supplierId, setSupplierId] = useState<OptionType | null>(null);
    const [commodityId, setCommodityId] = useState<OptionType | null>(null);
    const [description, setDescription] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileUploadRef = useRef<any>(null); // Tạo ref để reset FileUpload

    const navigate = useNavigate();

    useEffect(() => {
        fetchSuppliers();
        fetchCommodities();
        fetchOptions();
    }, []);

    const fetchSuppliers = async () => {
        const result = await SupplierService.getSuppliers('');
        if (result.status === "OK") {
            setSuppliers(result.data.map((s: any) => ({ value: s.id, label: s.supplierName })));
        }
    };

    const fetchCommodities = async () => {
        const result = await CommodityService.getCommodities('');
        if (result.status === "OK") {
            setCommodities(result.data.map((c: any) => ({ value: c.id, label: c.commodityName })));
        }
    };

    const fetchOptions = async () => {
        const result = await OptionService.getOptions('');
        if (result.status === "OK") {
            setOptions(result.data.map((o: any) => ({ value: o.id, label: o.name })));
        }
    };

    const handleImageUpload = (e: any) => {
        const file = e.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));

            // Reset lại FileUpload để có thể chọn file khác
            if (fileUploadRef.current) {
                fileUploadRef.current.clear();
            }
        }
    };

    const handleInsertProduct = async () => {
        const insertProductDTO = {
            name: productName ?? "",
            supplierId: supplierId ? supplierId.value : 0,
            commodityId: commodityId ? commodityId.value : 0,
            description: description ?? "",
            optionId: selectedOptions.map(opt => opt.value),
        };

        try {
            await ProductService.insertProduct(fetchWithAuth, insertProductDTO)
                .then(result => {
                    if (result.status != "OK") {
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        const productId = result.data.id;
                        if (image) {
                            ProductService.uploadImages(productId, image);
                        }
                        toast.success(result.message);
                        setTimeout(() => navigate(0), 3000);
                    }
                }).catch(error => {
                    toast.error("Insert product failed");
                    console.error("Error changing password:", error);
                })
        } catch (error) {
            toast.error("Insert product failed");
            console.error("Insert product failed", error);
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Create Product</h1>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="table-responsive">
                        <form className="row g-3">
                            <div className="col-md-6">
                                <label>Product Name</label>
                                <InputText value={productName} onChange={(e) => setProductName(e.target.value)} className="form-control" />
                            </div>

                            <div className="col-md-6">
                                <label>Choose Supplier</label>
                                <Select
                                    value={supplierId}
                                    options={suppliers}
                                    onChange={(e) => setSupplierId(e)}
                                    placeholder="Select Supplier"
                                />
                            </div>

                            <div className="col-md-6">
                                <label>Choose Commodity</label>
                                <Select
                                    value={commodityId}
                                    options={commodities}
                                    onChange={(e) => setCommodityId(e)}
                                    placeholder="Select Commodity"
                                />
                            </div>

                            <div className="col-md-6">
                                <label>Choose Options</label>
                                <Select
                                    isMulti
                                    value={selectedOptions}
                                    options={options}
                                    onChange={(e) => setSelectedOptions(e as OptionType[])}
                                    placeholder="Select Options"
                                />
                            </div>

                            <div className="col-12">
                                <label>Description</label>
                                <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" />
                            </div>

                            <div className="col-md-12">
                                <label>Image</label>
                                <FileUpload
                                    ref={fileUploadRef}
                                    mode="basic"
                                    auto
                                    chooseLabel="Choose Image"
                                    accept="image/*"
                                    customUpload
                                    uploadHandler={handleImageUpload}
                                />
                            </div>

                            {/* Hiển thị ảnh đã chọn */}
                            {imagePreview && (
                                <div className="col-md-12 mt-3">
                                    <img src={imagePreview} alt="Selected" className="img-fluid" style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }} />
                                </div>
                            )}

                            <div className="col-12">
                                <Button label="Submit" className="btn btn-primary" type="button" onClick={handleInsertProduct} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Toast />
        </div>
    );
};

export default InsertProduct;
