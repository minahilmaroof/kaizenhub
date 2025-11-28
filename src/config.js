import Config from "react-native-config";


//const apiUrl = 'https://nbl.onyxtec.io/';
const apiUrl = 'https://4a9e53b59c2a.ngrok-free.app/';

export default {
   baseURL: `${apiUrl}api`,




};

// import Config from 'react-native-config';

// export default {
//   baseURL: Config.API_URL,
//   imageURL: Config.IMG_URL,
// };



// import Config from "react-native-config";

// const IS_LIVE = Config.IS_LIVE === "true" ;

// const API_BASE = IS_LIVE ? Config.API_URL_LIVE : Config.API_URL_DEV;
// const STORAGE_BASE = IS_LIVE ? Config.STORAGE_URL_LIVE : Config.STORAGE_URL_DEV;

// export default {
//   api: {
//     baseURL: API_BASE,
//   },
//   storage: {
//     userimageURL: `${STORAGE_BASE}/user/`,
//     attachmentimageURL: `${STORAGE_BASE}/job_attachments/`,
//   },
// };
