import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import Display3D from "./Display3D";
import { view3DSettings } from "../recoil/app.atoms";

export default function Linked3DViewer({ job, setPolycount }) {
  const [settings, setSettings] = useRecoilState(view3DSettings);
  const [model1, setModel1] = useState();
  const [model1filetype, setModel1filetype] = useState();
  const [model2, setModel2] = useState();
  const [polycount2, setPolycount2] = React.useState(0);
  const orbitRef = React.useRef();
  const setOrbitRef = (v) => {
    orbitRef.current.maxDistance = v;
    orbitRef.current.update();
  };
  const isTextured = ["artistTexture", "texture", "rig", "reviewLOD"].includes(
    job.type
  );

  useEffect(() => {
    console.log("update");

    setModel1(job.obj);
    setModel1filetype("obj");
    setModel2(job.initialModel != null ? job.initialModel : job.initialResults);
  }, [job, isTextured, settings]);

  const [maxSize, setMaxSize] = useState();

  return (
    <div
      //   className="flex flex-row gap-2 p-2 w-full h-full"
      style={{
        width: "100%",
        height: "100vh",
        flex: 1,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "100%",
        }}
      >
        {maxSize && (
          <Display3D
            url={model2}
            settings={settings}
            filetype="obj"
            setPolycount={(p) => setPolycount2(p)}
            orbitRef={orbitRef}
            clickableMeshes
            textured={isTextured}
            setOrbitRef={setOrbitRef}
            maxSize={maxSize}
          />
        )}
      </div>
      <div
        style={{
          width: "50%",
        }}
      >
        <Display3D
          url={model1}
          settings={settings}
          filetype={model1filetype}
          clickableMeshes
          setPolycount={(p) => setPolycount(p)}
          orbitRef={orbitRef}
          textured={isTextured}
          setMaxSize={setMaxSize}
          setOrbitRef={setOrbitRef}
        />
      </div>
    </div>
  );
}
