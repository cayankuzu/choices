import { ParallelUniverseDesktop } from "@/components/game/parallel-universe-desktop";

type PageSearchParams = {
  branch?: string | string[];
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const branchId = Array.isArray(resolvedSearchParams.branch)
    ? resolvedSearchParams.branch[0] ?? null
    : resolvedSearchParams.branch ?? null;

  return (
    <ParallelUniverseDesktop initialBranchId={branchId} />
  );
}
