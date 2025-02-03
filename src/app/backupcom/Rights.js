// Rights.js
"use client"; // ระบุว่าโค้ดนี้จะถูกรันบนฝั่งผู้ใช้งาน (Client-side)

import { useState, useEffect } from "react"; // ใช้ useState และ useEffect เพื่อจัดการสถานะและวงจรชีวิตของคอมโพเนนต์
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // นำเข้า FontAwesomeIcon สำหรับใช้ไอคอนใน UI
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"; // นำเข้าไอคอนสำหรับการแก้ไขและลบ

// ฟังก์ชัน RetrieveRights สำหรับแสดงข้อมูลสิทธิ์ของผู้ป่วยและปุ่มแก้ไข ลบ
function RetrieveRights({ right, index, onEdit, onDelete }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td> 
            <td className="py-2 px-4">{right.Patient_Rights}</td> 
            <td className="py-2 px-4">{right.Thai_Rights_Name}</td> 
            <td className="py-2 px-4">{right.Eng_Rights_Name}</td>
            <td className="py-2 px-4">
                <button
                    onClick={() => onEdit(right)} // เรียกใช้งานฟังก์ชัน onEdit เมื่อกดปุ่มแก้ไข
                    className="text-blue-500 hover:text-blue-700"
                >
                    <FontAwesomeIcon icon={faPenToSquare} /> {/*แสดงไอคอน */}
                </button>

                <button
                    onClick={() => onDelete(right)} // เรียกใช้งานฟังก์ชัน onDelete เมื่อกดปุ่มลบ
                    className="text-red-500 hover:text-red-700 ml-2"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
}

