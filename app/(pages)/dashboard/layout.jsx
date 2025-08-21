import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SearchInput from "@/components/SearchInput";

export default async function Layout({ children, searchParams }) {
  const params = await searchParams;
  const searchQuery = params?.search || "";

  return (
    <main className="h-screen overflow-hidden">
     

      {children}
    </main>
  );
}
