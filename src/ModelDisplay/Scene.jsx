/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-param-reassign */
import { Environment } from "@react-three/drei";
import React, { Suspense, useState, useEffect } from "react";
import Controls from "./Controls";
import LoadObject from "./LoadObject";

export default function Display3D({
  url,
  settings,
  filetype,
  setPolycount,
  clickableMeshes,
  textured,
  material,
  box,
  setClickedMeshes,
  controls,
  orbitRef,
  setOrbitRef,
  maxSize,
  setMaxSize,
  ssRef,
  onLoad,
}) {
  const [planePosition, setPlanePosition] = useState();
  const [planeDimensions, setPlaneDimensions] = useState([0, 0]);
  // console.count('scene');
  const col = "#282424";
  const plane = "#383444";

  useEffect(() => {
    if (planePosition && onLoad) {
      onLoad();
    }
  }, [planePosition]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <boxGeometry attach="geometry" args={[1, 1, 1]} />

      <Controls
        autoRotate={settings.rotate}
        enabled={controls}
        orbitRef={orbitRef}
        setOrbitRef={setOrbitRef}
      />
      <color attach="background" args={[col]} />
      <Suspense fallback={<>Loading</>}>
        <mesh position={planePosition} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry attach="geometry" args={planeDimensions} />
          <meshPhysicalMaterial
            attach="material"
            color={plane}
            roughness={2}
            sheen={0}
            ior={0}
            specularColor={plane}
            reflectivity={0}
            clearcoat={0}
            clearcoatRoughness={0}
            transmission={0}
          />
        </mesh>
        <Environment preset="sunset" />
        <LoadObject
          url={url}
          settings={settings}
          filetype={filetype}
          setPolycount={setPolycount}
          clickableMeshes={clickableMeshes}
          textured={textured}
          material={material}
          setClickedMeshes={setClickedMeshes}
          fullscreen={box}
          setPlaneDimensions={setPlaneDimensions}
          setPlanePosition={setPlanePosition}
          maxSize={maxSize}
          setMaxSize={setMaxSize}
          ssRef={ssRef}
        />
      </Suspense>
    </>
  );
}
