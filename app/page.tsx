import { connection } from "next/server";
import { getAllStats, getPrograms } from "./lib/data";
import HomeUI from "./ui/home";

export default async function Home() {
  await connection();
  const stats = await getAllStats();
  const programs = await getPrograms();

  return <HomeUI stats={stats} programs={programs} />;
}
