import { GameShell } from "@/components/game/game-shell";

type HomeProps = {
  searchParams: Promise<{ branch?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { branch } = await searchParams;
  const initialBranchId = Array.isArray(branch) ? branch[0] : branch;

  return <GameShell initialBranchId={initialBranchId ?? null} />;
}
