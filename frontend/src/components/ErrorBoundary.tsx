import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Unexpected application rendering error', error, info);
  }

  private retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main role="alert" className="flex min-h-screen items-center justify-center bg-white px-6 text-neutral-950">
        <section className="max-w-lg text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">DevSync</p>
          <h1 className="mt-4 text-3xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-neutral-600">The page hit an unexpected problem. Try again or return to the homepage.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={this.retry} className="rounded-full bg-black px-5 py-3 font-semibold text-white">Try again</button>
            <Link to="/" className="rounded-full border border-neutral-300 px-5 py-3 font-semibold">Go home</Link>
          </div>
        </section>
      </main>
    );
  }
}
