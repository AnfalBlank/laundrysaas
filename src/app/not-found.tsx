import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon3d";
import { WashingMachine3D } from "@/components/ui/laundry-icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 p-6 text-center">
      <Icon3D variant="cyan" size="xl" animate="float">
        <WashingMachine3D className="w-12 h-12" />
      </Icon3D>
      <h1 className="text-3xl font-bold text-slate-900 mt-6">404</h1>
      <p className="text-slate-500 mt-1">Halaman tidak ditemukan</p>
      <Link href="/" className="mt-6">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
