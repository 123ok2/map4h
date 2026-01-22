
export async function getUserIdentity(): Promise<string> {
  let ip = 'unknown';
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ip = data.ip;
  } catch (e) {
    console.warn("Could not fetch IP, falling back to fingerprint only.");
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.indexedDB,
    !!window.sessionStorage
  ].join('|');

  // Tạo một hash đơn giản từ chuỗi fingerprint + ip
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint + ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
