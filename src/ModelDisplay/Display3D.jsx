/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { PacmanLoader } from "react-spinners";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

import Scene from "./Scene";

export default function Display3D({
  url,
  settings,
  filetype,
  setPolycount,
  clickableMeshes,
  setClickedMeshes,
  textured,
  material,
  box,
  selected = false,
  orbitRef,
  setOrbitRef,
  maxSize,
  setMaxSize,
  ssRef,
  onLoad = () => {},
  showLoadingState = true,
}) {
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // console.count('display');
  const cube = useLoader(
    OBJLoader,
    "https://kaedim-website-assets.s3.eu-west-2.amazonaws.com/cube.obj"
  );

  useEffect(() => {
    let mounted = true;
    if (mounted && cube) {
      cube.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.material = new THREE.MeshPhongMaterial({
            color: 0x8334eb,
          });
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        flex: 1,
        display: "flex",
      }}
    >
      {showLoadingState && !isModelLoaded ? (
        <div className="absolute w-full h-full flex items-center justify-center bg-gray-1 z-10">
          <div className="flex items-center justify-center w-full p-8 opacity-10">
            <PacmanLoader
              color="#000000"
              loading={!isModelLoaded}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        </div>
      ) : null}
      <Canvas
        frameloop="always"
        shadowMap
        shadows
        onCreated={({ gl }) => {
          if (!box) {
            gl.setClearColor(0xe8e8e8);
          }
          gl.toneMapping = THREE.ReinhardToneMapping;
          gl.toneMappingExposure = 2.3;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        className={`${box ? "border-0" : "md:rounded-lg"}
        ${!isModelLoaded ? "opacity-0" : ""}
         ${selected ? "border-burntSienna border-2" : ""}
         flex-auto`}
      >
        <Scene
          url={url}
          settings={settings}
          filetype={filetype}
          setPolycount={setPolycount}
          clickableMeshes={clickableMeshes}
          textured={textured}
          material={material}
          setClickedMeshes={setClickedMeshes}
          box={box}
          controls={controlsEnabled}
          setOrbitRef={setOrbitRef}
          orbitRef={orbitRef}
          maxSize={maxSize}
          setMaxSize={setMaxSize}
          ssRef={ssRef}
          onLoad={() => {
            setIsModelLoaded(true);
            console.log("loaded");
            onLoad();
          }}
        />
      </Canvas>
    </div>
  );
}
