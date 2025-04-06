import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetchWithAuth from "../../../fetch/FetchAdmin";
import { FaCheck, FaPlus, FaRegEdit, FaTrash } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Option.css";
import { OptionUpdateDTO } from "../../../dtos/option/option.update.dto";
import { Pagination } from "react-bootstrap";
import Select from "react-select";

const OptionComponent: React.FC = () => {
    const fetchWithAuth = useFetchWithAuth();
    const [options, setOptions] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [name, setName] = useState<string>("");

    const [isActive, setIsActive] = useState<boolean>(true);
    const [updatedName, setUpdatedName] = useState<string>("");
    const [isMultipleUsage, setIsMultipleUsage] = useState<boolean>(false);

    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [index, setIndex] = useState<number>(0);
    const [optionUpdate, setOptionUpdate] = useState<OptionUpdateDTO | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [optionToDelete, setOptionToDelete] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isCreateNewOption, setIsCreateNewOption] = useState<boolean>(false);
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedOptionId, setSelectedOptionId] = useState<number>();
    const [multipleUsage, setMultipleUsage] = useState<boolean>(false);
    const [optionName, setOptionName] = useState("");


    const confirmDelete = (optionId: number) => {
        setOptionToDelete(optionId);
        setShowConfirm(true);
    };

    useEffect(() => {
        getAllOptions(name, isActive, currentPage, itemsPerPage);
    }, [name, isActive, currentPage, itemsPerPage]);

    const getAllOptions = async (
        name: string,
        isActive: boolean,
        page: number,
        limit: number
    ) => {
        try {
            await fetchWithAuth(`/options?name=${name}&isActive=${isActive}&page=${page}&limit=${limit}`)
                .then(result => {
                    if (result.status !== "OK") {
                        toast.error(result.message);
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        setOptions(result.data.options);
                        setTotalPages(result.data.totalPages);
                    }
                }).catch(error => {
                    toast.error(error);
                    console.error("Error fetching options:", error);
                });
        } catch (error) {
            console.error("Error fetching options:", error);
        }
    };

    const updateOption = async (optionId: number) => {
        if (!optionUpdate) return;
        try {
            await fetchWithAuth(`/options/${optionId}`, {
                method: "PUT",
                body: JSON.stringify(optionUpdate),
            }).then(result => {
                if (result.status !== "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    toast.success(result.message);
                    getAllOptions(name, isActive, currentPage, itemsPerPage);
                    setIsEdit(false);
                }
            }).catch(error => {
                toast.error(error);
                console.error("Error updating option:", error);
            });
        } catch (error) {
            console.error("Error updating option:", error);
        }
    };

    const deleteOption = async () => {
        if (optionToDelete === null) return;
        try {
            await fetchWithAuth(`/options/${optionToDelete}`, { method: "DELETE" });
            getAllOptions(name, isActive, currentPage, itemsPerPage);
            setShowConfirm(false);
            toast.success("Option deleted successfully");
        } catch (error) {
            console.error("Error deleting option:", error);
            toast.error("Failed to delete option");
        }
    };

    const createOption = async () => {
        // Kiểm tra dữ liệu đầu vào
        if (!isCreateNewOption && selectedOptionId === null) {
            toast.error("Please select an existing option or create a new one.");
            return;
        }

        const payload = {
            optionName: isCreateNewOption ? optionName.trim() : undefined, // Nếu chọn "Create New Option", gửi tên mới
            optionId: !isCreateNewOption ? selectedOptionId : undefined, // Nếu chọn option có sẵn, gửi ID
            isCreateNew: isCreateNewOption,
            isMultipleUsage: multipleUsage,
            optionValues: tags, // Danh sách giá trị từ input
        };

        try {
            await fetchWithAuth(`/options`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(result => {
                if (result.status != "OK") {
                    toast.error(result.message);
                    if (Array.isArray(result.data)) {
                        result.data.forEach((msg: string) => toast.error(msg));
                    }
                } else {
                    toast.success(result.message);
                    getAllOptions(name, isActive, currentPage, itemsPerPage); // Cập nhật lại danh sách
                    setShowModal(false); // Đóng modal
                    setTags([]); // Reset tags
                    setInputValue(""); // Reset input
                    setIsCreateNewOption(false); // Reset trạng thái

                }
            }).catch(error => {
                toast.error(error);
                console.error("Error fetching commodity:", error);
            });
        } catch (error) {
            console.error("Error creating option:", error);
            toast.error("Failed to create option.");
        }
    };


    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsCreateNewOption(event.target.checked);
    };


    // Xử lý khi nhấn Enter
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && inputValue.trim() !== "") {
            event.preventDefault(); // Ngăn chặn form submit
            setTags([...tags, inputValue.trim()]);
            setInputValue(""); // Reset input
        }
    };

    // Xóa tag
    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };


    return (
        <div className="container">
            <h1 className="title">Manage Option</h1>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search option"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>
                    <FaPlus />
                </button>
            </div>
            <table className="options-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Option Name</th>
                        <th>Active</th>
                        <th>Multiple Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {options.map((option, i) => (
                        <tr key={option.id}>
                            <td>{option.id}</td>
                            <td>
                                {isEdit && index === i ? (
                                    <input
                                        type="text"
                                        value={updatedName}
                                        onChange={(e) => setUpdatedName(e.target.value)}
                                    />
                                ) : (
                                    option.name
                                )}
                            </td>
                            <td>{option.active ? "Yes" : "No"}</td>
                            <td>
                                {isEdit && index === i ? (
                                    <input
                                        type="checkbox"
                                        checked={isMultipleUsage}
                                        onChange={(e) => setIsMultipleUsage(e.target.checked)}
                                    />
                                ) : (
                                    option.isMultipleUsage ? "true" : "false"
                                )}
                            </td>
                            <td>
                                {isEdit && index === i ? (
                                    <button className="edit-btn" onClick={() => {
                                        setOptionUpdate({
                                            optionId: option.id,
                                            optionName: updatedName,
                                            isMultipleUsage: isMultipleUsage
                                        });
                                        updateOption(option.id);
                                    }}>
                                        <FaCheck />
                                    </button>
                                ) : (
                                    <button className="edit-btn" onClick={() => {
                                        setIsEdit(true);
                                        setIndex(i);
                                        setUpdatedName(option.name);
                                        setIsMultipleUsage(option.isMultipleUsage);
                                    }}>
                                        <FaRegEdit />
                                    </button>
                                )}
                                <button className="delete-btn" onClick={() => confirmDelete(option.id)}>
                                    <FaTrash />
                                </button>
                                <button className="detail-btn" onClick={() => navigate(`/admin/options/${option.id}`)} >
                                    <IoIosInformationCircle />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this option?</p>
                        <button className="confirm-btn" onClick={deleteOption}>Yes</button>
                        <button className="cancel-btn" onClick={() => setShowConfirm(false)}>No</button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-option">
                    <div className="modal-header d-flex justify-content-center ">
                        <h2 className="modal-title w-100 text-center" id="deleteModalLabel">Create Option</h2>
                    </div>
                    <div className="modal-body">
                        <label className="d-flex justify-content-center">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked"
                                    checked={isCreateNewOption}
                                    onChange={handleCheckboxChange} />
                                <label className="form-check-label">Is create new option?</label>
                            </div>
                        </label>
                        <label className="d-flex justify-content-center">Option Name: </label>
                        <div className="d-flex justify-content-center">
                        
                        {isCreateNewOption ?
                            <div>
                                <input type="text" placeholder="Enter option name"
                                    onChange={(e) => setOptionName(e.target.value)} />
                                <br />
                                <div className="form-check">
                                    <br />
                                    <input className="form-check-input"
                                        onChange={(e) => setMultipleUsage(e.target.checked)}
                                        type="checkbox" value="" id="flexCheckDefault" />
                                    <label className="form-check-label" >
                                        Is multiple usage?
                                    </label>
                                </div>
                            </div>

                            :
                            <select className="form-select"
                                aria-label="Default select example" name="optionId"
                                onChange={(e) => setSelectedOptionId(Number(e.target.value))}>
                                <option selected disabled>Open this select option</option>
                                {options.map((option, i) => (
                                    <option value={option.id} key={option.id} >{option.name}</option>
                                ))}
                            </select>
                        }
                        </div>
                        <br />
                        <br />

                        <div className="tag-wrapper">
                            {tags.map((tag, index) => (
                                <span key={index} className="tag">
                                    {tag}
                                    <button className="remove-tag" onClick={() => removeTag(index)}>✖</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter option value name..."
                            />
                        </div>

                        <hr />

                        <div className="modal-footer">
                            <button className="confirm-btn" onClick={createOption}>Save</button>
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            )}
        </div>
    );
};

export default OptionComponent;