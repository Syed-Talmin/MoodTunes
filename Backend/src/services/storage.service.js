const axios = require('axios');
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/songs",
        },(error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

const uploadFromUrl= async (url) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    if (response.headers['content-type'] !== 'audio/mpeg') {
        throw new Error("Invalid audio format");
    }
    const buffer = Buffer.from(response.data, 'binary');
    
   return new Promise((resolve, reject) => {
       imagekit.upload({
           file: buffer,
           fileName: "sdds.mp3",
           folder: "/songs",
           useUniqueFileName: true,
       },(error, result)=>{
           if (error) {
               reject(error);
           } else {
               resolve(result);
           }
       });
   })

}


module.exports = {
    uploadFile,
    uploadFromUrl
}