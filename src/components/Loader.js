import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';

function Loader({ position }) {
  const mesh = useRef();

  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
  return (
    <mesh position={position} ref={mesh}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color={'#333'} />
    </mesh>
  );
}

export default Loader;
