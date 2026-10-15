import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-neutral-950">
      <section className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">DevSync</p>
        <h1 className="mt-4 text-5xl font-bold">404</h1>
        <p className="mt-3 text-lg font-semibold">We couldn’t find that page.</p>
        <p className="mt-2 text-neutral-600">The link may be out of date or the address may be incorrect.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 font-semibold text-white">Return home</Link>
      </section>
    </main>
  );
}
