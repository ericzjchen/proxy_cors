// Cloudflare Worker - Yahoo Finance CORS Proxy
// 部署網址: https://yahoo-finance-proxy.您的用戶名.workers.dev

export default {
  async fetch(request) {
    // 處理CORS預檢請求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // 驗證參數
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ 
          chart: { 
            error: { 
              description: 'Missing ?url= parameter' 
            } 
          } 
        }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 只允許Yahoo Finance
    if (!targetUrl.includes('query1.finance.yahoo.com')) {
      return new Response(
        JSON.stringify({ 
          chart: { 
            error: { 
              description: 'Only Yahoo Finance URLs are allowed' 
            } 
          } 
        }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      // 轉發請求到Yahoo Finance
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      // 返回數據並添加CORS頭
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // 5分鐘緩存
          'X-Proxy-By': 'Cloudflare-Worker',
        },
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ 
          chart: { 
            error: { 
              description: error.message 
            } 
          } 
        }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
}