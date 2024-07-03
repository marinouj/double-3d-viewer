import React, { useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";

extend({ OrbitControls });

export default function Controls({
  autoRotate,
  enabled,
  reset,
  orbitRef,
  setOrbitRef,
}) {
  /* eslint-disable */
  const orbitR = orbitRef || useRef();
  const { camera, gl, invalidate } = useThree();
  useFrame(() => {
    if (setOrbitRef && orbitR && orbitR.current) setOrbitRef(100);
    else if (orbitR && orbitR.current) {
      orbitR.current.maxDistance = 200;
      orbitR.current.update();
    }
  });

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      orbitR.current.reset();
    }
    return () => {
      mounted = false;
    };
  }, [reset]);

  return (
    <OrbitControls
      enabled={enabled}
      autoRotate={autoRotate}
      args={[camera, gl.domElement]}
      ref={orbitR}
    />
  );
}
