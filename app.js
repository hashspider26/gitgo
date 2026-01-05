const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// cPanel typically sets PORT in environment
// Use PORT from environment (set by cPanel Node.js App) or default to 3000
const port = parseInt(process.env.PORT || process.env.NODE_PORT || '3000', 10);
const hostname = process.env.HOSTNAME || process.env.NODE_IP || '0.0.0.0';

// Set NODE_ENV to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

console.log(`Starting server on ${hostname}:${port}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Always run in production mode on cPanel
const app = next({ 
  dev: false,
  hostname,
  port,
  dir: __dirname
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please stop the existing process or use a different port.`);
      console.error('To find and kill the process using this port, run:');
      console.error(`  lsof -ti:${port} | xargs kill -9`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

