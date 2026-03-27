import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { axios, setToken } = useAppContext()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = state === "login" ? '/api/user/login' : '/api/user/register'

        try {
            const { data } = await axios.post(url, { name, email, password })
            if (data.success) {
                setToken(data.token)
                localStorage.setItem('token', data.token)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="glass-input flex flex-col gap-5 m-auto items-start p-8 py-12 w-80 sm:w-[370px] rounded-3xl shadow-2xl"
        >
            <p className="text-2xl font-semibold m-auto glass-text">
                <span className="text-indigo-500 dark:text-indigo-400">User</span>{" "}
                {state === "login" ? "Login" : "Sign Up"}
            </p>

            {state === "register" && (
                <div className="w-full">
                    <p className="text-sm mb-1 glass-text-muted">Name</p>
                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder="Your name"
                        className="glass-input rounded-xl w-full p-2.5 text-sm glass-text placeholder:opacity-90 placeholder:font-semibold outline-none"
                        type="text"
                        required
                    />
                </div>
            )}

            <div className="w-full">
                <p className="text-sm mb-1 glass-text-muted">Email</p>
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="you@example.com"
                    className="glass-input rounded-xl w-full p-2.5 text-sm glass-text placeholder:opacity-40 outline-none"
                    type="email"
                    required
                />
            </div>

            <div className="w-full">
                <p className="text-sm mb-1 glass-text-muted">Password</p>
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="••••••••"
                    className="glass-input rounded-xl w-full p-2.5 text-sm glass-text placeholder:opacity-40 outline-none"
                    type="password"
                    required
                />
            </div>

            {state === "register" ? (
                <p className="text-sm glass-text-muted">
                    Already have account?{" "}
                    <span
                        onClick={() => setState("login")}
                        className="text-indigo-500 dark:text-indigo-400 font-medium cursor-pointer hover:underline"
                    >
                        click here
                    </span>
                </p>
            ) : (
                <p className="text-sm glass-text-muted">
                    Create an account?{" "}
                    <span
                        onClick={() => setState("register")}
                        className="text-indigo-500 dark:text-indigo-400 font-medium cursor-pointer hover:underline"
                    >
                        click here
                    </span>
                </p>
            )}

            <button type='submit' className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 active:scale-95 shadow-[0_4px_20px_rgba(139,92,246,0.4)] flex justify-center items-center transition-all text-white w-full py-2.5 rounded-xl cursor-pointer font-medium tracking-wide">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
    );
}

export default Login