"use server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(JWT_SECRET);

export default async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);

    return payload as {
      id: string;
      fullName: string;
      email: string;
    };
  } catch (err) {
    return null;
  }
};
