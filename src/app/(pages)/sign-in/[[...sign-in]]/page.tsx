import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black">
      <SignIn />
    </div>
  );
}
