import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';

interface SignupProps {
  error?: string;
  onSignup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  onBackToLogin: () => void;
}

export default function Signup({ error, onSignup, onBackToLogin }: SignupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await onSignup({ name, email, password });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="serene-gradient relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="fixed left-20 top-20 hidden opacity-10 lg:block">
        <h2 className="text-[120px] font-extrabold leading-none text-primary">FOCUS</h2>
      </div>
      <div className="fixed bottom-20 right-20 hidden rotate-90 opacity-5 lg:block">
        <h2 className="text-[80px] font-extrabold leading-none text-primary">CALM</h2>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[2rem] bg-surface-container-lowest p-10 shadow-xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-primary/20" />

        <div className="mb-10">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">Serene Flow</span>
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-on-surface">Create account</h1>
          <p className="font-medium text-on-surface-variant">Start your journey to a focused sanctuary.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-on-surface-variant" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
                <User size={20} />
              </div>
              <input
                className="h-14 w-full rounded-xl border-2 border-on-surface bg-surface-container pl-12 pr-4 font-medium outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
                id="name"
                placeholder="Your name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-on-surface-variant" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
                <Mail size={20} />
              </div>
              <input
                className="h-14 w-full rounded-xl border-2 border-on-surface bg-surface-container pl-12 pr-4 font-medium outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
                id="email"
                placeholder="name@flow.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-on-surface-variant" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
                <Lock size={20} />
              </div>
              <input
                className="h-14 w-full rounded-xl border-2 border-on-surface bg-surface-container pl-12 pr-4 font-medium outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
                id="password"
                placeholder="Create a password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          <button disabled={isLoading} className="cta-gradient flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70" type="submit">
            Create account
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
          Already have an account?{' '}
          <button onClick={onBackToLogin} className="font-bold text-primary transition-all hover:underline underline-offset-4">
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}
