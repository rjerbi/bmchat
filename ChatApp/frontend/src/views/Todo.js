import { useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import '../styles/style.css';

function Todo() {
    const baseUrl = "http://127.0.0.1:8000/api";
    const api = useAxios();

    const token = localStorage.getItem("authTokens");
    const decoded = jwtDecode(token);
    const user_id = decoded.user_id;

    const [todo, setTodo] = useState([]);
    const [apiResponse, setApiResponse] = useState("");
    const [createTodo, setCreateTodo] = useState({ title: "", completed: "" });

    useEffect(() => {
        fetchTodos();
        fetchApiData();
    }, []);

    const fetchTodos = async () => {
        try {
            const res = await api.get(`${baseUrl}/todo/${user_id}/`);
            setTodo(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchApiData = async () => {
        try {
            const response = await api.get("/test/");
            setApiResponse(response.data.response);
            
            Swal.fire({
                text: response.data.response,
                icon: "info",
                confirmButtonText: "OK",
                timer: 5000, //Auto close after 5 seconds
                customClass: {
                    popup: 'small-popup', // Custom class for the popup
                },
            });
        } catch (error) {
            console.log(error);
            setApiResponse("Something went wrong");
            Swal.fire({
                title: "Error",
                text: "Something went wrong",
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    popup: 'small-popup',
                },
            });
        }
    };

    const handleNewTodoTitle = (event) => {
        setCreateTodo({
            ...createTodo,
            [event.target.name]: event.target.value
        });
    };

    const formSubmit = async () => {
        const formData = new FormData();
        formData.append("user", user_id);
        formData.append("title", createTodo.title);
        formData.append("completed", false);

        try {
            await api.post(`${baseUrl}/todo/${user_id}/`, formData);
            Swal.fire({
                title: "Todo Added",
                icon: "success",
                toast: true,
                timer: 2000,
                position: "top-right",
                timerProgressBar: true,
            });
            fetchTodos();
            setCreateTodo({ title: "", completed: "" });
        } catch (error) {
            console.log(error);
        }
    };

    const deleteTodo = async (todo_id) => {
        await api.delete(`${baseUrl}/todo-detail/${user_id}/${todo_id}/`);
        Swal.fire({
            title: "Todo Deleted",
            icon: "success",
            toast: true,
            timer: 2000,
            position: "top-right",
            timerProgressBar: true,
        });
        fetchTodos();
    };

    const markTodoAsComplete = async (todo_id) => {
        await api.patch(`${baseUrl}/todo-mark-as-completed/${user_id}/${todo_id}/`);
        Swal.fire({
            title: "Todo Completed",
            icon: "success",
            toast: true,
            timer: 2000,
            position: "top-right",
            timerProgressBar: true,
        });
        fetchTodos();
    };

    return (
        <div>
            <div className="container" style={{ marginTop: "150px", padding: "10px" }}>
                <div className="row justify-content-center align-items-center main-row">
                    <div className="col shadow main-col bg-white">
                        <div className="row bg-primary text-white p-2">
                            <div className="col">
                                <h4>To-Do List</h4>
                            </div>
                        </div>
                        <div className="row justify-content-between text-white p-2">
                            <div className="form-group flex-fill mb-2">
                                <input
                                    id="todo-input"
                                    name='title'
                                    onChange={handleNewTodoTitle}
                                    value={createTodo.title}
                                    type="text"
                                    className="form-control"
                                    placeholder='Write a todo...'
                                />
                            </div>
                            <button type="button" onClick={formSubmit} className="btn btn-primary mb-2 ml-2"> Add To-Do </button>
                        </div>
                        <div className="row" id="todo-container">
                            {todo.map((todo) => (
                                <div className="col col-12 p-2 todo-item" key={todo.id}>
                                    <div className="input-group">
                                        {todo.completed.toString() === "true" ? (
                                            <p className="form-control"><strike>{todo.title}</strike></p>
                                        ) : (
                                            <p className="form-control">{todo.title}</p>
                                        )}
                                        <div className="input-group-append">
                                            <button className="btn bg-success text-white ml-2" type="button" onClick={() => markTodoAsComplete(todo.id)}><i className='fas fa-check'></i></button>
                                            <button className="btn bg-danger text-white me-2 ms-2 ml-2" type="button" onClick={() => deleteTodo(todo.id)}><i className='fas fa-trash'></i></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Todo;
