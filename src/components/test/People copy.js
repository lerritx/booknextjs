// People.js
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

// Component for displaying individual person data
function RetrievePeople({ person, index, onEdit, onDelete }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{person.Age}</td>
            <td className="py-2 px-4">{person.Gender}</td>
            <td className="py-2 px-4">{person.Occupation}</td>
            <td className="py-2 px-4">{person.Monthly_Income}</td>
            <td className="py-2 px-4">{person.Educational_Qualifications}</td>
            <td className="py-2 px-4">{person.Feedback}</td>
            <td className="py-2 px-4">
                <button
                    onClick={() => onEdit(person)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>

                <button
                    onClick={() => onDelete(person)}
                    className="text-red-500 hover:text-red-700 ml-2"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
}

export default function People() {
    const [people, setPeople] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedPerson, setSelectedPerson] = useState({
        Age: "",
        Gender: "",
        Occupation: "",
        Monthly_Income: "",
        Educational_Qualifications: "",
        Feedback: ""
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const peoplePerPage = 10;
    const indexOfLastPerson = currentPage * peoplePerPage;
    const indexOfFirstPerson = indexOfLastPerson - peoplePerPage;
    const currentPeople = people.slice(indexOfFirstPerson, indexOfLastPerson);
    const totalPages = Math.ceil(people.length / peoplePerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Initial data load
    useEffect(() => {
        fetch("http://localhost:3001/people")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPeople(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // Search functionality
    useEffect(() => {
        setSearch(search.trim());
        if (search === "") {
            fetch("http://localhost:3001/people")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setPeople(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/people/search/" + search, {
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
                    setPeople(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);

    // Edit handlers
    const handleEditClick = (person) => {
        setSelectedPerson(person);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/people/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedPerson),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPeople(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    // Delete handlers
    const handleDeleteClick = (person) => {
        setSelectedPerson(person);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/people/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedPerson),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPeople(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    // Create handlers
    const handleCreateClick = () => {
        setSelectedPerson({
            Age: "",
            Gender: "",
            Occupation: "",
            Monthly_Income: "",
            Educational_Qualifications: "",
            Feedback: ""
        });
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/people/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedPerson),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPeople(data);
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
        <div className="container max-w-7xl mx-auto px-4 pt-8 mt-8 my-20 pb-20">
            <h1 className="text-3xl font-bold mb-4">People Data</h1>
            <div className="flex flex-row mb-4">
                <input
                    type="text"
                    className="w-96 border-2 border-teal-500 p-2 rounded-lg"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={handleCreateClick}
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2 float-right"
                >
                    Add Person
                </button>
            </div>
            <table className="min-w-full bg-white table-auto border-b-4 border-teal-500 shadow-lg">
                <thead className="bg-teal-500 text-white text-left">
                    <tr>
                        <th className="py-2 px-4 border-b">No</th>
                        <th className="py-2 px-4 border-b">Age</th>
                        <th className="py-2 px-4 border-b">Gender</th>
                        <th className="py-2 px-4 border-b">Occupation</th>
                        <th className="py-2 px-4 border-b">Monthly Income</th>
                        <th className="py-2 px-4 border-b">Education</th>
                        <th className="py-2 px-4 border-b">Feedback</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPeople.map((person, index) => (
                        <RetrievePeople
                            key={index}
                            person={person}
                            index={indexOfFirstPerson + index}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </tbody>
            </table>

            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 mx-1 rounded ${
                            currentPage === index + 1
                                ? "bg-teal-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Person</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    value={selectedPerson.Age}
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Age: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Gender
                                </label>
                                <input
                                    type="text"
                                    value={selectedPerson.Gender}
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Gender: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    value={selectedPerson.Occupation}
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Occupation: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Monthly Income
                                </label>
                                <input
                                    type="number"
                                    value={selectedPerson.Monthly_Income}
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Monthly_Income: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Education
                                </label>
                                <input
                                    type="text"
                                    value={selectedPerson.Educational_Qualifications}
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Educational_Qualifications: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Feedback
                                </label>
                                <input
                                    type="text"
                                    value={selectedPerson.Feedback}
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Feedback: e.target.value,
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

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete Person</h2>
                        <p>Are you sure you want to delete this person's data?</p>
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
                        <h2 className="text-2xl font-bold mb-4">Add New Person</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Age
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Age: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Gender
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Gender: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Occupation: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Monthly_Income
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Monthly_Income: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Education
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Educational_Qualifications: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Feedback
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setSelectedPerson({
                                            ...selectedPerson,
                                            Feedback: e.target.value,
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