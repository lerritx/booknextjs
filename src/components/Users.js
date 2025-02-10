"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash ,faKey} from "@fortawesome/free-solid-svg-icons";


function RetrieveUsers({ user, index, onEdit, onDelete, onChangePassword }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{user.username}</td>
            <td className="py-2 px-4">{user.password}</td>
            <td className="py-2 px-4">
                {Number(user.permiss) === 1 ? "Permissible" : "Unpermissible"}
            </td>
            <td className="py-2 px-4">
                {Number(user.type) === 1 ? "Administrator" : "User"}
            </td>
            <td className="py-2 px-4">
                <button
                    onClick={() => onEdit(user)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                    onClick={() => onChangePassword(user)}
                    className="bg-transparent text-yellow-500 font-bold py-1 px-2 rounded mr-2 hover:text-yellow-600"
                >
                    <FontAwesomeIcon icon={faKey} />
                </button>

                <button
                    onClick={() => onDelete(user)}
                    className="text-red-500 hover:text-red-700"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
}

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState({
        username: "",
        password: "",
        permiss: "1", // ค่าเริ่มต้นสำหรับ permission
        type: "0",    // ค่าเริ่มต้นสำหรับ type (User)
    });
    
    // State สำหรับ modal แก้ไขข้อมูล (ยกเว้นรหัสผ่าน)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // State สำหรับ modal ลบข้อมูล
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // State สำหรับ modal สร้างผู้ใช้ใหม่
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // State สำหรับ modal แก้ไขรหัสผ่าน
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    // เก็บข้อมูลผู้ใช้ที่ต้องการแก้ไขรหัสผ่าน
    const [passwordModalUser, setPasswordModalUser] = useState(null);
    // State สำหรับรหัสผ่านใหม่
    const [newPassword, setNewPassword] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentGroup, setCurrentGroup] = useState(1);
    const pagesPerGroup = 20;

    const totalPages = Math.ceil(users.length / usersPerPage);
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

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
        fetch("http://localhost:3001/users")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // Search
    useEffect(() => {
        const trimmedSearch = search.trim();
        if (trimmedSearch === "") {
            fetch("http://localhost:3001/users")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setUsers(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/users/search/" + trimmedSearch, {
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
                    setUsers(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);

    // Edit handlers (สำหรับแก้ไขข้อมูลผู้ใช้ ยกเว้นรหัสผ่าน)
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/users/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedUser),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setUsersPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    // Delete handlers
    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/users/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedUser),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setUsersPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    // Create handlers
    const handleCreateClick = () => {
        setSelectedUser({
            username: "",
            password: "",
            permiss: "1",
            type: "0",
        });
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
    
        // ตรวจสอบก่อนว่ามี username นี้อยู่แล้วหรือไม่
        const isDuplicate = users.some(user => 
            user.username.toLowerCase() === selectedUser.username.toLowerCase()
        );
    
        if (isDuplicate) {
            alert("Username already exists. Please choose a different username.");
            return;
        }
    
        // ถ้าไม่ซ้ำ ดำเนินการสร้างผู้ใช้ใหม่
        fetch("http://localhost:3001/users/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedUser),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setUsersPerPage(10);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsCreateModalOpen(false);
    };

    // Password Modal handlers
    const handlePasswordClick = (user) => {
        setPasswordModalUser(user);
        setNewPassword("");
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // ส่ง request ไปที่ endpoint สำหรับอัปเดตรหัสผ่าน (ตัวอย่างใช้ /users/updatePassword)
        fetch("http://localhost:3001/users/updatePassword", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: passwordModalUser.id, password: newPassword }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setIsPasswordModalOpen(false);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // Search handler (สำหรับปุ่ม Search)
    const handleSearch = () => {
        if (search.trim() === "") {
            fetch("http://localhost:3001/users")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setUsers(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/users/search/" + search, {
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
                    setUsers(data);
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
            <br />
            <h1 className="text-3xl font-bold mb-4">Users Management</h1>

            <div className="flex items-center mb-4">
                <input
                    type="text"
                    className="w-80 border-2 border-blue-500 p-2 rounded-lg"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
                >
                    Search
                </button>

                <button
                    onClick={handleCreateClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2 float-right"
                >
                    Add User
                </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] border rounded-lg">
                <table className="min-w-full bg-white table-auto border shadow-lg">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="py-2 px-4">No</th>
                            <th className="py-2 px-4">Username</th>
                            <th className="py-2 px-4">Password</th>
                            <th className="py-2 px-4">Permission</th>
                            <th className="py-2 px-4">Type</th>
                            <th className="py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <RetrieveUsers
                                key={index}
                                user={user}
                                index={indexOfFirstUser + index}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                onChangePassword={handlePasswordClick}
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
                                currentPage === pageNumber
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
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

            {/* Edit Modal (สำหรับแก้ไขข้อมูลผู้ใช้ ยกเว้นรหัสผ่าน) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="username"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={selectedUser.username}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            username: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            {/* แทนที่ field แก้ไขรหัสผ่านเดิมด้วยปุ่ม Change Password */}
                            
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="permiss"
                                >
                                    Permission
                                </label>
                                <select
                                    id="permiss"
                                    value={selectedUser.permiss}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            permiss: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="1">Permissible</option>
                                    <option value="0">Unpermissible</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="type"
                                >
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={selectedUser.type}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            type: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="0">User</option>
                                    <option value="1">Administrator</option>
                                </select>
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
                        <h2 className="text-2xl font-bold mb-4">Delete User</h2>
                        <p>Are you sure you want to delete {selectedUser.username}?</p>
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
                        <h2 className="text-2xl font-bold mb-4">Add User</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="username"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={selectedUser.username}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, username: e.target.value })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={selectedUser.password}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, password: e.target.value })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="permiss"
                                >
                                    Permission
                                </label>
                                <select
                                    id="permiss"
                                    value={selectedUser.permiss}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, permiss: e.target.value })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="1">permissible</option>
                                    <option value="0">unpermissible</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="type"
                                >
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={selectedUser.type}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, type: e.target.value })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="0">User</option>
                                    <option value="1">Administrator</option>
                                </select>
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

            {/* Password Modal (สำหรับแก้ไขรหัสผ่านเท่านั้น) */}
            {isPasswordModalOpen && passwordModalUser && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                        <p className="mb-4">Change password for {passwordModalUser.username}</p>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="newPassword"
                                >
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Update Password
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClosePasswordModal}
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
