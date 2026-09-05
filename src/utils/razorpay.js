// Dynamically load Razorpay checkout script on-demand
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const processRazorpayPayment = async ({
  orderId,
  amount,
  userName = 'Valued Customer',
  userEmail = 'customer@example.com',
  userPhone = '9999999999',
  onSuccess,
  onFailure,
}) => {
  const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // Ensure Razorpay SDK is loaded on-demand
  const scriptLoaded = await loadRazorpayScript();

  if (scriptLoaded && rzpKey && typeof window !== 'undefined' && window.Razorpay) {
    const options = {
      key: rzpKey,
      amount: Math.round(amount * 100), // amount in paisa
      currency: 'INR',
      name: 'A_S Commerce',
      description: `Payment for Order #${orderId}`,
      image: '/logo.png',
      handler: async function (response) {
        // Verify payment signature on backend if endpoint is reachable
        try {
          const verification = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('as_commerce_token') || ''}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verificationData = await verification.json();
          if (!verification.ok || !verificationData.success) {
            if (onFailure) onFailure({ reason: verificationData.message || 'Payment verification failed' });
            return;
          }
        } catch (e) {
          if (onFailure) onFailure({ reason: 'Payment verification service unavailable' });
          return;
        }

        await onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id || orderId,
          signature: response.razorpay_signature,
          mode: 'Razorpay Verified Gateway',
        });
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      theme: {
        color: '#061A27',
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure({ reason: 'Payment modal closed by user' });
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        if (onFailure) {
          onFailure({
            code: response.error?.code,
            description: response.error?.description,
            source: response.error?.source,
            step: response.error?.step,
            reason: response.error?.reason,
          });
        }
      });
      rzp.open();
      return { isRealGateway: true };
    } catch (err) {
      console.warn('Direct Razorpay checkout error', err);
      if (onFailure) onFailure({ reason: 'Payment gateway could not be opened' });
      return { isRealGateway: false };
    }
  }

  if (onFailure) onFailure({ reason: 'Payment gateway is unavailable' });
  return { isRealGateway: false };
};

