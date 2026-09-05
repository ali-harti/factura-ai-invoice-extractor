import React, { useEffect, useRef } from 'react';

const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      if (typeof window !== 'undefined') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resize);
      resize();
    }

    let time = 0;
    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      const radius1 = Math.min(canvas.width, canvas.height) * 0.4;
      const x1 = cx + Math.cos(time) * radius1 * 0.3;
      const y1 = cy + Math.sin(time) * radius1 * 0.3;
      
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, radius1);
      grad1.addColorStop(0, 'rgba(123, 97, 255, 0.15)');
      grad1.addColorStop(1, 'rgba(123, 97, 255, 0)');
      
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const radius2 = Math.min(canvas.width, canvas.height) * 0.5;
      const x2 = cx + Math.cos(time + Math.PI) * radius2 * 0.2;
      const y2 = cy + Math.sin(time + Math.PI) * radius2 * 0.2;
      
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, radius2);
      grad2.addColorStop(0, 'rgba(20, 184, 166, 0.1)');
      grad2.addColorStop(1, 'rgba(20, 184, 166, 0)');
      
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', resize);
      }
    };
  }, []);

  return (
    <>
      <div className="hero-bg" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </>
  );
};

export default CanvasBackground;
