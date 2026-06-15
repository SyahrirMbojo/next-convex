"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface User {
	_id: Id<"users">;
	email: string;
	name: string;
	image?: string | null;
}

interface AuthContextType {
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	register: (email: string, password: string, name: string) => Promise<void>;
	user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		 const storedUser = localStorage.getItem("blog_user");
		 const storedId = localStorage.getItem("blog_userId");
		 if (storedUser && storedId) {
				setUser({
				_id: storedId as Id<"users">,
				name: storedUser,
				email: "",
				});
			}
      setLoading(false);
	}, []);

	const loginAction = useAction(api.auth.login);
  	const registerMutation = useAction(api.auth.register);

	const login = async (email: string, password: string) => {
		const result = await loginAction({ email, password });
		setUser({
			_id: result.userId as Id<"users">,
			name: result.name,
			email: result.email,
		})
  
		localStorage.setItem("blog_user", result.name);
		localStorage.setItem("blog_userId", result.userId);
	};
	

	const register = async (email: string, password: string, name: string) => {
		await registerMutation({ email, password, name });
  		await login(email, password);
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("blog_user");
		localStorage.removeItem("blog_userId");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				logout,
				register,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}