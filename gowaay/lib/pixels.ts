import { env } from './env';

// Facebook Pixel
declare global {
  interface Window {
    fbq: any;
    ttq: any;
    ttqReady?: boolean;
  }
}

export class PixelProvider {
  private static instance: PixelProvider;
  private fbqLoaded = false;
  private ttqLoaded = false;

  static getInstance(): PixelProvider {
    if (!PixelProvider.instance) {
      PixelProvider.instance = new PixelProvider();
    }
    return PixelProvider.instance;
  }

  init() {
    // Only initialize if we're in the browser
    if (typeof window === 'undefined') return;
    
    this.initFacebookPixel();
    this.initTikTokPixel();
  }

  private initFacebookPixel() {
    if (!env.FB_PIXEL_ID || typeof window === 'undefined') return;

    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${env.FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    this.fbqLoaded = true;
  }

  private initTikTokPixel() {
    if (!env.TIKTOK_PIXEL_ID || typeof window === 'undefined') return;

    // Load TikTok Pixel script
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["track","page","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${env.TIKTOK_PIXEL_ID}');
        ttq.page();
        
        // Mark as loaded when ttq is available
        if (typeof window !== 'undefined') {
          window.ttqReady = true;
        }
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
    
    // Wait for ttq to be ready
    const checkTikTokReady = () => {
      if (window.ttq && typeof window.ttq === 'function') {
        this.ttqLoaded = true;
      } else {
        setTimeout(checkTikTokReady, 100);
      }
    };
    checkTikTokReady();
  }

  // Facebook Pixel Events
  pageView() {
    if (this.fbqLoaded && window.fbq && env.FB_PIXEL_ID) {
      try {
        window.fbq('track', 'PageView');
      } catch (error) {
        console.warn('Facebook pixel page view failed:', error);
      }
    }
  }

  roomView(roomId: string, amount: number) {
    if (this.fbqLoaded && window.fbq && env.FB_PIXEL_ID) {
      try {
        window.fbq('track', 'ViewContent', {
          content_type: 'product',
          content_ids: [roomId],
          value: amount,
          currency: 'BDT',
        });
      } catch (error) {
        console.warn('Facebook pixel room view failed:', error);
      }
    }
  }

  purchase(name: string, phone: string, amount: number) {
    if (this.fbqLoaded && window.fbq && env.FB_PIXEL_ID) {
      try {
        window.fbq('track', 'Purchase', {
          value: amount,
          currency: 'BDT',
          content_name: name,
          content_category: 'accommodation',
        });
      } catch (error) {
        console.warn('Facebook pixel purchase tracking failed:', error);
      }
    }

    if (this.ttqLoaded && window.ttq && typeof window.ttq === 'function' && env.TIKTOK_PIXEL_ID) {
      try {
        window.ttq('track', 'CompletePayment', {
          value: amount,
          currency: 'BDT',
          content_name: name,
        });
      } catch (error) {
        console.warn('TikTok pixel purchase tracking failed:', error);
      }
    }
  }

  // TikTok Pixel Events
  tiktokPageView() {
    if (this.ttqLoaded && window.ttq && typeof window.ttq === 'function' && env.TIKTOK_PIXEL_ID) {
      try {
        window.ttq('page');
      } catch (error) {
        console.warn('TikTok pixel page view failed:', error);
      }
    }
  }

  tiktokRoomView(roomId: string, amount: number) {
    if (this.ttqLoaded && window.ttq && typeof window.ttq === 'function' && env.TIKTOK_PIXEL_ID) {
      try {
        window.ttq('track', 'ViewContent', {
          content_type: 'product',
          content_id: roomId,
          value: amount,
          currency: 'BDT',
        });
      } catch (error) {
        console.warn('TikTok pixel room view failed:', error);
      }
    }
  }
}

export const pixelProvider = PixelProvider.getInstance();

// Convenience functions
export const trackPageView = () => {
  try {
    pixelProvider.pageView();
    pixelProvider.tiktokPageView();
  } catch (error) {
    console.warn('Pixel tracking failed:', error);
  }
};

export const trackRoomView = (roomId: string, amount: number) => {
  try {
    pixelProvider.roomView(roomId, amount);
    pixelProvider.tiktokRoomView(roomId, amount);
  } catch (error) {
    console.warn('Pixel room view tracking failed:', error);
  }
};

export const trackPurchase = (name: string, phone: string, amount: number) => {
  try {
    pixelProvider.purchase(name, phone, amount);
  } catch (error) {
    console.warn('Pixel purchase tracking failed:', error);
  }
};
