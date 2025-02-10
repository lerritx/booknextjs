"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

function RetrieveBrands({ brand, index, onEdit, onDelete, isAdmin }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{brand.brandname}</td>
            <td className="py-2 px-4">{brand.ceo}</td>
            <td className="py-2 px-4">{brand.copname}</td>
            <td className="py-2 px-4">
                    {/* แสดงปุ่ม Edit/Delete เฉพาะถ้าเป็น Admin */}
                        {isAdmin && (
            <>
                        <button
                          onClick={() => onEdit(gpu)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          onClick={() => onDelete(gpu)}
                          className="text-red-500 hover:text-red-700 ml-3"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    ) 
                        }
                        <button
                        onClick={() => {
                            const query = encodeURIComponent(brand.brandname);
                            window.open(`https://www.google.com/search?q=${brand.brandname}`, '_blank');
                          }}              
                          className="text-blue-500 hover:text-blue-700 ml-3"
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </button>
                  </td>
        </tr>
    );
}

export default function Brand() {
    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [auth, setAuth] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
  }, []);
  const isAdmin = auth?.type === 1;

    const [selectedBrand, setSelectedBrand] = useState({
        brandname: "",
        ceo: "",
        copname: "",
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [brandsPerPage, setBrandsPerPage] = useState(10);
    const [currentGroup, setCurrentGroup] = useState(1);
    const pagesPerGroup = 20; // จำนวนหน้าต่อกลุ่ม

    const totalPages = Math.ceil(brands.length / brandsPerPage);
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
    const indexOfLastBrand = currentPage * brandsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
    const currentBrands = brands.slice(indexOfFirstBrand, indexOfLastBrand);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextGroup = () => {
        if (endPage < totalPages) {
            setCurrentGroup(currentGroup + 1);
            setCurrentPage(startPage + pagesPerGroup);
        }
    };

    const handlePreviousGroup = () => {
        if (startPage > 1) {
            setCurrentGroup(currentGroup - 1);
            setCurrentPage(startPage - pagesPerGroup);
        }
    };

    // Initial Load
    useEffect(() => {
        fetch("http://localhost:3001/brands")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setBrands(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // Search
    useEffect(() => {
        setSearch(search.trim());
        if (search === "") {
            fetch("http://localhost:3001/brands")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setBrands(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/brands/search/" + search, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setBrands(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);

    // Edit handlers
    const handleEditClick = (brand) => {
        setSelectedBrand(brand);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) {
            alert("Access Denied: Only admin can edit brand records.");
            return;
        }
        fetch("http://localhost:3001/brands/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedBrand),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setBrands(data);
                setBrandsPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    // Delete handlers
    const handleDeleteClick = (brand) => {
        setSelectedBrand(brand);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) {
            alert("Access Denied: Only admin can delete brand records.");
            return;
        }
        fetch("http://localhost:3001/brands/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedBrand),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setBrands(data);
                setBrandsPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    // Create handlers
    const handleCreateClick = () => {
        setSelectedBrand({
            brandname: "",
            ceo: "",
            copname: "",
        });
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) {
            alert("Access Denied: Only admin can create brand records.");
            return;
        }
        fetch("http://localhost:3001/brands/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedBrand),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setBrands(data);
                setBrandsPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsCreateModalOpen(false);
    };

    // Search handler
    const handleSearch = () => {
        if (search.trim() === "") {
            fetch("http://localhost:3001/brands")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setBrands(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/brands/search/" + search, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setBrands(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 pt-8 mt-8">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 pt-8 min-h-screen pb-20">
            <br></br><h1 className="text-3xl font-bold mb-4">Brands</h1>

            <div className="flex items-center mb-4">
                <input
                    type="text"
                    className="w-80 border-2 border-blue-500 p-2 rounded-lg"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                            onClick={handleSearch} // เรียกใช้งานฟังก์ชัน handleSearch
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2">
                            Search
                        </button>
                        {isAdmin && (
                        <button
                            onClick={handleCreateClick} // เปิดโมดอลสร้างสิทธิ์ใหม่
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2 float-right"
                        >
                            Add Brand
                        </button> )}
            </div>

            <div className="overflow-y-auto max-h-[60vh] border rounded-lg">
                <table className="min-w-full bg-white table-auto border shadow-lg">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="py-2 px-4">No</th>
                            <th className="py-2 px-4">Brand Name</th>
                            <th className="py-2 px-4">CEO</th>
                            <th className="py-2 px-4">Company Name</th>
                            <th className="py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBrands.map((brand, index) => (
                            <RetrieveBrands
                                key={index}
                                brand={brand}
                                index={indexOfFirstBrand + index}
                                onEdit={handleEditClick} // ฟังก์ชันเมื่อกดปุ่มแก้ไข
                                onDelete={handleDeleteClick} // ฟังก์ชันเมื่อกดปุ่มลบ
                                isAdmin={isAdmin}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={handlePreviousGroup}
                    disabled={startPage === 1}
                    className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    Previous Group
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                    const pageNumber = startPage + index;
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 mx-1 rounded ${
                                currentPage === pageNumber ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    onClick={handleNextGroup}
                    disabled={endPage === totalPages}
                    className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    Next Group
                </button>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Brand</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="brandname"
                                >
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    id="brandname"
                                    value={selectedBrand.brandname}
                                    onChange={(e) =>
                                        setSelectedBrand({
                                            ...selectedBrand,
                                            brandname: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="ceo"
                                >
                                    CEO
                                </label>
                                <input
                                    type="text"
                                    id="ceo"
                                    value={selectedBrand.ceo}
                                    onChange={(e) =>
                                        setSelectedBrand({
                                            ...selectedBrand,
                                            ceo: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="copname"
                                >
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    id="copname"
                                    value={selectedBrand.copname}
                                    onChange={(e) =>
                                        setSelectedBrand({
                                            ...selectedBrand,
                                            copname: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Brand</h2>
                        <p>Are you sure you want to delete {selectedBrand.brandname}?</p>
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={handleDeleteSubmit}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCloseDeleteModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Add Brand</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="brandname"
                                >
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    id="brandname"
                                    value={selectedBrand.brandname}
                                    onChange={(e) =>
                                        setSelectedBrand({
                                            ...selectedBrand,
                                            brandname: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="ceo"
                                >
                                    CEO
                                </label>
                                <input
                                    type="text"
                                    id="ceo"
                                    value={selectedBrand.ceo}
                                    onChange={(e) =>
                                        setSelectedBrand({
                                            ...selectedBrand,
                                            ceo: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="copname"
                                >
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    id="copname"
                                    value={selectedBrand.copname}
                                    onChange={(e) =>
                                        setSelectedBrand({
                                            ...selectedBrand,
                                            copname: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseCreateModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
