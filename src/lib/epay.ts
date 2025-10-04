// 易支付 API 集成
// 使用 Web Crypto API（Edge Runtime 兼容）

export interface EpayConfig {
  pid: string;        // 商户ID
  key: string;        // 商户密钥
  apiUrl: string;     // API地址，如: https://pay.example.com
  notifyUrl: string;  // 异步通知地址
  returnUrl: string;  // 同步跳转地址
}

export interface CreateOrderParams {
  orderId: string;    // 商户订单号
  name: string;       // 商品名称
  money: string;      // 金额
  type: 'alipay' | 'wxpay' | 'qqpay';  // 支付方式
  device?: 'pc' | 'mobile';  // 设备类型
}

export interface EpayOrderResponse {
  code: number;
  msg: string;
  data?: {
    payurl: string;   // 支付链接
    qrcode?: string;  // 二维码链接
  };
}

// MD5 哈希函数（使用 Web Crypto API）
async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成签名
async function generateSign(params: Record<string, string>, key: string): Promise<string> {
  // 按键名排序
  const sortedKeys = Object.keys(params).sort();
  
  // 拼接字符串
  const signStr = sortedKeys
    .filter(k => params[k] !== '' && k !== 'sign' && k !== 'sign_type')
    .map(k => `${k}=${params[k]}`)
    .join('&') + key;
  
  // MD5加密
  return await md5(signStr);
}

// 验证签名
export async function verifySign(params: Record<string, string>, key: string): Promise<boolean> {
  const sign = params.sign;
  if (!sign) return false;
  
  const calculatedSign = await generateSign(params, key);
  return sign === calculatedSign;
}

// 创建支付订单
export async function createPayment(
  config: EpayConfig,
  orderParams: CreateOrderParams
): Promise<EpayOrderResponse> {
  const params: Record<string, string> = {
    pid: config.pid,
    type: orderParams.type,
    out_trade_no: orderParams.orderId,
    notify_url: config.notifyUrl,
    return_url: config.returnUrl,
    name: orderParams.name,
    money: orderParams.money,
    sitename: '天眼查委托查询平台',
  };

  if (orderParams.device) {
    params.device = orderParams.device;
  }

  // 生成签名
  params.sign = await generateSign(params, config.key);
  params.sign_type = 'MD5';

  try {
    // 发送请求到易支付
    const response = await fetch(`${config.apiUrl}/submit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    });

    const result = await response.json() as EpayOrderResponse;
    return result;
  } catch (error) {
    console.error('Epay create payment error:', error);
    throw new Error('Failed to create payment');
  }
}

// 查询订单状态
export async function queryOrder(
  config: EpayConfig,
  orderId: string
): Promise<any> {
  const params: Record<string, string> = {
    pid: config.pid,
    out_trade_no: orderId,
  };

  params.sign = await generateSign(params, config.key);
  params.sign_type = 'MD5';

  try {
    const response = await fetch(`${config.apiUrl}/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    });

    return await response.json();
  } catch (error) {
    console.error('Epay query order error:', error);
    throw new Error('Failed to query order');
  }
}
