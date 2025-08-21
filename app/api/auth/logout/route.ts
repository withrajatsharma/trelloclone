import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({
      success: true,
      message: "User logged out successfully.",
    },{status: 200});
  } catch (error) {
    console.error("[LOGOUT_API]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to logout. (error)",
      },{status: 500}
    );
  }
}
