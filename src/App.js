import Linked3DViewer from "./ModelDisplay/Linked3DViewer";
import "./App.css";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "80vh",
      }}
    >
      <Linked3DViewer
        job={{
          obj: "https://kaedim-website-assets.s3.eu-west-2.amazonaws.com/2cca4c78-2cd2-4f56-a8c7-ddc36e9f5a40.obj",
          initialModel:
            "https://kaedim-website-assets.s3.eu-west-2.amazonaws.com/fox_standard.obj",
          initialResults:
            "https://kaedim-website-assets.s3.eu-west-2.amazonaws.com/fox_standard.obj",
          type: "artistTexture",
        }}
        setPolycount={(p) => {
          console.log("polycount");
        }}
      />
    </div>
  );
}

export default App;
