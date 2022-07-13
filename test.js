const path = require('path');
const Test = require('./index.js');

const argv = process.argv;
if (argv.length <= 2) {
  console.log('请输入accessKey和secretKey参数');
  return
}
const params = argv.filter((val, index) => {
  return index >= 2
});

let remotePath = '';
let directory = 'dist';

const qiniu = new Test({
  // Qiniu accessKey
  accessKey: params[0],
  // Qiniu secretKey
  secretKey: params[1],
  // Bucket
  // For example: mozhengfly
  bucket: 'mozhengfly',
  // Space directory which start with /
  // For example: /test/mozhengfly
  remotePath,
  // Local file directory which need to upload
  localFileDirectory: path.resolve(__dirname, `./${directory}`),
  // Whether to open the confirmation box before uploading
  // default value is false
  needConfirm: true,
  success: function (files) {
    console.log('upload successful');
    console.log(files)
  },
  error: function (files) {
    console.log('upload failed');
    console.log(files)
  }
});
// upload action
qiniu.upload();
