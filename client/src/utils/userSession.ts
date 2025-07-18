// Centralized user identification system for data isolation
export const generateDeviceFingerprint = (): string => {
  const existing = localStorage.getItem('deviceFingerprint');
  if (existing) {
    return existing;
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    Math.random().toString(36),
    Date.now().toString()
  ].join('|');
  
  // Create a simple hash of the fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const deviceId = Math.abs(hash).toString(36);
  localStorage.setItem('deviceFingerprint', deviceId);
  return deviceId;
};

export const getCurrentUserId = (): number => {
  const fingerprint = generateDeviceFingerprint();
  // Hash the fingerprint to get consistent user ID (same logic as backend)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 1000000);
};

export const getDeviceHeaders = () => {
  const fingerprint = generateDeviceFingerprint();
  return {
    'X-Device-Fingerprint': fingerprint,
    'X-Session-Id': `session_${fingerprint}_${Date.now()}`
  };
};