export default function Rights() {
    const [rights, setRights] = useState([]); // กำหนดสถานะสำหรับเก็บข้อมูลสิทธิ์ผู้ป่วย
    const [search, setSearch] = useState(""); // สถานะสำหรับเก็บค่าค้นหา
    const [loading, setLoading] = useState(true); // สถานะสำหรับแสดงการโหลดข้อมูล

    const [selectedRight, setSelectedRight] = useState({ // สถานะสำหรับสิทธิ์ที่ถูกเลือกเพื่อแก้ไข หรือลบ
        Patient_Rights: "",
        Thai_Rights_Name: "",
        Eng_Rights_Name: "",
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // สถานะสำหรับควบคุมการแสดงโมดอลแก้ไข
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // สถานะสำหรับควบคุมการแสดงโมดอลลบ
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // สถานะสำหรับควบคุมการแสดงโมดอลสร้างใหม่

    ///// PAGINATION /////
    const [currentPage, setCurrentPage] = useState(1); // สถานะสำหรับเก็บหน้าปัจจุบันของการแบ่งหน้า
    const [rightsPerPage, setRightsPerPage] = useState(5); // Default to 5 items per page// จำนวนสิทธิ์ที่จะแสดงต่อหน้า
    const indexOfLastRight = currentPage * rightsPerPage; // คำนวณตำแหน่งสุดท้ายของสิทธิ์ในหน้าปัจจุบัน
    const indexOfFirstRight = indexOfLastRight - rightsPerPage; // คำนวณตำแหน่งแรกของสิทธิ์ในหน้าปัจจุบัน
    const currentRights = rights.slice(indexOfFirstRight, indexOfLastRight); // สิทธิ์ในหน้าปัจจุบัน
    const totalPages = Math.ceil(rights.length / rightsPerPage); // คำนวณจำนวนหน้าทั้งหมด

    const handlePageChange = (pageNumber) => { // ฟังก์ชันสำหรับเปลี่ยนหน้าปัจจุบัน
        setCurrentPage(pageNumber);
    };


    //หน้าแรก
    useEffect(() => {
        fetch("http://localhost:3001/rights")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json(); // แปลงข้อมูลเป็น JSON
            })
            .then((data) => {
                setRights(data); // เก็บข้อมูลใน state `rights`
                setLoading(false); // ปิด loading
            })
            .catch((err) => {
                console.log(err); // แสดงข้อผิดพลาดใน console
            });
    }, []);
    

    //หน้าค้นหาทันทีเมื่อเปลี่ยนข้อมูล
    useEffect(() => { // ฟังก์ชันสำหรับการค้นหาเมื่อมีการเปลี่ยนแปลงในช่องค้นหา
        setSearch(search.trim()); // ลบช่องว่างที่หน้าและท้ายข้อความ
        if (search === "") {
            fetch("http://localhost:3001/rights") // ดึงข้อมูลสิทธิ์ทั้งหมดถ้าช่องค้นหาว่าง
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setRights(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/rights/search/" + search, { // ดึงข้อมูลสิทธิ์ตามคำค้นหา
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
                    setRights(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);
    
    //การแก้ไข
    const handleEditClick = (right) => { // เปิดโมดอลแก้ไขและตั้งค่าสิทธิ์ที่ถูกเลือก
        setSelectedRight(right); //สถานะสำหรับสิทธิ์ที่ถูกเลือกเพื่อแก้ไข หรือลบ
        setIsEditModalOpen(true); // สถานะสำหรับควบคุมการแสดงโมดอลแก้ไข
    };

    const handleCloseEditModal = () => { // ปิดโมดอลแก้ไข
        setIsEditModalOpen(false); // สถานะสำหรับควบคุมการแสดงโมดอลแก้ไข
    };

    const handleEditSubmit = (e) => { // ส่งข้อมูลที่แก้ไขไปยังเซิร์ฟเวอร์
        e.preventDefault(); //ป้องกันไม่ให้ฟอร์มรีเฟรชหน้าเว็บระหว่างที่กำลังเรียก API หรือดำเนินการอื่น ๆ ในฟังก์ชัน
        fetch("http://localhost:3001/rights/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedRight),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
                setRightsPerPage(10); // Change to 10 items per page after update
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    //การลบ
    const handleDeleteClick = (right) => { // เปิดโมดอลลบและตั้งค่าสิทธิ์ที่ถูกเลือก
        setSelectedRight(right); //สถานะสำหรับสิทธิ์ที่ถูกเลือกเพื่อแก้ไข หรือลบ
        setIsDeleteModalOpen(true); // สถานะสำหรับควบคุมการแสดงโมดอลลบ
    };

    const handleCloseDeleteModal = () => { // ปิดโมดอลลบ
        setIsDeleteModalOpen(false); // สถานะสำหรับควบคุมการแสดงโมดอลลบ
    };

    const handleDeleteSubmit = (e) => { // ส่งคำขอลบสิทธิ์ไปยังเซิร์ฟเวอร์
        e.preventDefault(); //ป้องกันไม่ให้ฟอร์มรีเฟรชหน้าเว็บระหว่างที่กำลังเรียก API หรือดำเนินการอื่น ๆ ในฟังก์ชัน 
        fetch("http://localhost:3001/rights/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedRight),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
                setRightsPerPage(10); // Change to 10 items per page after update
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    //การเพิ่มข้อมูล
    const handleCreateClick = () => { // เปิดโมดอลสร้างสิทธิ์ใหม่
        setSelectedRight({
            Patient_Rights: "",
            Thai_Rights_Name: "",
            Eng_Rights_Name: "",
        }); //สถานะสำหรับสิทธิ์ที่ถูกเลือกเพื่อแก้ไข หรือลบ
        setIsCreateModalOpen(true); // สถานะสำหรับควบคุมการแสดงโมดอลสร้างใหม่
    };

    const handleCloseCreateModal = () => { // ปิดโมดอลสร้างสิทธิ์ใหม่
        setIsCreateModalOpen(false); // สถานะสำหรับควบคุมการแสดงโมดอลสร้างใหม่
    };

    //ค้นหา
    const handleSearch = () => { // ฟังก์ชันสำหรับการค้นหาข้อมูลสิทธิ์
        if (search.trim() === "") {
            fetch("http://localhost:3001/rights")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setRights(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/rights/search/" + search, {
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
                    setRights(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    //สร้าง
    const handleCreateSubmit = (e) => { // ส่งคำขอสร้างสิทธิ์ใหม่ไปยังเซิร์ฟเวอร์
        e.preventDefault(); //ป้องกันไม่ให้ฟอร์มรีเฟรชหน้าเว็บระหว่างที่กำลังเรียก API หรือดำเนินการอื่น ๆ ในฟังก์ชัน
        fetch("http://localhost:3001/rights/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedRight),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
                setRightsPerPage(10); // Change to 10 items per page after update
            })
            .catch((err) => {
                console.log(err);
            });
        setIsCreateModalOpen(false);
    };

    if (loading) {
        return ( // แสดงข้อความ Loading เมื่อข้อมูลยังโหลดไม่เสร็จ
            <div className="container mx-auto px-4 pt-8 mt-8">
                <div>Loading...</div>
            </div>
        );
    }

    return ( // การแสดงผลหลักของคอมโพเนนต์ Rights
        <div className="container max-w-7xl mx-auto px-4 pt-8 mt-8 my-20 pb-20">
            <h1 className="text-3xl font-bold mb-4">Rights</h1>
            <div className="flex flex-row mb-4">
                <input
                    type="text" // ช่องค้นหา
                    className="w-96 border-2 border-teal-500 p-2 rounded-lg"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} // ตั้งค่าสถานะ search เมื่อมีการเปลี่ยนแปลง
                />
                <button 
                    onClick={handleSearch} // เรียกใช้งานฟังก์ชัน handleSearch
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2">
                    Search
                </button>

                <button
                    onClick={handleCreateClick} // เปิดโมดอลสร้างสิทธิ์ใหม่
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2 float-right"
                >
                    Add Right
                </button>
            </div>
            <table className="min-w-full bg-white table-auto border-b-4 border-teal-500 shadow-lg">
                <thead className="bg-teal-500 text-white text-left">
                    <tr>
                        <th className="py-2 px-4 border-b">No</th> 
                        <th className="py-2 px-4 border-b">Patient Rights</th> 
                        <th className="py-2 px-4 border-b">Thai Name</th> 
                        <th className="py-2 px-4 border-b">English Name</th> 
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRights.map((right, index) => ( // แสดงสิทธิ์ในแต่ละหน้า
                        <RetrieveRights
                            key={index} // ค่าคีย์สำหรับแต่ละสิทธิ์
                            right={right}
                            index={indexOfFirstRight + index} // คำนวณลำดับสิทธิ์
                            onEdit={handleEditClick} // ฟังก์ชันเมื่อกดปุ่มแก้ไข
                            onDelete={handleDeleteClick} // ฟังก์ชันเมื่อกดปุ่มลบ
                        />
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, index) => ( // สร้างปุ่มเปลี่ยนหน้า
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)} // เรียกใช้งานฟังก์ชันเปลี่ยนหน้า
                        className={`px-4 py-2 mx-1 rounded ${currentPage === index + 1
                                ? "bg-teal-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                    >
                        {index + 1}
                    </button>

                ))}
            </div>

            {/* Modals for Create, Edit, and Delete เป็น Parameter */}
            {isEditModalOpen && ( // โมดอลสำหรับแก้ไขสิทธิ์
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Right</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Patient_Rights"
                                >
                                    Patient Rights
                                </label>
                                <input
                                    type="text"
                                    id="Patient_Rights"
                                    value={selectedRight.Patient_Rights}
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Patient_Rights: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Thai_Rights_Name"
                                >
                                    Thai Name
                                </label>
                                <input
                                    type="text"
                                    id="Thai_Rights_Name"
                                    value={selectedRight.Thai_Rights_Name}
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Thai_Rights_Name: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Eng_Rights_Name"
                                >
                                    English Name
                                </label>
                                <input
                                    type="text"
                                    id="Eng_Rights_Name"
                                    value={selectedRight.Eng_Rights_Name}
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Eng_Rights_Name: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
            {isDeleteModalOpen && ( // โมดอลสำหรับลบสิทธิ์
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Right</h2>
                        <p>Are you sure you want to delete {selectedRight.Patient_Rights}?</p>
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
            {isCreateModalOpen && (  // เช็คว่า modal จะเปิดขึ้นหรือไม่ โดยดูจากสถานะของ isCreateModalOpen
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">  {/* กำหนดตำแหน่งและลักษณะการแสดงผลของ modal ให้อยู่กลางหน้าจอและมีพื้นหลังทึบ */}
        <div className="bg-white rounded-lg p-6 w-full max-w-md">  {/* กำหนดกล่องภายใน modal มีพื้นหลังขาว, มุมโค้งมน, ช่องว่างในกล่อง, ความกว้างเต็ม */}
            <h2 className="text-2xl font-bold mb-4">Create Right</h2>  {/* หัวข้อที่แสดงใน modal: "Create Right" */}
            <form onSubmit={handleCreateSubmit}>  {/* ฟอร์มที่จะเรียกฟังก์ชัน handleCreateSubmit เมื่อมีการส่งฟอร์ม */}
                <div className="mb-4">  {/* ช่องกรอกข้อมูลสำหรับ "Patient Rights" */}
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="Patient_Rights"
                    >
                        Patient Rights  {/* แสดงข้อความ "Patient Rights" ที่จะใช้เป็นคำอธิบายของช่องกรอก */}
                    </label>
                    <input
                        type="text"
                        id="Patient_Rights"
                        onChange={(e) =>
                            setSelectedRight({
                                ...selectedRight,
                                Patient_Rights: e.target.value,
                            })  // เมื่อมีการกรอกข้อมูลในช่องนี้ จะอัปเดตค่าของ Patient_Rights ใน selectedRight
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required  // กำหนดให้ช่องนี้ต้องกรอกข้อมูล
                    />
                </div>
                <div className="mb-4">  {/* ช่องกรอกข้อมูลสำหรับ "Thai Name" */}
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="Thai_Rights_Name"
                    >
                        Thai Name  {/* แสดงข้อความ "Thai Name" ที่จะใช้เป็นคำอธิบายของช่องกรอก */}
                    </label>
                    <input
                        type="text"
                        id="Thai_Rights_Name"
                        onChange={(e) =>
                            setSelectedRight({
                                ...selectedRight,
                                Thai_Rights_Name: e.target.value,
                            })  // เมื่อมีการกรอกข้อมูลในช่องนี้ จะอัปเดตค่าของ Thai_Rights_Name ใน selectedRight
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required  // กำหนดให้ช่องนี้ต้องกรอกข้อมูล
                    />
                </div>
                <div className="mb-4">  {/* ช่องกรอกข้อมูลสำหรับ "English Name" */}
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="Eng_Rights_Name"
                    >
                        English Name  {/* แสดงข้อความ "English Name" ที่จะใช้เป็นคำอธิบายของช่องกรอก */}
                    </label>
                    <input
                        type="text"
                        id="Eng_Rights_Name"
                        onChange={(e) =>
                            setSelectedRight({
                                ...selectedRight,
                                Eng_Rights_Name: e.target.value,
                            })  // เมื่อมีการกรอกข้อมูลในช่องนี้ จะอัปเดตค่าของ Eng_Rights_Name ใน selectedRight
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required  // กำหนดให้ช่องนี้ต้องกรอกข้อมูล
                    />
                </div>
                <div className="flex items-center justify-between">  {/* ใช้ Flexbox ในการจัดการปุ่มในบรรทัดเดียว */}
                    <button
                        type="submit"
                        className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save  {/* ปุ่มสำหรับส่งฟอร์มและบันทึกข้อมูล */}
                    </button>
                    <button
                        type="button"
                        onClick={h
                            
                        }  // ปุ่มสำหรับปิด modal โดยเรียกฟังก์ชัน handleCloseCreateModal
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Cancel  {/* ปุ่มสำหรับยกเลิกการสร้างข้อมูล */}
                    </button>
                </div>
                    </form>
                </div>
            </div>
        )}
            </div>
    );
}
