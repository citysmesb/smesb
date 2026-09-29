import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'save-map-data',
      configureServer(server) {
        // Middleware to handle JSON POST requests
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                // Ensure public directory exists
                const publicDir = path.resolve(__dirname, 'public');
                if (!fs.existsSync(publicDir)) {
                  fs.mkdirSync(publicDir);
                }

                // Write the JSON data to public/saved_map_data.json
                const filePath = path.join(publicDir, 'saved_map_data.json');
                fs.writeFileSync(filePath, body, 'utf-8');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'Data saved successfully.' }));
              } catch (error) {
                console.error('Failed to write data:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Failed to write data.' }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
});
