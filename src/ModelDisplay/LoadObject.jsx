/* eslint-disable no-param-reassign */
/* eslint-disable prefer-template */
import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useLoader, useThree, extend, useFrame } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import {
  Outline,
  EffectComposer as EFComposer,
} from "@react-three/postprocessing";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass, SSAOPass });

const LoadObject = React.memo(
  ({
    url,
    settings,
    filetype,
    setPolycount,
    clickableMeshes,
    material,
    fullscreen,
    setPlanePosition,
    setPlaneDimensions,
    setClickedMeshes,
    textured,
    maxSize,
    setMaxSize,
    ssRef,
  }) => {
    /* eslint-disable react-hooks/rules-of-hooks */
    if (!url) {
      return null;
    }
    const [center, setCenter] = useState(new THREE.Vector3());
    const [modelSize, setModelSize] = useState();
    const [delta, setDelta] = useState();
    const [selectedMeshes, setSelectedMeshes] = useState([]);
    const [meshState, setMeshState] = useState({});
    const [childMaterials, setChildMaterials] = useState({});
    const [wireframe, setwireframe] = useState();
    const lines = useRef(null);
    const group = useRef();
    const { gl, scene, invalidate, camera } = useThree();
    // console.count('load_object');

    useEffect(() => {
      if (lines.current !== null && lines.current !== undefined) {
        lines.current.forEach((w) => {
          scene.remove(w);
        });
      }
      lines.current = wireframe;
    }, [wireframe]);

    useEffect(() => {
      let mounted = true;
      if (mounted) {
        invalidate();
      }
      return () => {
        mounted = false;
      };
    }, [settings.wireframe]);
    let object;
    let gltf = false;
    let materials;

    if (!filetype) {
      object = useLoader(OBJLoader, url);
    } else {
      switch (filetype) {
        case "obj":
          object = material
            ? useLoader(OBJLoader, url, (loader) => {
                materials.preload();
                loader.setMaterials(materials);
              })
            : useLoader(OBJLoader, url);

          break;
        case "gltf":
          object = useLoader(GLTFLoader, url);
          object = object.scene;
          gltf = true;
          break;
        case "glb":
          object = useLoader(GLTFLoader, url);
          object = object.scene;
          gltf = true;
          break;
        case "fbx":
          object = useLoader(FBXLoader, url);
          break;
        default:
          object = material
            ? useLoader(OBJLoader, url, (loader) => {
                materials.preload();
                loader.setMaterials(materials);
              })
            : useLoader(OBJLoader, url);
      }
    }

    if (!maxSize) {
      if (filetype === "fbx") {
        object.scale.set(0.01, 0.01, 0.01);
      } else {
        object.scale.set(1, 1, 1);
      }
    }

    const box = new THREE.Box3().setFromObject(object);

    function calculateSize() {
      const center2 = new THREE.Vector3();
      center2.x = (box.max.x + box.min.x) / 2;
      center2.y = (box.max.y + box.min.y) / 2;
      center2.z = (box.max.z + box.min.z) / 2;
      const size = {
        x: Math.abs(box.max.x - box.min.x),
        y: Math.abs(box.max.y - box.min.y),
        z: Math.abs(box.max.z - box.min.z),
      };
      return size;
    }

    const previousSize = calculateSize();
    if (maxSize && previousSize.x < maxSize.x && maxSize.x > 0) {
      camera.position.z = maxSize.x * 2;
    }

    useEffect(() => {
      let mounted = true;
      if (mounted) {
        const center2 = new THREE.Vector3();
        center2.x = (box.max.x + box.min.x) / 2;
        center2.y = (box.max.y + box.min.y) / 2;
        center2.z = (box.max.z + box.min.z) / 2;
        setCenter(center2);
        const size = {
          x: Math.abs(box.max.x - box.min.x),
          y: Math.abs(box.max.y - box.min.y),
          z: Math.abs(box.max.z - box.min.z),
        };

        setPlanePosition(
          new THREE.Vector3(
            0,
            box.min.y - box.max.y < 0 ? -box.max.y : box.max.y,
            0
          )
        );

        const d = Math.min(1.0 / size.x, 1.0 / size.y, 1.0 / size.z);
        setDelta(d);
        setModelSize(size);

        if (setMaxSize) {
          setMaxSize(size);
        }
      }
      return () => {
        mounted = false;
      };
    }, [object, maxSize, setMaxSize]);

    async function ScreenShot() {
      gl.render(scene, camera);
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 0.6;
      //   gl.outputEncoding = THREE.sRGBEncoding;
      gl.preserveDrawingBuffer = true;
      const image = await new Promise((blob) => gl.domElement.toBlob(blob));
      return image;
    }
    if (ssRef) ssRef.current.handleClick = ScreenShot;

    function setMeshes(e) {
      e.stopPropagation();

      setSelectedMeshes([]);
      setMeshState({
        ...meshState,
        [e.object.name]: !meshState[e.object.name],
      });
    }

    const model = useRef(object);

    useEffect(() => {
      let mounted = true;
      if (mounted && object) {
        const materialsChildren = {};
        object.traverse((child) => {
          if (child.isMesh) {
            materialsChildren[child.uuid] = child.material;
          }
        });
        setChildMaterials(materialsChildren);
      }
      return () => {
        mounted = false;
      };
    }, [object]);

    useEffect(() => {
      let mounted = true;
      const children = [];
      if (object && mounted && meshState && Object.keys(meshState).length > 0) {
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            if (meshState[child.name]) {
              // const childColor = child.material.color.getHex().toString(16);
              children.push(child);
            }
          }
        });
      }
      setSelectedMeshes(children);
      if (setClickedMeshes) {
        setClickedMeshes(children);
      }
      return () => {
        mounted = false;
      };
    }, [meshState]);

    useEffect(() => {
      let mounted = true;
      let wireframes = [];
      if (
        mounted &&
        object &&
        childMaterials &&
        Object.keys(childMaterials).length > 0
      ) {
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // if (!textured) child.receiveShadow = true;
            const metalMat = {
              color: 0xf0f0f0,
              opacity: 1,
              //   transparent: 0,
              metalness: 0,
              roughness: 0.2,
              ior: 1.5,
              thickness: 0.01,
              specularIntensity: 1,
              specularColor: 0xffffff,
              envMapIntensity: 1,
              // lightIntensity: 1,
              // exposure: 1,
              wireframe: false,
            };

            child.material = childMaterials[child.uuid];
            // child.material.transparent = false;
            if (
              typeof child.material === "object" &&
              child.material.depthWrite != null
            ) {
              child.material.depthWrite = true;
            }
            /* eslint-disable dot-notation */

            console.log(child.material);
            if (
              child?.material?.name === "None" ||
              !textured ||
              filetype === "obj" ||
              settings.wireframe
            ) {
              // Only add a white material if the mesh does not have a material by default attached
              child.material = new THREE.MeshPhysicalMaterial({
                ...metalMat,
                wireframe: false,
              });
            }
          }
        });
        if (filetype === "obj") setwireframe(wireframes);
      }
      return () => {
        mounted = false;
      };
    }, [childMaterials, textured, filetype, settings.wireframe]);

    useEffect(() => {
      if (wireframe && settings.wireframe) {
        wireframe.forEach((w) => {
          w.position.x = center.x > 1 ? -center.x : 0;
          w.position.y = center.y < 0 ? 0 : -center.y;
          w.position.z = center.z < -10 ? -center.z : 0;
          scene.add(w);
        });
      } else if (wireframe && !settings.wireframe) {
        wireframe.forEach((w) => {
          scene.remove(w);
        });
      }
    }, [wireframe, settings.wireframe]);

    // Rig attached
    useEffect(() => {
      let mounted = true;
      if (mounted && object) {
        const skeleton = new THREE.SkeletonHelper(object);
        skeleton.visible = true;
        scene.add(skeleton);
      }
      return () => {
        mounted = false;
      };
    }, [object]);

    let count = 0;
    let count2 = 0;

    useEffect(() => {
      let mounted = true;
      if (mounted && object && setPolycount) {
        object.traverse((child) => {
          if (child.isMesh) {
            if (gltf) {
              if (!child.geometry.index) {
                count2 += child.geometry.attributes.position.count / 3;
              } else {
                count2 += child.geometry.index.count / 3;
              }
            } else {
              count += child.geometry.attributes.position.count / 3;
              if (childMaterials[child.uuid]) {
                child.material = childMaterials[child.uuid];
              }
            }
          }
        });
      }
      if (setPolycount) {
        if (gltf) {
          setPolycount(count2);
        } else {
          setPolycount(count);
        }
      }
      return () => {
        mounted = false;
      };
    }, [object]);

    useEffect(() => {
      let mounted = true;
      if (mounted && modelSize) {
        setPlaneDimensions([
          Math.max(15, modelSize.x * 2),
          Math.max(15, modelSize.z * 2),
        ]);
        let dz = 1;
        let fol = 50;
        if (settings.orthoView) {
          fol = 100;
          dz = 100;
        }
        const c = camera;
        c.setFocalLength(fol);
        const vFov = (c.fov * Math.PI) / 180;
        const fovh = 2 * Math.atan(Math.tan(vFov / 2) * c.aspect);
        const { x } = modelSize;
        const { y } = modelSize;
        const { z } = modelSize;
        const dx = z / 2 + Math.abs(x / 2 / Math.tan(fovh / 2));
        const dy = z / 2 + Math.abs(y / 2 / Math.tan(vFov / 2));

        const cameraZ = Math.max(dx, dy) + Math.max(x, y) / 10;
        c.position.set(0, 0, cameraZ);
      }
      return () => {
        mounted = false;
      };
    }, [object, fullscreen, modelSize, maxSize, settings.orthoView]);

    return object && delta && center && selectedMeshes ? (
      <>
        <group
          ref={group}
          receiveShadow
          castShadow
          position={[
            center.x > 1 ? -center.x : 0,
            center.y < 0 ? 0 : -center.y,
            center.z < -10 ? -center.z : 0,
          ]}
          onPointerOver={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => setMeshes(e)}
        >
          {clickableMeshes ? (
            <EFComposer autoClear={false} multisampling={8}>
              <Outline
                selection={selectedMeshes}
                selectionLayer={10}
                blur
                visibleEdgeColor={0x932191}
                edgeStrength={10}
              />
            </EFComposer>
          ) : null}
          <primitive
            ref={model}
            object={object}
            // eslint-disable-next-line no-nested-ternary
            scale={1}
            receiveShadow
            castShadow
          />
        </group>
      </>
    ) : null;
  }
);

export default LoadObject;
