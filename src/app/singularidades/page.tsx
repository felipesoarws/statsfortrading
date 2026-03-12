import { SingularidadesList } from "@/components/SingularidadesList";

export const dynamic = 'force-dynamic';

export default function Singularidades() {
  return (
    <div className="min-h-screen relative z-10 selection:bg-primary/30 p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase flex flex-col items-start gap-1">
            <span className="text-primary text-3xl">✨</span>
            <span>Singularidades</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Filtro Exclusivo</p>
        </div>
        <SingularidadesList />
      </div>
    </div>
  );
}
