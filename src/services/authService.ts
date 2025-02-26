import { UserData } from "@/types/types";
import { SignInResponse } from "next-auth/react";

export const sendVerification = async (
	user: UserData,
): Promise<SignInResponse> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}auth/verify-code-signup`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				accept: "*/*",
			},
			body: JSON.stringify({ email: user.email, code: user.code }),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return response.json();
};

export const signUp = async (
	user: UserData,
): Promise<{ message: string; next: string }> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}auth/signup`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				accept: "*/*",
			},
			body: JSON.stringify(user),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return response.json();
};

export const resendVerification = async (
	user: UserData,
): Promise<{ message: string; next: string }> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}auth/send-verification`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				accept: "*/*",
			},
			body: JSON.stringify(user),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return response.json();
};
