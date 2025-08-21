import SignUpForm from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className=" w-full min-h-[80%] flex flex-col md:justify-center gap-5 md:gap-0 mt-10 md:mt-0 px-4 ">
      <h1 className="text-h4 text-center font-medium uppercase pt-5  ">
        Sign Up
      </h1>
      <div className="  ">
        <div className="w-full flex justify-center items-center gap-[18vw] max-w-7xl mx-auto">
          <div className="w-full max-w-md  md:py-8 px-2 md:px-10 select-none ">

            <SignUpForm />
          </div>

         
        </div>
      </div>
    </div>
  );
}
