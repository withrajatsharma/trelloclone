import Button from "../components/Button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <main className="max-h-screen overflow-hidden px-4">
      <header className="select-none relative z-10">
        <nav className="px-0 sm:px-6 pb-2 md:pb-0 pt-4 xl:pt-5 flex items-center justify-between ">
          <Link
            aria-label="Back to Home"
            href="/"
            className="flex items-center gap-x-1 xl:gap-x-2"
          >
            <Image
              src={"/images/trello-logo.svg"}
              alt="Logo"
              width={50}
              height={50}
              className="w-32"
              priority
              loading="eager"
            />
          </Link>

          <div className="flex items-center gap-x-8">
            <Link
              prefetch={true}
              href="/auth/signup"
              className="font-medium hidden sm:block relative overflow-hidden group h-fit text-base xl:text-h6 text-super-dark-gray"
            >
              <span className="flex group-hover:-translate-y-5 group-hover:opacity-0 transition-all text-blue-400 duration-500">
                Sign Up
              </span>
              <span className="absolute inset-0 group-hover:translate-y-0 translate-y-5 xl:translate-y-8 text-blue-400 transition-all ease-in-out-circ duration-500 underline">
                Sign Up
              </span>
            </Link>
            <Button prefetch={true} href="/auth/login">
              Log In
            </Button>
          </div>
        </nav>
      </header>

      <section className="pt-10 md:pt-20 flex md:flex-row flex-col justify-between items-center md:px-10 ">
        <div className="flex flex-col gap-2 md:gap-10 md:w-[70%]">
          <h1 className=" text-h6 md:text-h1 md:w-[80%] font-bold leading-tight">
            Organize. Collaborate. Get Things Done
          </h1>
          <p className="md:w-[70%] md:text-h6 text-xs">
            A lightweight Trello-inspired Kanban app that helps you manage
            projects, track tasks, and collaborate in real time. Whether
            it&#39;s your personal to-do list or your team&#39;s big project,
            stay productive with simple boards, lists, and cards.
          </p>
        </div>
        <div className="">
          <Image
            src={"/images/home.svg"}
            alt="Decorative background image"
            width={600}
            height={600}
            priority
          />
        </div>
      </section>
    </main>
  );
};

export default page;
