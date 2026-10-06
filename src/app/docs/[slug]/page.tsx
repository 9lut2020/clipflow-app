import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { docs, findDoc } from "../_content/registry";

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = findDoc((await params).slug);
  return doc ? { title: doc.title, description: doc.description } : {};
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = findDoc(slug);
  if (!doc) notFound();

  const index = docs.indexOf(doc);
  const prev = docs[index - 1];
  const next = docs[index + 1];
  const Body = doc.Body;

  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-3xl flex-1">
        <nav className="mb-3 text-[13px] text-slate-500">
          <Link href="/docs" className="hover:text-blue-700">คู่มือ</Link> <span className="mx-1">/</span> {doc.group}
        </nav>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{doc.title}</h1>
        <p className="mt-2 text-[16px] text-slate-500">{doc.description}</p>
        <div className="mt-6">
          <Body />
        </div>

        <div className="mt-14 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="group rounded-xl border border-slate-200 p-4 hover:border-blue-300">
              <div className="flex items-center gap-1 text-[12px] text-slate-500"><ChevronLeft size={14} /> ก่อนหน้า</div>
              <div className="mt-1 font-semibold text-slate-800 group-hover:text-blue-700">{prev.title}</div>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/docs/${next.slug}`} className="group rounded-xl border border-slate-200 p-4 text-right hover:border-blue-300">
              <div className="flex items-center justify-end gap-1 text-[12px] text-slate-500">ถัดไป <ChevronRight size={14} /></div>
              <div className="mt-1 font-semibold text-slate-800 group-hover:text-blue-700">{next.title}</div>
            </Link>
          )}
        </div>
      </article>

      {doc.toc.length > 0 && (
        <aside className="hidden xl:block w-52 shrink-0">
          <div className="sticky top-20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ในหน้านี้</div>
            <ul className="mt-3 space-y-2 border-l border-slate-200">
              {doc.toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="-ml-px block border-l border-transparent pl-3 text-[13px] text-slate-600 hover:border-blue-500 hover:text-blue-700">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
