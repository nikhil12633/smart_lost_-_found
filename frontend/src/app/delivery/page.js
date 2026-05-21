'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthConfig } from '../../lib/api';

export default function DeliveryPage() {
  const [itemId, setItemId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [otp, setOtp] = useState('');
  const [verifyMode, setVerifyMode] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const createDelivery = async () => {
    if (!itemId || !ownerName || !address) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await api.post(
        '/api/delivery/create',
        {
          itemId,
          ownerName,
          address,
        },
        getAuthConfig()
      );

      setDelivery(response.data);
      setMessage('Delivery created. OTP sent to recipient.');
      setVerifyMode(true);
    } catch (error) {
      setMessage('Unable to create delivery. Please try again.');
    }
  };

  const verifyDelivery = async () => {
    if (!otp) {
      setMessage('Please enter the OTP');
      return;
    }

    try {
      const response = await api.post('/api/delivery/verify', {
        deliveryId: delivery._id,
        otp,
      });

      setMessage(response.data.message);
      setDelivery(response.data.delivery);
      setOtp('');
    } catch (error) {
      setMessage('Invalid OTP. Please try again.');
    }
  };

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="topbar-light">
          <button className="icon-button" onClick={() => router.back()} aria-label="Go back">
            {'<'}
          </button>
          <h1 className="text-center text-sm font-black">Delivery Confirmation</h1>
          <span />
        </div>

        <div className="screen-pad">
          {!verifyMode ? (
            <div className="space-y-4">
              <div>
                <label className="field-label" htmlFor="itemId">
                  Item ID
                </label>
                <input
                  id="itemId"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  type="text"
                  placeholder="LF2024TR1234"
                  className="field"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="ownerName">
                  Owner Name
                </label>
                <input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  type="text"
                  placeholder="Rahul Sharma"
                  className="field"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="address">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Pickup at station counter"
                  className="field min-h-[90px]"
                  rows={3}
                />
              </div>

              <button onClick={createDelivery} className="primary-btn">
                Dispatch Item
              </button>
            </div>
          ) : (
            <div className="flex min-h-[620px] flex-col">
              <div className="mt-8 text-center">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-lg bg-amber-100 text-4xl font-black text-emerald-700">
                  BOX
                </div>
                <p className="mt-8 text-lg leading-7 text-slate-800">
                  Enter OTP to confirm delivery
                  <br />
                  to the rightful owner
                </p>
              </div>

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="537219"
                className="sr-only"
              />
              <div className="otp-grid mt-8">
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

              <button onClick={verifyDelivery} className="primary-btn mt-7">
                Confirm Delivery
              </button>

              <div className="mt-10">
                <p className="field-label">Status</p>
                <p className="text-center text-lg font-black text-emerald-700">
                  {delivery?.status === 'delivered' ? 'Delivered' : delivery?.status || 'Pending'}
                </p>
              </div>

              <button
                onClick={() => {
                  setVerifyMode(false);
                  setDelivery(null);
                  setOtp('');
                  setItemId('');
                  setOwnerName('');
                  setAddress('');
                }}
                className="secondary-btn mt-auto"
              >
                Create New Delivery
              </button>
            </div>
          )}

          {message && <div className="mt-4 text-center text-sm text-slate-700">{message}</div>}
        </div>
      </section>
    </main>
  );
}

