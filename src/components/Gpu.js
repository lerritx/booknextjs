"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";

function RetrieveGPUs({ gpu, index, onEdit, onDelete, isAdmin }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{gpu.manufacturer}</td>
            <td className="py-2 px-4">{gpu.productName}</td>
            <td className="py-2 px-4">{gpu.releaseYear}</td>
            <td className="py-2 px-4">{gpu.memSize}</td>
            <td className="py-2 px-4">{gpu.memBusWidth}</td>
            <td className="py-2 px-4">{gpu.gpuClock}</td>
            <td className="py-2 px-4">{gpu.memClock}</td>
            {/* <td className="py-2 px-4">{gpu.unifiedShader}</td>
            <td className="py-2 px-4">{gpu.tmu}</td>
            <td className="py-2 px-4">{gpu.rop}</td>
            <td className="py-2 px-4">{gpu.pixelShader}</td>
            <td className="py-2 px-4">{gpu.vertexShader}</td>
            <td className="py-2 px-4">{gpu.igp}</td> */}
            <td className="py-2 px-4">{gpu.bus}</td>
            <td className="py-2 px-4">{gpu.memType}</td>
            <td className="py-2 px-4">{gpu.gpuChip}</td>
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
              className="text-red-500 hover:text-red-700 ml-1"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </>
        ) 
            }
            <button
            onClick={() => {
                const query = encodeURIComponent(gpu.productName);
                window.open(`https://www.google.com/search?q=${gpu.productName}`, '_blank');
              }}              
              className="text-blue-500 hover:text-blue-700 ml-1"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
      </td>
        </tr>
    );
}

