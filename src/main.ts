import { SpaceEngine } from '../packages/core/src/Engine.js';

// Attach the constructor directly to the window space for seamless index.html communication
(window as any).SpaceEngine = SpaceEngine;
console.log('🌌 [Space Engine Layer] Root module dynamically mounted onto window context.');
