import { Form, useActionData, useRouteLoaderData, useLoaderData, redirect, useNavigate, Link, useNavigation } from 'react-router';
import type { ActionFunction, LoaderFunctionArgs } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import '../styles/password.css';

export function EnterStoreButton({ canEnterStore }: Props) {
  if (canEnterStore) {
    return (
      <Link to="/" className="btn">
        Enter Store
      </Link>
    );
  }

  return (
    <button type="submit" className="btn">
      Enter Store
    </button>
  );
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { session } = context;
  const isLoggedIn = (await session.get('passwordAllowed')) === true;
  return { isLoggedIn };
}

export const action: ActionFunction = async ({ request, context }) => {
  const { session, env } = context;
  const formData = await request.formData();
  const _action = formData.get('_action');
  const passwordAttempt = formData.get('password') as string;
  const correctPassword = env.PUBLIC_STORE_PASSWORD;

  // Short session duration in seconds
  const SHORT_SESSION_MAX_AGE = 15 * 60; // 15 minutes

  if (_action === 'logout') {
    session.unset('passwordAllowed');
    const cookie = await session.commit({ maxAge: SHORT_SESSION_MAX_AGE });

    return redirect('/', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  }


  if (passwordAttempt === correctPassword) {
    session.set('passwordAllowed', true);

    // Commit with short expiration
    const cookie = await session.commit({ maxAge: SHORT_SESSION_MAX_AGE });

    return redirect('/', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  }

  return { error: 'Incorrect password, try again.', timestamp: Date.now() };
};

const CountdownTimer = ({
  endDate,
  endTime,
  period,
  digitsFontSize = 'heading-x-large',
  textFontSize = 'body-small',
  endMessage = '',
  hideOnComplete = false,
  animationOrder = 1,
  animationAnchor = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const parseExpirationDate = useCallback(() => {
    const [hoursStr, minutesStr] = endTime.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (period.toLowerCase() === 'am') {
      if (hours === 12) hours = 0;
    } else if (period.toLowerCase() === 'pm') {
      if (hours !== 12) hours += 12;
    }

    const expiry = new Date(endDate);
    expiry.setHours(hours, minutes, 0, 0);
    return expiry.getTime();
  }, [endTime, endDate, period]);

  useEffect(() => {
    const targetTime = parseExpirationDate();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: '00', hours: '00', minutes: '00', seconds: '00' };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const format = (num) => String(num).padStart(2, '0');

      return {
        days: format(days),
        hours: format(hours),
        minutes: format(minutes),
        seconds: format(seconds)
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [parseExpirationDate]);

  if (hideOnComplete && isExpired) return null;
  if (!timeLeft) return null;

  const showAnimations = !!animationAnchor;
  const finalAnchor = animationAnchor || `Countdown--timer`;

  const renderUnit = (value, label, orderOffset) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '10px 5px',
        flex: '1',
        minWidth: '65px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
      {...(showAnimations && {
        'data-aos': 'hero',
        'data-aos-anchor': finalAnchor,
        'data-aos-order': animationOrder + orderOffset
      })}
    >
      <strong
        style={{
          display: 'block',
          fontSize: `var(--font-${digitsFontSize}, 2rem)`,
          lineHeight: '1',
          marginBottom: '4px',
          color: '#1a1a1a'
        }}
      >
        {value}
      </strong>
      <small
        style={{
          fontSize: `var(--font-${textFontSize}, 0.75rem)`,
          textTransform: 'uppercase',
          color: '#757575',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </small>
    </div>
  );

  return (
    <div style={{ width: '100%', margin: '20px 0' }}>
      {!isExpired ? (
        <time style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {renderUnit(timeLeft.days, 'Days', 1)}
          {renderUnit(timeLeft.hours, 'Hours', 2)}
          {renderUnit(timeLeft.minutes, 'Mins', 3)}
          {renderUnit(timeLeft.seconds, 'Secs', 4)}
        </time>
      ) : (
        !hideOnComplete && endMessage && (
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{endMessage}</div>
        )
      )}
    </div>
  );
};

export default function PasswordPage() {
  const loaderData = useRouteLoaderData('root');
  const { isLoggedIn } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string, timestamp?: number }>();
  const navigation = useNavigation();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const navigate = useNavigate();

  const isSubmitting = navigation.state === 'submitting';
  const canEnterStore = isLoggedIn === true;

  const handleSubmit = (e: React.FormEvent) => {
    if (canEnterStore) {
      e.preventDefault();
      navigate('/');
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      setErrorVisible(true);
      const timeout = setTimeout(() => setErrorVisible(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [actionData?.timestamp]);

  return (
    <div className="password-page min-h-screen flex flex-col items-center justify-center bg-[#1a1a1a] p-6">
      <div className="fireworks-background"></div>

      {/* Drawing Area - Phase 2 placeholder */}
      <div className="w-full max-w-[480px] aspect-[24/18] border border-gray-300 rounded-lg mx-auto mb-8 flex items-center justify-center bg-white">
        <span className="text-lg font-bold text-black">buyflorabella</span>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100">

        <div className={`flower-orbit transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`flower flower-${i + 1}`}>🌸</div>
          ))}
        </div>

        <CountdownTimer
          endDate='02/06/2026'
          endTime='19:00'
          period='am'
          digitsFontSize='heading-large'
        />

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoggedIn ? 'Access Granted' : 'Store Locked'}
          </h1>

          <div className={`mt-3 p-3 rounded-xl border ${isLoggedIn ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
            <p className={`${isLoggedIn ? 'text-green-700' : 'text-yellow-700'} font-semibold text-sm`}>
              {isLoggedIn ? 'Store is currently unlocked' : 'Store is locked — enter password below'}
            </p>
          </div>
        </div>

        <Form method="post" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLoggedIn && (
            <>
              <p className="text-green-700 font-bold text-center text-sm">
                Enter the store password below:
              </p>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  autoFocus
                  required
                  className="password-input-black p-4 w-full border-4 border-[#7cb342] rounded-xl bg-black text-white outline-none placeholder:text-gray-500 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-[#7cb342] hover:text-white transition-colors"
                >
                  {showPassword ? 'Hide 👁️' : 'Show 👁️‍🗨️'}
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#a5d6a7' : '#7cb342',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.8 : 1,
              transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
            className="text-white p-4 rounded-xl font-bold hover:bg-[#6fa32d]"
          >
            {isSubmitting ? 'Validating...' : isLoggedIn ? 'Enter Store' : 'Unlock Store'}
          </button>

          {actionData?.error && errorVisible && (
            <div className="p-3 border rounded-lg border-red-100 bg-red-50 text-red-600 text-sm text-center font-medium transition-opacity duration-500">
              {actionData.error}
            </div>
          )}
        </Form>

        {isLoggedIn && (
          <Form method="post" action="/password2" className="mt-6 text-center">
            <input type="hidden" name="_action" value="logout" />
            <button
              type="submit"
              className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Lock store again (Logout)
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
