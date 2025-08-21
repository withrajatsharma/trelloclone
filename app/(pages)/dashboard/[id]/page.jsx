import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import KanbanBoard from "@/components/KanbanBoard";

const page = ({ params }) => {
  const { id } = params;

  if (!id) {
    return notFound();
  }

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

          <LogoutButton />
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        <KanbanBoard boardId={id} />
      </main>
    </>
  );
};

export default page;
