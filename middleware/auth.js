// middleware/auth.js

// Your allowed IP addresses - Add your specific IPs here
const ALLOWED_IPS = [
  "127.0.0.1", // Localhost
  "::1", // Localhost IPv6
  "::ffff:127.0.0.1", // Localhost IPv6 mapped
  "192.168.39.195",
  // Example: '192.168.1.100',
  // Example: '41.58.123.45',
];

// Function to get client IP
function getClientIP(req) {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  );
}

// Middleware to check IP whitelist
function checkIPWhitelist(req, res, next) {
  const clientIP = getClientIP(req);

  console.log("Client IP:", clientIP); // For debugging

  // Check if IP is in whitelist
  const isAllowed = ALLOWED_IPS.some((allowedIP) => {
    return (
      clientIP === allowedIP ||
      clientIP.includes(allowedIP) ||
      allowedIP.includes(clientIP)
    );
  });

  if (!isAllowed) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Denied</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
          }
          .error-box {
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          .error-box i {
            font-size: 4em;
            color: #dc3545;
            margin-bottom: 20px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; }
          code { 
            background: #f8f9fa; 
            padding: 5px 10px; 
            border-radius: 5px;
            color: #dc3545;
          }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      </head>
      <body>
        <div class="error-box">
          <i class="fas fa-ban"></i>
          <h1>Access Denied</h1>
          <p>Your IP address is not authorized to access this resource.</p>
          <p>Your IP: <code>${clientIP}</code></p>
        </div>
      </body>
      </html>
    `);
  }

  next();
}

// Function to get today's date in DD/MM/YYYY format
function getTodayDateString() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

// Middleware to check if user is authenticated with date password
function requireAuth(req, res, next) {
  // Check if user has valid session
  if (req.session && req.session.authenticated) {
    return next();
  }

  // Redirect to login page
  res.redirect("/admin/login");
}

// Verify date password
function verifyDatePassword(inputDate) {
  const todayDate = getTodayDateString();
  return inputDate === todayDate;
}

module.exports = {
  checkIPWhitelist,
  requireAuth,
  verifyDatePassword,
  getTodayDateString,
  getClientIP,
};
