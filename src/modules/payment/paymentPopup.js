const PAYMENT_WINDOW_NAME = "gulfincart_secure_payment";
const PAYMENT_RETURN_EVENT = "gulfincart:tap-payment-return";

const notifyPaymentReturn = (tapId) => {
  const payload = {
    type: PAYMENT_RETURN_EVENT,
    tapId,
    createdAt: Date.now(),
  };

  try {
    window.localStorage.setItem(PAYMENT_RETURN_EVENT, JSON.stringify(payload));
  } catch {
    // Storage can be blocked by browser privacy settings.
  }

  try {
    const channel = new BroadcastChannel(PAYMENT_RETURN_EVENT);
    channel.postMessage(payload);
    channel.close();
  } catch {
    // BroadcastChannel is optional browser support.
  }
};

export const handleTapReturnInPaymentWindow = (tapId) => {
  if (!tapId || typeof window === "undefined") {
    return false;
  }

  if (window.name !== PAYMENT_WINDOW_NAME) {
    return false;
  }

  notifyPaymentReturn(tapId);
  window.setTimeout(() => window.close(), 250);

  return true;
};

export const subscribeTapPaymentReturn = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const seenTapIds = new Set();

  const handlePayload = (payload) => {
    const tapId = payload?.tapId;

    if (!tapId || seenTapIds.has(tapId)) {
      return;
    }

    seenTapIds.add(tapId);
    callback(tapId);
  };

  const handleStorage = (event) => {
    if (event.key !== PAYMENT_RETURN_EVENT || !event.newValue) {
      return;
    }

    try {
      handlePayload(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed cross-tab messages.
    }
  };

  let channel = null;

  try {
    channel = new BroadcastChannel(PAYMENT_RETURN_EVENT);
    channel.onmessage = (event) => handlePayload(event.data);
  } catch {
    channel = null;
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);

    if (channel) {
      channel.close();
    }
  };
};

export const openPaymentWindow = (url) => {
  if (!url || typeof window === "undefined") {
    return;
  }

  const width = 460;
  const height = 720;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "popup=yes",
    "resizable=yes",
    "scrollbars=yes",
    "toolbar=no",
    "menubar=no",
    "location=no",
    "status=no",
    "noopener=yes",
    "noreferrer=yes",
  ].join(",");

  window.open(url, PAYMENT_WINDOW_NAME, features)?.focus?.();
};
