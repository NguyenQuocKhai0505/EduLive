import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
          404 Not Found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Not Found This Page
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          Link you are trying to access does not exist or has been changed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-purple-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Home Page
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900"
          >
            View Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
