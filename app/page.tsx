"use client";

import { useUser, useRedirectFunctions, useLogoutFunction } from "@propelauth/nextjs/client";
import KanbanBoard from "../components/KanbanBoard";
import "./globals.css";

const WelcomeMessage = () => {
    const { loading, user } = useUser();
    const { redirectToSignupPage, redirectToLoginPage, redirectToAccountPage } = useRedirectFunctions();
    const logoutFn = useLogoutFunction();

    if (loading) return <div className="text-center p-4 text-gray-500">Loading...</div>;

    if (user) {
        return (
            <div className="p-4 bg-white shadow-md rounded-lg w-auto mx-auto ">
                <nav className="flex justify-between items-center p-4 bg-slate-200 shadow-md">
                    <p className="text-xl font-semibold">Welcome <span className="text-blue-600">{user.email}</span>!</p>
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => redirectToAccountPage()} 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Account
                        </button>
                        <button 
                            onClick={logoutFn} 
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
                <div className="flex justify-center p-4 w-full overflow-x-auto">
                    <div className="max-w-5xl">
                        <KanbanBoard />
                    </div>
                 </div>
            </div>
        );
    } else {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-slate-200 shadow-md rounded-lg max-w-lg">
                    <p className="text-xl font-semibold mb-4">You are not logged in</p>
                    <div className="flex space-x-4 justify-center">
                        <button 
                            onClick={() => redirectToLoginPage()} 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 px-5"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => redirectToSignupPage()} 
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Signup
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

export default WelcomeMessage;
