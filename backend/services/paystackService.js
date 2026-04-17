const PAYSTACK_BASE_URL = "https://api.paystack.co";

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const initializePayment = async ({ email, amount, metadata, callbackUrl }) => {
  const secretKey = requireEnv("PAYSTACK_SECRET_KEY");

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      currency: "GHS",
      metadata,
      callback_url: callbackUrl,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message || `Paystack initialization failed with status ${response.status}`;
    console.error("Paystack api error:", message, payload);
    throw new Error(message);
  }

  if (!payload?.status || !payload?.data?.authorization_url || !payload?.data?.reference) {
    throw new Error("Unexpected Paystack response.");
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
  };
};

