import React, { useRef, useEffect, useCallback } from 'react';
import { GlassCrack, Droplet, WipeTrail, ScreenSticker } from '../types';

interface ScreenCanvasProps {
  cracks: GlassCrack[];
  droplets: Droplet[];
  wipeTrails: WipeTrail[];
  stickers: ScreenSticker[];
  laserPos: { x: number; y: number } | null;
  shockwaves: { x: number; y: number; radius: number; maxRadius: number; opacity: number }[];
  onCanvasClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const ScreenCanvas: React.FC<ScreenCanvasProps> = ({
  cracks,
  droplets,
  wipeTrails,
  stickers,
  laserPos,
  shockwaves,
  onCanvasClick,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize canvas to full window dynamically
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main rendering loop for 60fps high performance rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Shockwave rings (punch impact visual wave)
    shockwaves.forEach((sw) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${sw.opacity * 0.7})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Inner refraction ring
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 220, 255, ${sw.opacity * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // 2. Draw Glass Cracks
    cracks.forEach((crack) => {
      ctx.save();

      // Draw cracked glass central impact hole
      if (crack.holeRadius > 0) {
        const grad = ctx.createRadialGradient(
          crack.x, crack.y, 2,
          crack.x, crack.y, crack.holeRadius
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
        grad.addColorStop(0.7, 'rgba(20, 30, 45, 0.6)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

        ctx.beginPath();
        ctx.arc(crack.x, crack.y, crack.holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw concentric crack rings (spiderweb effect)
      for (let r = 1; r <= crack.rings; r++) {
        const ringRadius = (crack.radius / crack.rings) * r;
        ctx.beginPath();
        const steps = 14;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const jitter = (Math.sin(theta * 7 + r) * 0.18 + 1) * ringRadius;
          const px = crack.x + Math.cos(theta) * jitter;
          const py = crack.y + Math.sin(theta) * jitter;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + (1 / r) * 0.35})`;
        ctx.lineWidth = Math.max(1, 2.5 - r * 0.4);
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 3;
        ctx.stroke();
      }

      // Draw radial branches & jagged sub-cracks
      crack.branches.forEach((branch) => {
        const startX = crack.x;
        const startY = crack.y;
        const endX = crack.x + Math.cos(branch.angle) * branch.length;
        const endY = crack.y + Math.sin(branch.angle) * branch.length;

        // Main branch with jagged midpoints
        const midX = (startX + endX) / 2 + (Math.sin(branch.angle * 3) * 8);
        const midY = (startY + endY) / 2 + (Math.cos(branch.angle * 3) * 8);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(200, 230, 255, 0.8)';
        ctx.shadowBlur = 4;
        ctx.stroke();

        // Sub-branches
        branch.subBranches.forEach((sub) => {
          const subEndX = endX + Math.cos(sub.angle) * sub.length;
          const subEndY = endY + Math.sin(sub.angle) * sub.length;

          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(subEndX, subEndY);
          ctx.strokeStyle = 'rgba(240, 245, 255, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });
      });

      // Draw shattered glass shards with refraction highlights
      crack.shatteredShards.forEach((shard) => {
        ctx.save();
        ctx.translate(crack.x + shard.offset.x, crack.y + shard.offset.y);
        ctx.beginPath();
        if (shard.points.length > 0) {
          ctx.moveTo(shard.points[0].x, shard.points[0].y);
          for (let p = 1; p < shard.points.length; p++) {
            ctx.lineTo(shard.points[p].x, shard.points[p].y);
          }
          ctx.closePath();
          ctx.fillStyle = shard.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      });

      ctx.restore();
    });

    // 3. Draw Paint & Water Droplets with Drip Physics
    droplets.forEach((drop) => {
      ctx.save();

      if (drop.type === 'water') {
        // Water droplet with glossy specular shine
        ctx.fillStyle = `rgba(180, 225, 255, ${drop.opacity * 0.55})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${drop.opacity * 0.85})`;
        ctx.lineWidth = 1.5;

        // Dripping stream if active
        if (drop.dripLength > 0) {
          ctx.beginPath();
          ctx.moveTo(drop.x - drop.radius * 0.6, drop.y);
          ctx.lineTo(drop.x - drop.radius * 0.2, drop.y + drop.dripLength);
          ctx.arc(drop.x, drop.y + drop.dripLength, drop.radius * 0.7, 0, Math.PI);
          ctx.lineTo(drop.x + drop.radius * 0.6, drop.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Main droplet bulb
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Gloss highlight
        ctx.beginPath();
        ctx.arc(drop.x - drop.radius * 0.35, drop.y - drop.radius * 0.35, drop.radius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 0.9})`;
        ctx.fill();
      } else {
        // Paint splatter with viscous body & satellite splashes
        ctx.fillStyle = drop.color;
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 4;

        // Drip tail
        if (drop.dripLength > 0) {
          ctx.beginPath();
          ctx.moveTo(drop.x - drop.radius * 0.5, drop.y);
          ctx.quadraticCurveTo(drop.x - drop.radius * 0.2, drop.y + drop.dripLength * 0.5, drop.x - drop.radius * 0.6, drop.y + drop.dripLength);
          ctx.arc(drop.x, drop.y + drop.dripLength, drop.radius * 0.6, 0, Math.PI);
          ctx.quadraticCurveTo(drop.x + drop.radius * 0.2, drop.y + drop.dripLength * 0.5, drop.x + drop.radius * 0.5, drop.y);
          ctx.closePath();
          ctx.fill();
        }

        // Splatter body
        if (drop.splatPoints && drop.splatPoints.length > 0) {
          ctx.beginPath();
          ctx.moveTo(drop.x + drop.splatPoints[0].x, drop.y + drop.splatPoints[0].y);
          for (let sp = 1; sp < drop.splatPoints.length; sp++) {
            ctx.lineTo(drop.x + drop.splatPoints[sp].x, drop.y + drop.splatPoints[sp].y);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3D specular sheen
        ctx.beginPath();
        ctx.arc(drop.x - drop.radius * 0.3, drop.y - drop.radius * 0.3, drop.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }

      ctx.restore();
    });

    // 4. Draw Active Wipe Trails (when user is mopping or squeegeeing)
    wipeTrails.forEach((trail) => {
      ctx.save();
      const grad = ctx.createRadialGradient(trail.x, trail.y, 2, trail.x, trail.y, trail.radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    // 5. Draw Laser Pointer dot
    if (laserPos) {
      ctx.save();
      // Laser core
      ctx.beginPath();
      ctx.arc(laserPos.x, laserPos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff2255';
      ctx.shadowBlur = 18;
      ctx.fill();

      // White hot center
      ctx.beginPath();
      ctx.arc(laserPos.x, laserPos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Outer laser aura pulse
      ctx.beginPath();
      ctx.arc(laserPos.x, laserPos.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 50, 80, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [cracks, droplets, wipeTrails, stickers, laserPos, shockwaves]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-30 pointer-events-auto"
      onClick={onCanvasClick}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
    />
  );
};
