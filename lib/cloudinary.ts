export function toCloudinaryOGUrl(url: string): string {
  return url.replace(
    '/image/upload/',
    '/image/upload/w_1200,h_630,c_fill,q_100,f_png/'
  );
}
