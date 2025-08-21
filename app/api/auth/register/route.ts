import { User } from "@/models/User";
import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { fullName, email, password } = await req.json();
    const trimmedEmail = (email || "").trim();
    const trimmedFullName = (fullName || "").trim();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedFullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all the fields. (email, password, fullName)",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.exists({ email: trimmedEmail });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const createdUser = await User.create({
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    const token = await new SignJWT({
      id: createdUser._id.toString(),
      fullName: createdUser.fullName,
      email: createdUser.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(JWT_SECRET);

    const res = NextResponse.json({
      success: true,
      message: "Registration successful.",
      user: {
        id: createdUser._id.toString(),
        email: createdUser.email,
        fullName: createdUser.fullName,
      },
    },{status: 200});

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    console.error("[REGISTER_API] : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register. (error)",
      },
      { status: 500 }
    );
  }
}
