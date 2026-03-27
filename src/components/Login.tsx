import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Lock, Mail } from 'lucide-react';

interface LoginProps {
  error?: string;
  notice?: string;
  noticeLink?: string;
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
}

export default function Login({ error, notice, noticeLink, onLogin, onGoToSignup, onGoToForgotPassword }: LoginProps) {
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await onLogin({ email, password });
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

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-20 flex flex-col items-center justify-center"
          >
            <div className="relative mb-8 h-24 w-24">
              <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 270deg, transparent 0%, rgba(3, 103, 133, 0.5) 100%)',
                    maskImage: 'radial-gradient(transparent 38%, black 42%)',
                    WebkitMaskImage: 'radial-gradient(transparent 38%, black 42%)',
                  }}
                />
              </motion.div>
            </div>

            <p className="text-xl font-bold tracking-wide text-primary">Entering Your Sanctuary...</p>
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[2rem] bg-surface-container-lowest p-10 shadow-xl"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-primary/20" />

            <div className="mb-10">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <div className="h-3 w-3 rounded-full bg-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">Serene Flow</span>
              </div>
              <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-on-surface">Welcome back</h1>
              <p className="font-medium text-on-surface-variant">Step back into your sanctuary of productivity.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <button type="button" onClick={onGoToForgotPassword} className="text-xs font-bold text-primary transition-colors hover:text-primary-dim">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-outline">
                    <Lock size={20} />
                  </div>
                  <input
                    className="h-14 w-full rounded-xl border-2 border-on-surface bg-surface-container pl-12 pr-4 font-medium outline-none transition-all placeholder:text-outline-variant focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${rememberMe ? 'border-primary bg-primary' : 'border-outline'}`}
                >
                  {rememberMe && <Check size={14} className="text-white" />}
                </button>
                <label className="cursor-pointer select-none text-sm font-medium text-on-surface-variant" onClick={() => setRememberMe(!rememberMe)}>
                  Keep me signed in
                </label>
              </div>

              {(error || notice) && (
                <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {error || notice}
                  {!error && noticeLink && (
                    <>
                      {' '}
                      <a href={noticeLink} className="font-bold underline underline-offset-4">
                        Open reset link
                      </a>
                    </>
                  )}
                </div>
              )}

              <button className="cta-gradient flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]" type="submit">
                Sign In
                <ArrowRight size={20} />
              </button>
            </form>

            <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
              New to the flow?{' '}
              <button onClick={onGoToSignup} className="font-bold text-primary transition-all hover:underline underline-offset-4">
                Create account
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
