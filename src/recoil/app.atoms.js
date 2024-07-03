import { atom } from 'recoil';

export const view3DSettings = atom({
  key: 'view3Dsettings',
  default: {
    wireframe: false,
    orthoView: false,
    rotate: false,
    filetype: 'obj',
    polycount: 0,
    aoVisible: false,
  },
});