export default function GPU() {
    const [gpus, setGPUs] = useState([]);
    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

       // State สำหรับเก็บ auth ปัจจุบัน
  const [auth, setAuth] = useState(null);

  // อ่าน auth จาก localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
  }, []);

  // สร้างตัวแปรเช็คว่าเป็น Admin ไหม
  const isAdmin = auth?.type === 1;

    const [selectedGPU, setSelectedGPU] = useState({
        manufacturer: "",
        productName: "",
        releaseYear: "",
        memSize: "",
        memBusWidth: "",
        gpuClock: "",
        memClock: "",
        // unifiedShader: "",
        // tmu: "",
        // rop: "",
        // pixelShader: "",
        // vertexShader: "",
        // igp: "",
        bus: "",
        memType: "",
        gpuChip: ""
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [gpusPerPage, setGPUsPerPage] = useState(10);
    const [currentGroup, setCurrentGroup] = useState(1);
    const pagesPerGroup = 10;

    const totalPages = Math.ceil(gpus.length / gpusPerPage);
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
    const indexOfLastGPU = currentPage * gpusPerPage;
    const indexOfFirstGPU = indexOfLastGPU - gpusPerPage;
    const currentGPUs = gpus.slice(indexOfFirstGPU, indexOfLastGPU);

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
    

    useEffect(() => {
        fetch("http://localhost:3001/gpus")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setGPUs(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
        fetch("http://localhost:3001/brands")
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
    }, []);

    useEffect(() => {
        setSearch(search.trim());
        if (search === "") {
            fetch("http://localhost:3001/gpus")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setGPUs(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/gpus/search/" + search, {
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
                    setGPUs(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);

    const handleEditClick = (gpu) => {
        setSelectedGPU(gpu);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) {
            alert("Access Denied: Only admin can edit GPU records.");
            return;
        }
        fetch("http://localhost:3001/gpus/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedGPU),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setGPUs(data);
                setGPUsPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };
    
    
    const handleDeleteClick = (gpu) => {
        setSelectedGPU(gpu);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) {
            alert("Access Denied: Only admin can delete GPU records.");
            return;
        }
        fetch("http://localhost:3001/gpus/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedGPU),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setGPUs(data);
                setGPUsPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };
    

    const handleCreateClick = () => {
        setSelectedGPU({
            manufacturer: "",
            productName: "",
            releaseYear: "",
            memSize: "",
            memBusWidth: "",
            gpuClock: "",
            memClock: "",
            // unifiedShader: "",
            // tmu: "",
            // rop: "",
            // pixelShader: "",
            // vertexShader: "",
            // igp: "",
            bus: "",
            memType: "",
            gpuChip: ""
        });
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleSearch = () => {
        if (search.trim() === "") {
            fetch("http://localhost:3001/gpus")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setGPUs(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/gpus/search/" + search, {
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
                    setGPUs(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!isAdmin) {
            alert("Access Denied: Only admin can create GPU records.");
            return;
        }
        fetch("http://localhost:3001/gpus/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedGPU),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setGPUs(data);
                setGPUsPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsCreateModalOpen(false);
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
            <br></br><h1 className="text-3xl font-bold mb-4">GPU Database</h1>

            {/* Search Section */}
            <div className="flex items-center mb-6">
                <input
                    type="text"
                    className="border-2 border-blue-500 p-2 rounded-lg w-80"
                    placeholder="Search GPU..."
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
                            Add GPU
                        </button> )}

                
            </div>

            {/* GPU Table */}
            <div className="overflow-y-auto max-h-[60vh] border rounded-lg">
                <table className="min-w-full bg-white table-auto border shadow-lg">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                        <th className="py-2 px-4">No</th>
                        <th className="py-2 px-4">manufacturer</th>
                        <th className="py-2 px-4">productName</th>
                        <th className="py-2 px-4">releaseYear</th>
                        <th className="py-2 px-4">memSize</th>
                        <th className="py-2 px-4">memBus</th>
                        <th className="py-2 px-4">gpuClock</th>
                        <th className="py-2 px-4">memClock</th>
                        {/* <th className="py-2 px-4">unifiedShader</th>
                        <th className="py-2 px-4">tmu</th>
                        <th className="py-2 px-4">rop</th>
                        <th className="py-2 px-4">pixelShader</th>
                        <th className="py-2 px-4">vertexShader</th>
                        <th className="py-2 px-4">igp</th> */}
                        <th className="py-2 px-4">bus</th>
                        <th className="py-2 px-4">memType</th>
                        <th className="py-2 px-4">gpuChip</th>
                        <th className="py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentGPUs.map((gpu, index) => (
                            <RetrieveGPUs
                                key={index}
                                gpu={gpu}
                                index={indexOfFirstGPU + index}
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

            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit GPU</h2>
                        <form onSubmit={handleEditSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brand">
                                Brand
                            </label>
                            <select
                                id="brand"
                                value={selectedGPU.manufacturer}
                                onChange={(e) =>
                                    setSelectedGPU({ ...selectedGPU, manufacturer: e.target.value })
                                }
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">Select Brand</option>
                                {brands.map((brand, index) => (
                                    <option key={index} value={brand.brandname}>
                                        {brand.brandname}
                                    </option>
                                ))}
                            </select>
                        </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={selectedGPU.productName}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, productName: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Release Year</label>
                                <input
                                    type="text"
                                    value={selectedGPU.releaseYear}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, releaseYear: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Size</label>
                                <input
                                    type="text"
                                    value={selectedGPU.memSize}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memSize: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Bus Width</label>
                                <input
                                    type="text"
                                    value={selectedGPU.memBusWidth}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memBusWidth: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">GPU Clock</label>
                                <input
                                    type="text"
                                    value={selectedGPU.gpuClock}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, gpuClock: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Clock</label>
                                <input
                                    type="text"
                                    value={selectedGPU.memClock || ""}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memClock: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            {/* <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Unified Shader</label>
                                <input
                                    type="text"
                                    value={selectedGPU.unifiedShader}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, unifiedShader: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">TMU</label>
                                <input
                                    type="text"
                                    value={selectedGPU.tmu}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, tmu: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ROP</label>
                                <input
                                    type="text"
                                    value={selectedGPU.rop}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, rop: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Pixel Shader</label>
                                <input
                                    type="text"
                                    value={selectedGPU.pixelShader}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, pixelShader: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Vertex Shader</label>
                                <input
                                    type="text"
                                    value={selectedGPU.vertexShader}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, vertexShader: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">IGP</label>
                                <input
                                    type="text"
                                    value={selectedGPU.igp}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, igp: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div> */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Bus</label>
                                <input
                                    type="text"
                                    value={selectedGPU.bus}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, bus: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Type</label>
                                <input
                                    type="text"
                                    value={selectedGPU.memType}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memType: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">GPU Chip</label>
                                <input
                                    type="text"
                                    value={selectedGPU.gpuChip}
                                    onChange={(e) => setSelectedGPU({...selectedGPU, gpuChip: e.target.value})}
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

            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete GPU</h2>
                        <p>Are you sure you want to delete {selectedGPU.productName}?</p>
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

            {isCreateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Create GPU</h2>
                        <form onSubmit={handleCreateSubmit}>
                        <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brand">
        Brand
    </label>
    <select
        id="brand"
        value={selectedGPU.manufacturer}
        onChange={(e) =>
            setSelectedGPU({ ...selectedGPU, manufacturer: e.target.value })
        }
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    >
        <option value="">Select Brand</option>
        {brands.map((brand, index) => (
            <option key={index} value={brand.brandname}>
                {brand.brandname}
            </option>
        ))}
    </select>
</div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, productName: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Release Year</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, releaseYear: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Size</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memSize: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Bus Width</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memBusWidth: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">GPU Clock</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, gpuClock: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Block</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memClock: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            {/* <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Unified Shader</label>
                    <input
                        type="text"
                        onChange={(e) => setSelectedGPU({ ...selectedGPU, unifiedShader: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">TMU</label>
                    <input
                        type="text"
                        onChange={(e) => setSelectedGPU({ ...selectedGPU, tmu: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ROP</label>
                    <input
                        type="text"
                        onChange={(e) => setSelectedGPU({ ...selectedGPU, rop: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Pixel Shader</label>
                    <input
                        type="text"
                        onChange={(e) => setSelectedGPU({ ...selectedGPU, pixelShader: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Vertex Shader</label>
                    <input
                        type="text"
                        onChange={(e) => setSelectedGPU({ ...selectedGPU, vertexShader: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">IGP</label>
                    <input
                        type="text"
                        onChange={(e) => setSelectedGPU({ ...selectedGPU, igp: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        // required
                    />
                </div> */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Bus</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, bus: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Memory Type</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, memType: e.target.value})}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    // required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">GPU Chip</label>
                                <input
                                    type="text"
                                    onChange={(e) => setSelectedGPU({...selectedGPU, gpuChip: e.target.value})}
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
