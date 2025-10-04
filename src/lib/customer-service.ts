/**
 * 在线客服集成配置
 * 
 * 推荐使用第三方客服 SDK（完全兼容 Cloudflare Workers）：
 * 
 * 1. 美洽客服 (Meiqia)
 *    - 官网: https://meiqia.com/
 *    - 集成方式: JavaScript SDK
 *    - 在 layout.tsx 或 HTML 中添加以下代码：
 *    
 *    <script>
 *      (function(m, ei, q, i, a, j, s) {
 *        m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments) };
 *        j = ei.createElement(q);
 *        s = ei.getElementsByTagName(q)[0];
 *        j.async = true;
 *        j.charset = 'UTF-8';
 *        j.src = 'https://static.meiqia.com/widget/loader.js';
 *        s.parentNode.insertBefore(j, s);
 *      })(window, document, 'script', '_MEIQIA');
 *      _MEIQIA('entId', 'YOUR_MEIQIA_ENTID');
 *    </script>
 * 
 * 2. 智齿客服 (Sobot)
 *    - 官网: https://www.sobot.com/
 *    - 集成方式: JavaScript SDK
 *    
 * 3. 网易七鱼
 *    - 官网: https://qiyukf.com/
 *    - 集成方式: JavaScript SDK
 * 
 * 4. 自定义 WebSocket 客服（使用 Durable Objects）
 *    - 需要创建 Durable Object 来处理 WebSocket 连接
 *    - 参考: https://developers.cloudflare.com/durable-objects/
 */

export interface CustomerServiceConfig {
  provider: 'meiqia' | 'sobot' | 'qiyu' | 'custom';
  apiKey?: string;
  entId?: string;
  appId?: string;
}

// 获取客服配置
export function getCustomerServiceConfig(): CustomerServiceConfig {
  // 从环境变量读取配置
  return {
    provider: 'meiqia', // 默认使用美洽
    entId: process.env.MEIQIA_ENTID || '',
  };
}

// 生成客服 SDK 脚本
export function generateCustomerServiceScript(config: CustomerServiceConfig): string {
  switch (config.provider) {
    case 'meiqia':
      return `
        (function(m, ei, q, i, a, j, s) {
          m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments) };
          j = ei.createElement(q);
          s = ei.getElementsByTagName(q)[0];
          j.async = true;
          j.charset = 'UTF-8';
          j.src = 'https://static.meiqia.com/widget/loader.js';
          s.parentNode.insertBefore(j, s);
        })(window, document, 'script', '_MEIQIA');
        _MEIQIA('entId', '${config.entId}');
      `;
    
    case 'sobot':
      return `
        // 智齿客服 SDK
        // 请参考智齿官方文档配置
      `;
    
    case 'qiyu':
      return `
        // 网易七鱼 SDK
        // 请参考七鱼官方文档配置
      `;
    
    default:
      return '';
  }
}
