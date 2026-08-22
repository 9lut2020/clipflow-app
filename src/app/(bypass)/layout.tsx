import { redirect } from "next/navigation";

export default async function BypassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
