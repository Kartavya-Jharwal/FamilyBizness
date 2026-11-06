import type React from "react";
import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Main app routes for swipeable navigation
const routes = ["/dashboard", "/holdings", "/performance", "/income", "/activities"];

interface SwipeableLayoutProps {
  children: React.ReactNode;
}

export function SwipeableLayout({ children }: SwipeableLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{x:number;y:number} | null>(null);

  const currentIndex = routes.indexOf(location.pathname);

  const reset = () => { gesture.current = null; if(containerRef.current) containerRef.current.style.transform = ""; };
  const handleTouchStart = (e: React.TouchEvent) => {
    const target=e.target as Element;
    if(e.touches.length!==1 || currentIndex<0 || target.closest("input, textarea, select, [role=slider], [data-no-swipe-drag], [data-carousel]")) {reset();return;}
    gesture.current={x:e.touches[0].clientX,y:e.touches[0].clientY};
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const start=gesture.current;if(!start)return;
    if(e.touches.length!==1){reset();return;}
    const dx=e.touches[0].clientX-start.x,dy=e.touches[0].clientY-start.y;
    if(Math.abs(dy)>12 && Math.abs(dy)>=Math.abs(dx)){reset();return;}
    if(Math.abs(dx)>Math.abs(dy)*1.5 && containerRef.current) containerRef.current.style.transform=`translateX(${Math.max(-60,Math.min(60,dx*.2))}px)`;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start=gesture.current;reset();if(!start || !e.changedTouches.length)return;
    const dx=start.x-e.changedTouches[0].clientX,dy=start.y-e.changedTouches[0].clientY;
    if(Math.abs(dx)<Math.max(64,window.innerWidth*.18) || Math.abs(dx)<Math.abs(dy)*1.5)return;
    const next=currentIndex+(dx>0?1:-1);if(next>=0 && next<routes.length)navigate(routes[next]);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen pb-20 transition-transform duration-200 ease-out"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={reset}
    >
      {children}
    </div>
  );
}
