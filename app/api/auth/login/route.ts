import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectToDB } from "@/services/connectdb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { email, password } = await req.json();
    const trimmedEmail = (email || "").trim();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all the fields. (email, password)",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: trimmedEmail }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found. Please register first.",
        },
        { status: 404 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      trimmedPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password. Please try again.",
        },
        { status: 401 }
      );
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(JWT_SECRET);

    const res = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
      },
    },{status: 200});

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  } catch (error) {
    console.error("[LOGIN_API] : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to login. (error)",
      },
      { status: 500 }
    );
  }
}
