import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import PageBackground from '../componentsMockup2/components/PageBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      //console.log('Password reset request for:', email);

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20 overflow-hidden">
        <PageBackground />

        <div className="relative z-10 max-w-md mx-auto px-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#7cb342] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {!submitted ? (
            <div className="glass border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#7cb342]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#7cb342]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Forgot Password?
                </h1>
                <p className="text-white/70">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white mb-2 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#7cb342] transition-colors bg-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="text-white/60 hover:text-[#7cb342] transition-colors text-sm"
                >
                  Don't have an account? Sign up
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass border border-white/10 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#7cb342]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#7cb342]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  Check Your Email
                </h1>
                <p className="text-white/70 mb-6">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-white/60 text-sm mb-8">
                  The link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
