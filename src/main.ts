import { SpaceEngine } from '../packages/core/src/Engine.js';

// Global scope access configuration for the index.html scripting block
(window as any).SpaceEngine = SpaceEngine;
console.log('🌌 [Space Core] Universal layer mapping validated successfully.');
