# mo-qiniu

> A Simple Qiniuyun Upload Plugin

## Install

```bash
# install mo-qiniu
npm install mo-qiniu
```

## For Example

```javascript
const path = require('path');
const Qiniu = require('mo-qiniu');

const qiniu = new Qiniu({
    // Qiniu accessKey
    accessKey: '',
    // Qiniu secretKey
    secretKey: '',
   	// Bucket 
    // For example: mozhengfly
    bucket: '',
    // Space directory which start with /
    // For example: /test/mozhengfly
    remotePath: '',
    // Local file directory which need to upload
    localFileDirectory: path.resolve(__dirname, './dist'),
    // Whether to open the confirmation box before uploading 
    // default value is false
    needConfirm: true,
    /**
     * The function exec will be after the upload successful
     * @param files	The files which has been uploaded successful
     */
    success: function (files) {
        console.log(files);
    },
    /**
     * The function exec will be after the upload failed
     * @param files	The files which has not been uploaded successful
     */
    error: function (files) {
        console.log(files);
    }
});
// upload action
qiniu.upload();
```

