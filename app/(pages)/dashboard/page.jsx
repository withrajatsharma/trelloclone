import Button from "@/components/Button";
import { ChevronRight, Edit, FolderKanban, Kanban, Plus } from "lucide-react";
import React, { lazy, Suspense } from "react";

import Sidebar from "@/components/Sidebar";
import WorkSpaceMain from "@/components/WorkSpaceMain";

// // for checking suspense
// const WorkSpaceMain = lazy(
//   () =>
//     new Promise((resolve) =>
//       setTimeout(() => {
//         import("@/components/WorkSpaceMain").then((module) =>
//           resolve({ default: module.default })
//         );
//       }, 4000)
//     )
// );

import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SearchInput from "@/components/SearchInput";

const page = async ({ searchParams }) => {
  const params = await searchParams;
  const searchQuery = params?.search || "";
  const tab = params?.tab || "";

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

      {searchQuery ? (
        

        <Suspense
          fallback={
            <section className="mt-20 w-full">
              <div
                className={
                  "grid gap-4 transition-all duration-300 grid-cols-3 px-8 md:grid-cols-4 xl:grid-cols-5 w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
                }
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-gray-100 h-32 gap-4 p-4 rounded-lg animate-pulse  "
                  >
                    <div className="flex items-center justify-center h-full"></div>
                  </div>
                ))}
              </div>
            </section>
          }
        >
          <WorkSpaceMain searchParams={searchParams} />
        </Suspense>
      ) : (
        <main className="w-full flex items-start pt-5 md:px-8 gap-10 ">
          <Suspense
            fallback={
              <aside className="w-[30%] border-t-2 mt-10 px-2">
                <Button className="my-4">Add Workspace</Button>

                {Array.from({ length: 8 }).map((_, i) => {
                  return (
                    <div key={i} className="mb-3 animate-pulse">
                      <button className="flex items-center justify-between w-full font-semibold p-2 rounded hover:bg-gray-100 hover:pl-5 transition-all">
                        <div className="flex items-center gap-2 leading-none">
                          <FolderKanban />
                          <span>Loading...</span>
                        </div>

                        <ChevronRight size={18} />
                      </button>
                    </div>
                  );
                })}
              </aside>
            }
          >
            <Sidebar />
          </Suspense>

          <Suspense
            fallback={
              <section className=" w-[70%]  ">
                <div className="flex justify-between items-center w-full gap-5">
                  <div className="flex items-center gap-5 pl-10 relative w-fit pb-10 animate-pulse">
                    <FolderKanban size={50} />
                    <h1 className="text-h2  ">Loading...</h1>
                  </div>
                </div>

                {tab === "members" ? (
                  <div
                    className={
                      " w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar flex flex-col gap-4"
                    }
                  >
                    {Array.from({ length: 5 }).map((member, i) => (
                      <div
                        key={i}
                        className="flex animate-pulse flex-col  h-10 gap-4 p-4 rounded-lg bg-gray-100 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between h-full">
                          <p>Loading...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={
                      "grid gap-4 transition-all duration-300 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
                    }
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col bg-gray-100 h-32 gap-4 p-4 rounded-lg animate-pulse  "
                      >
                        <div className="flex items-center justify-center h-full"></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            }
          >
            <WorkSpaceMain searchParams={searchParams} />
          </Suspense>
        </main>
      )}
    </>
  );
};

export default page;
