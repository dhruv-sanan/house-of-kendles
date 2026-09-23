// app/api/login/route.ts
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";

// ✅ HARDCODED credentials (bypass env variable parsing issues)
const ADMIN_USERNAME = "admin";
const ADMIN_HASH = "$2b$12$6hvpGdGikepllWAFfoeWcOKYmpifkKhyNAcoxsRwD1YYvZZ8ulCYq";
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  console.log("\n--- [API Route Login Check] ---");
  console.log(`Username configured: ${ADMIN_USERNAME}`);
  console.log(`Hash configured: ${ADMIN_HASH.substring(0, 10)}...`);
  console.log(`JWT Secret configured: ${JWT_SECRET ? JWT_SECRET.substring(0, 10) : "MISSING"}...`);
  console.log("-----------------------------\n");

  if (!ADMIN_USERNAME || !ADMIN_HASH || !JWT_SECRET) {
    console.error("Missing credentials");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { username, password } = await request.json();

    console.log(`Login attempt for username: ${username}`);

    const isUsernameMatch = username === ADMIN_USERNAME;
    console.log(`Username match: ${isUsernameMatch}`);

    const isPasswordMatch = await compare(password, ADMIN_HASH);
    console.log(`Password match: ${isPasswordMatch}`);

    if (!isUsernameMatch || !isPasswordMatch) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = sign({ username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: "8h" });
    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}