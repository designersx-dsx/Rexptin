import React, { createContext, useEffect, useRef, useState } from 'react';
import './PreventPullToRefresh.css';
import { useDashboardStore } from '../../Store/agentZustandStore';
import { Loader, ArrowDown } from 'lucide-react';

export const RefreshContext = createContext(false);

// ✅ WebView detector
const isWebView = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return (
    // Android WebView
    (/\bwv\b/.test(userAgent) || /Version\/[\d.]+.*Chrome/.test(userAgent)) ||
    // iOS WebView
    (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/.test(userAgent))
  );
};
// ✅ Detect WebView


// ✅ Detect if installed as PWA
const isPWAInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};
const PreventPullToRefresh = ({ children, setRefreshKey }) => {
  
 const enablePullToRefresh = isWebView() && !isPWAInstalled();


  const { setHasFetched } = useDashboardStore();

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef(null);
  const threshold = 80;

  const [pullDistance, setPullDistance] = useState(0);
  const [showIcon, setShowIcon] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!enablePullToRefresh) return; // ❌ Skip if not in WebView

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;

      const scrollTop = containerRef.current?.scrollTop || 0;
      if (scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const isElementScrollable = (element) => {
      while (element && element !== containerRef.current) {
        const style = window.getComputedStyle(element);
        const overflowY = style.getPropertyValue('overflow-y');
        if (
          (overflowY === 'scroll' || overflowY === 'auto') &&
          element.scrollHeight > element.clientHeight
        ) {
          return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    const handleTouchMove = (e) => {
      if (!isPullingRef.current) return;
      const target = e.target;
      if (isElementScrollable(target)) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startYRef.current;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 100));
        setShowIcon(true);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= threshold && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setHasFetched(false); // 🔁 Trigger your data refresh logic
        setTimeout(() => {
          setIsRefreshing(false);
          isRefreshingRef.current = false;
        }, 1000);
      }
      setPullDistance(0);
      setShowIcon(false);
      isPullingRef.current = false;
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, enablePullToRefresh]);
useEffect(() => {
  const webview = isWebView();
  const pwa = isPWAInstalled();

  console.log("WebView:", webview);
  console.log("PWA Installed:", pwa);

  if (webview) {
    // alert("Running inside WebView");
  } else if (pwa) {
    // alert("Running as PWA (installed app)");
  } else {
    // alert("Running in normal browser");
  }
}, []);

  return (
    <RefreshContext.Provider value={isRefreshing}>
      {enablePullToRefresh && (
        <div
          className="refresh-indicator"
          style={{
            height: `${pullDistance}px`,
            opacity: showIcon ? 1 : 0,
            transition: 'height 0.2s ease, opacity 0.2s ease',
          }}
        >
          <div className="refresh-center-wrapper">
            {pullDistance >= threshold ? (
              <div className="loader-icon spinning">
                <Loader size={28} color="black" />
              </div>
            ) : (
              <div
                className="loader-icon"
                style={{ transform: `rotate(${pullDistance * 2}deg)` }}
              >
                <ArrowDown size={28} color="black" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="custom-refresh-wrapper" ref={containerRef}>
        <div className="content">{children}</div>
      </div>
    </RefreshContext.Provider>
  );
};

export default PreventPullToRefresh;
