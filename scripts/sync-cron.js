#!/usr/bin/env node

/**
 * Cron script for syncing Codeforces data
 * This script can be run locally or via GitHub Actions
 */

const https = require('https');
const url = require('url');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SYNC_API_KEY = process.env.SYNC_API_KEY || '';

async function syncData() {
  console.log('Starting Codeforces data sync...');
  
  const apiUrl = `${APP_URL}/api/sync/all`;
  const parsedUrl = url.parse(apiUrl);
  
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SYNC_API_KEY}`,
    },
  };

  const requestModule = parsedUrl.protocol === 'https:' ? https : require('http');

  return new Promise((resolve, reject) => {
    const req = requestModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Sync completed:', result);
          resolve(result);
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.end();
  });
}

// Run the sync
syncData()
  .then((result) => {
    console.log('✅ Sync successful:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });