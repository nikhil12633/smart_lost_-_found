'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveToken } from '../../lib/api';

export default function OTPPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const sendOTP = async () => {
    try {
      await api.post('/api/otp/send', { phone });
      alert('OTP sent to your phone.');
    } catch (error) {
      alert('Unable to send OTP. Please try again.');
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await api.post('/api/otp/verify', {
        phone,
        otp,
      });
      saveToken(response.data.token);
      router.push('/dashboard');
    } catch (error) {
      alert('Invalid or expired OTP.');
    }
  };

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="topbar-light">
          <button className="icon-button" onClick={() => router.back()} aria-label="Go back">
            {'<'}
          </button>
          <h1 className="text-center text-sm font-black">OTP Verification</h1>
          <span />
        </div>

        <div className="screen-pad flex min-h-[660px] flex-col">
          <div className="mx-auto mt-7 grid h-32 w-24 place-items-center rounded-xl border-4 border-emerald-900 bg-emerald-50">
            <div className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-black tracking-widest text-white">
              0039
            </div>
          </div>

          <div className="mt-7 text-center">
            <label className="text-sm text-slate-700" htmlFor="phone">
              Enter the OTP sent to
            </label>
            <input
              id="phone"
              type="text"
              placeholder="+91 98765 43210"
              className="mx-auto mt-1 block w-full border-0 bg-transparent text-center text-base font-bold outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button onClick={sendOTP} className="secondary-btn mt-4">
            Send OTP
          </button>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            aria-label="Enter OTP"
            className="sr-only"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <div className="otp-grid mt-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={otp[index] || ''}
                onChange={(e) => {
                  const chars = otp.padEnd(6, ' ').split('');
                  chars[index] = e.target.value.slice(-1);
                  setOtp(chars.join('').replace(/\s/g, ''));
                }}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-sm font-medium text-emerald-700">
            Resend OTP in 00:28
          </p>

          <div className="mt-auto">
            <button onClick={verifyOTP} className="primary-btn">
              Verify OTP
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
