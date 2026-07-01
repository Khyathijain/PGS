import { useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleLogin = async () => {

    try {

        const response = await api.post(
            "/users/login",
            {
                email,
                password
            }
        );

        localStorage.setItem(
            "token",
            response.data.access_token
        );

        console.log("Token Saved!");

        navigate("/dashboard");

    } catch (error) {

        console.log(error);

    }

};
    useEffect(() => {

        const token = localStorage.getItem("token");

        if (token) {

            navigate("/dashboard");

        }

    }, [navigate]);

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded shadow w-96">

                <h1 className="text-3xl font-bold mb-6">

                    Login

                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full mb-4"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full mb-4"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="bg-blue-600 text-white p-2 rounded w-full"
            >
                    Login
                </button>

            </div>

        </div>

    );

}

export default Login;