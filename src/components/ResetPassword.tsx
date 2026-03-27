import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';

interface ResetPasswordProps {
  error?: string;
  notice?: string;
  token: string;
  onResetPassword: (payload: { token: string; password: string }) => Promise<void>;
  onBackToLogin: () => void;
}

export default function ResetPassword({ error, notice, token, onResetPassword, onBackToLogin }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      await onResetPassword({ token, password });
    } finally {
      setIsLoading(false);
    }
  }

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="serene-gradient relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="fixed left-20 top-20 hidden opacity-10 lg:block">
        <h2 className="text-[120px] font-extrabold leading-none text-primary">RESET</h2>
      </div>
      <div className="fixed bottom-20 right-20 hidden rotate-90 opacity-5 lg:block">
        <h2 className="text-[80px] font-extrabold leading-none text-primary">FLOW</h2>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[2rem] bg-surface-container-lowest p-10 shadow-xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-primary/20" />

        <div className="mb-10">
          <button onClick={onBackToLogin} className="mb-6 flex items-center gap-2 text-sm font-bold text-primary transition-transform hover:-translate-x-1">
            <ArrowLeft size={16} />
            Back to login
          </button>
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">Serene Flow</span>
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-on-surface">Reset password</h1>
          <p className="font-medium text-on-surface-variant">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-on-surface-variant" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
                <Lock size={20} />
              </div>
              <input
                className="h-14 w-full rounded-xl border-2 border-on-surface bg-surface-container pl-12 pr-4 font-medium outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
                id="password"
                placeholder="Create a new password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-on-surface-variant" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
                <Lock size={20} />
              </div>
              <input
                className="h-14 w-full rounded-xl border-2 border-on-surface bg-surface-container pl-12 pr-4 font-medium outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
                id="confirm-password"
                placeholder="Repeat your new password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          {(error || notice || mismatch) && (
            <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error || mismatch ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {mismatch ? 'The two passwords must match.' : error || notice}
            </div>
          )}

          <button disabled={isLoading || mismatch} className="cta-gradient flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70" type="submit">
            Save new password
            <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
