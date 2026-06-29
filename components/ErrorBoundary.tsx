'use client';

import React, { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props  { children: ReactNode; }
interface State  { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <span className="text-5xl opacity-30">⚡</span>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="max-w-md text-sm text-slate-400">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-xl bg-[#0d9488] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0f766e]"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
