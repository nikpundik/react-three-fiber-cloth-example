import React, { Suspense } from 'react';
import { Canvas } from 'react-three-fiber';
import { Stats, OrbitControls } from 'drei';

import Loader from './components/Loader';
import Flag from './components/Flag';

const flags = [];

const w = 5;
const h = 5;
const dx = 300;
const dy = 300;
const r = () => Math.random() * 30 - 60;
for (let y = 0; y < h; y += 1) {
  for (let x = 0; x < w; x += 1) {
    flags.push([
      dx * x - (dx * w) / 2 + r(),
      dy * y - (dy * h) / 2 + r(),
      -550,
    ]);
  }
}

function App() {
  return (
    <Canvas>
      <pointLight position={[10, 10, 10]} color={0xffffff} intensity={0.8} />
      <Suspense fallback={<Loader />}>
        {flags.map((position) => (
          <Flag position={position} />
        ))}
      </Suspense>
      <Stats showPanel={0} />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
