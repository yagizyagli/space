import { SpaceEngine } from '../packages/core/src/Engine.ts';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-viewport') as HTMLCanvasElement;
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Seamless synchronous initialization blocking browser layout races
  const engine = new SpaceEngine({
    canvasElement: canvas,
    enableLiveTelemetry: false
  });
  engine.start();

  const currentExpDisplay = document.getElementById('current-exp');
  
  document.getElementById('btn-subatomic')?.addEventListener('click', () => { engine.getCamera().zoomTo(-15); if(currentExpDisplay) currentExpDisplay.innerText = '-15'; });
  document.getElementById('btn-macro')?.addEventListener('click', () => { engine.getCamera().zoomTo(1); if(currentExpDisplay) currentExpDisplay.innerText = '1'; });
  document.getElementById('btn-celestial')?.addEventListener('click', () => { engine.getCamera().zoomTo(7); if(currentExpDisplay) currentExpDisplay.innerText = '7'; });
  document.getElementById('btn-deepspace')?.addEventListener('click', () => { engine.getCamera().zoomTo(10); if(currentExpDisplay) currentExpDisplay.innerText = '10'; });

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});
