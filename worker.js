// 1. 在GitHub創建一個新倉庫，新建 worker.js
// 2. 複製這段代碼（專門為Yahoo Finance優化）
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl || !targetUrl.includes('query1.finance.yahoo.com')) {
      return new Response('請提供有效的Yahoo Finance URL', { status: 400 });
    }
    
    const response = await fetch(targetUrl);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
}