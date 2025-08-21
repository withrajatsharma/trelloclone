import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SearchInput from "@/components/SearchInput";

export default async function Layout({ children, searchParams }) {
  const params = await searchParams;
  const searchQuery = params?.search || "";

  return (
    <>
      <header className="select-none px-4">
        <nav className="px-0 sm:px-6 pb-2 md:pb-0 pt-4 xl:pt-7 flex items-center justify-between">
          <Link
            aria-label="Back to Home"
            href="/"
            className="flex items-center gap-x-1 xl:gap-x-2"
          >
            <Image
              src={"/images/trello-logo.svg"}
              alt="Docket AI Logo"
              width={50}
              height={50}
              className="w-32"
              priority
              loading="eager"
            />
          </Link>

          <SearchInput initialValue={searchQuery} className="w-fit" />

          <LogoutButton />
        </nav>
      </header>

      {children}
    </>
  );
}
