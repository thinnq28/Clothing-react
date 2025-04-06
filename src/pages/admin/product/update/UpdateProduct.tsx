import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetchWithAuth from "../../../../fetch/FetchAdmin";
import { toast } from "react-toastify";
import ProductService from "../../../../services/product";
import SupplierService from "../../../../services/SupplierService";
import CommodityService from "../../../../services/CommodityService";
import OptionService from "../../../../services/optionService";
import Select from "react-select";
import { environment } from "../../../../environment/environment";
import "./UpdateProduct.css"

// Định nghĩa kiểu dữ liệu cho Select Option
interface OptionType {
    value: number;
    label: string;
}

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [supplier, setSupplier] = useState<OptionType | null>(null);
    const [commodity, setCommodity] = useState<OptionType | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);
    const [image, setImage] = useState<File | null>(null);

    const [suppliers, setSuppliers] = useState<OptionType[]>([]);
    const [commodities, setCommodities] = useState<OptionType[]>([]);
    const [options, setOptions] = useState<OptionType[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);



    const fetchWithAuth = useFetchWithAuth();

    useEffect(() => {
        fetchProduct();
        fetchSuppliers();
        fetchCommodities();
        fetchOptions();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const result = await fetchWithAuth(`/products/details/${id}`);
            if (result.status === "OK") {
                const data = result.data;
                setProductName(data.productName);
                setDescription(data.description);
                setSupplier({ value: data.supplierId, label: data.supplierName });
                setCommodity({ value: data.commodityId, label: data.commodityName });
                setSelectedOptions(data.options.map((opt: any) => ({ value: opt.id, label: opt.name })));
                // Cập nhật ảnh nếu có
                if (data.imageUrl) {
                    setImageUrl(environment.apiBaseUrl + "/products/images/" + data.imageUrl);
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error fetching product", error);
        }
    };

    const fetchSuppliers = async () => {
        const result = await SupplierService.getSuppliers("");
        if (result.status === "OK") {
            setSuppliers(result.data.map((s: any) => ({ value: s.id, label: s.supplierName })));
        }
    };

    const fetchCommodities = async () => {
        const result = await CommodityService.getCommodities("");
        if (result.status === "OK") {
            setCommodities(result.data.map((c: any) => ({ value: c.id, label: c.commodityName })));
        }
    };

    const fetchOptions = async () => {
        const result = await OptionService.getOptions("");
        if (result.status === "OK") {
            setOptions(result.data.map((o: any) => ({ value: o.id, label: o.name })));
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedProduct = {
            name: productName,
            supplierId: supplier?.value,
            commodityId: commodity?.value,
            description,
            optionId: selectedOptions.map(opt => opt.value),
        };

        try {
            const result = await fetchWithAuth(`/products/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedProduct),
            });

            if (result.status !== "OK") {
                if (Array.isArray(result.data)) {
                    result.data.forEach((msg: string) => toast.error(msg));
                }
            } else {
                if (image && id) {
                    ProductService.uploadImages(id, image);
                }
                toast.success("Product updated successfully!");
                setTimeout(() => navigate("/admin/products"), 3000);
            }
        } catch (error) {
            toast.error("Update product failed");
            console.error("Error updating product:", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl); // Cập nhật ảnh xem trước
        }
    };


    return (
        <div className="container">
            <h1>Update Product</h1>
            <form onSubmit={handleUpdateProduct}>
                <div>
                    <label>Product Name</label>
                    <input type="text" className="form-control" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                </div>

                <div>
                    <label>Supplier</label>
                    <Select
                        value={supplier}
                        onChange={(selected) => setSupplier(selected)}
                        options={suppliers}
                        placeholder="Select a supplier"
                    />
                </div>

                <div>
                    <label>Commodity</label>
                    <Select
                        value={commodity}
                        onChange={(selected) => setCommodity(selected)}
                        options={commodities}
                        placeholder="Select a commodity"
                    />
                </div>

                <div>
                    <label>Options</label>
                    <Select
                        isMulti
                        value={selectedOptions}
                        onChange={(selected) => setSelectedOptions(selected as OptionType[])}
                        options={options}
                        placeholder="Select options"
                    />
                </div>

                <div>
                    <label>Description</label>
                    <textarea value={description} className="form-control" onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>

                <div>
                    <label>Image</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                {/* Hiển thị ảnh xem trước nếu có */}
                {(previewImage || imageUrl) && (
                    <div className="update-product__image-preview">
                        <img
                            src={previewImage || imageUrl || undefined} // Chuyển null thành undefined
                            alt="Product"
                            className="update-product__image"
                        />

                    </div>
                )}


                <button type="button" className="btn btn-primary" onClick={handleUpdateProduct}>Update</button>
            </form>
        </div>
    );
};

export default UpdateProduct;
