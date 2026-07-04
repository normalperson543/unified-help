import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 p-12 w-full h-full">
      <div className="flex flex-col justify-center text-center bg-accent-background gap-4">
        <h2 className="text-6xl">unified<b>help</b></h2>
        <p>All your Hack Club support tickets, under one roof.</p>
      </div>
    </div>
  );
}
