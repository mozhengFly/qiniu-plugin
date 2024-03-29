'use strict';
const Message = require('./lib/message');
const ProgressBar = require('./lib/progress');
const FileUtil = require('./lib/file-util');
const qiniu = require('qiniu');

class Qiniu {

    /**
     * constructor
     * @param option
     */
    constructor(option) {
        this.option = option;
        qiniu.conf.ACCESS_KEY = option['accessKey'];
        qiniu.conf.SECRET_KEY = option['secretKey'];
        this.bucket = option.bucket;
        this.remotePath = option.remotePath;
        this.localFileDirectory = option.localFileDirectory;
        this.token = null;
        this.fileList = [];
        this.uploadFiles = [];
        this.errorFiles = [];
        this.uploading = false;
        if (option.needConfirm) {
            this.needConfirm = option.needConfirm === true || option.needConfirm === 'true';
        } else {
            this.needConfirm = false;
        }
        // this.needConfirm = !!option.needConfirm;
        this.success = option.success || (() => {
        });
        this.error = option.error || (() => {
        });
        this.init();
        return this;
    }

    /**
     * 校验参数
     * @returns {boolean}
     */
    validOption() {
        if (!this.option.accessKey) {
            throw new Error('accessKey is Required!')
        }
        if (!this.option.secretKey) {
            throw new Error('secretKey is Required!')
        }
        if (!this.option.bucket) {
            throw new Error('bucket is Required!')
        }
        if (!this.option.remotePath) {
            throw new Error('remotePath is Required!')
        }
        if (!this.option.localFileDirectory) {
            throw new Error('localFileDirectory is Required!')
        }
    }

    /**
     * init
     * @returns {Qiniu}
     */
    init() {
        FileUtil.getFileList(this.localFileDirectory, (fileList) => {
            this.fileList = fileList;
            if (!this.fileList.length) {
                Message.warning('can not find any file to upload...');
                return this;
            }
        });
        return this;
    }

    /**
     * set bucket
     * @param bucket
     * @returns {Qiniu}
     */
    setBucket(bucket) {
        this.bucket = bucket;
        return this;
    }

    /**
     * set remote path
     * @param remotePath
     * @returns {Qiniu}
     */
    setRemotePath(remotePath) {
        this.remotePath = remotePath;
        return this;
    }

    /**
     * set local fileDirectory
     * @param localFileDirectory
     * @returns {Qiniu}
     */
    setLocalFileDirectory(localFileDirectory) {
        this.localFileDirectory = localFileDirectory;
        return this;
    }

    /**
     * set success callback
     * @param success
     * @returns {Qiniu}
     */
    setSuccess(success) {
        if (typeof success !== 'function') {
            throw new Error(`${success} must be a function`);
        }
        this.success = success;
        return this;
    }

    /**
     * set error callback
     * @param error
     * @returns {Qiniu}
     */
    setError(error) {
        if (typeof error !== 'function') {
            throw new Error(`${error} must be a function`);
        }
        this.error = error;
        return this;
    }

    /**
     * confirm file info
     * @param callback
     */
    confirm(callback) {
        process.stdin.setEncoding('utf8');
        Message.info(`Use accessKey[${qiniu.conf.ACCESS_KEY}] and secretKey[${qiniu.conf.SECRET_KEY}] to upload files`);
        Message.warning(`Please confirm upload info : `);
        Message.info(`[Qiniu bucket        ] : ${this.bucket}`);
        Message.info(`[Qiniu remote path   ] : ${this.remotePath}`);
        Message.info(`[Local file directory] : ${this.localFileDirectory}`);
        Message.warning(`The files which will be uploading is as follows : `);
        let fileInfo = this.fileList.map((file, index) => (`File ${index} Path >> ${file['localFilePath']}`)).join('\n');
        Message.info(fileInfo);
        Message.warning(`Are you sure you want to start uploading (Y/N)?`);
        process.stdin.on('data', (input) => {
            input = input.toString().trim();
            if (['Y', 'y', 'YES', 'yes'].indexOf(input) > -1) {
                callback && callback()
            } else {
                process.exit()
            }
        })
    }

    /**
     * upload
     */
    upload() {
        this.validOption()
        if (this.needConfirm) {
            this.confirm(() => {
                this.uploadFileDirectoryWithoutConfirm().then(() => {
                    process.exit();
                })
            })
        } else {
            this.uploadFileDirectoryWithoutConfirm().then();
        }
    }

    /**
     * 异步上传
     * @returns {Promise<unknown>}
     */
    asyncUpload() {
        return new Promise((resolve, reject) => {
            try {
                this.validOption()
                if (this.needConfirm) {
                    this.confirm(() => {
                        this.uploadFileDirectoryWithoutConfirm().then(() => {
                            resolve();
                        }).catch(e => {
                            reject(e)
                        })
                    })
                } else {
                    this.uploadFileDirectoryWithoutConfirm().then(() => {
                        resolve();
                    }).catch(e => {
                        reject(e)
                    })
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * upload without confirm
     */
    uploadFileDirectoryWithoutConfirm() {
        return new Promise((resolve, reject) => {
            if (!this.fileList.length) {
                Message.warning('can not find any file to upload...');
                return resolve();
            }
            try {
                Message.info('begin to upload...');
                let progressBar = new ProgressBar('UploadProgress', this.fileList.length);
                this.uploading = true;
                this.fileList.map(file => {
                    let localFilePath = file['localFilePath'];
                    if (this.remotePath) {
                        file.remoteUrl = this.remotePath + localFilePath.toString().slice(this.localFileDirectory.length);
                    } else {
                        file.remoteUrl = localFilePath.toString().slice(this.localFileDirectory.length + 1);
                    }
                    file.token = this.getToken(file.remoteUrl);
                    this.uploadFile(file, (error, response) => {
                        if (error) {
                            this.errorFiles.push(file);
                        } else {
                            file.url = response['key'];
                        }
                        this.uploadFiles.push(file);
                        progressBar.render(this.uploadFiles.length);
                        if (this.uploadFiles.length === this.fileList.length) {
                            Message.info('All files have been uploaded !');
                            if (this.errorFiles.length) {
                                let errorInfo = this.errorFiles.map(file => (`File【${file['localFilePath']}】upload failed! `)).join('\n');
                                Message.error(errorInfo);
                                this.error(this.errorFiles)
                                return reject(errorInfo);
                            } else {
                                this.success(this.uploadFiles)
                            }
                            this.uploading = false;
                            return resolve();
                        }
                    })
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * get upload token
     * @param remoteUrl
     * @returns {string}
     */
    getToken(remoteUrl) {
        let putPolicy = new qiniu.rs.PutPolicy({
            scope: `${this.bucket}:${remoteUrl}`
        });
        return putPolicy.uploadToken()
    }

    /**
     * upload single file
     * @param file
     * @param callback
     */
    uploadFile(file, callback) {
        let formUploader = new qiniu.form_up.FormUploader();
        let extra = new qiniu.form_up.PutExtra();
        formUploader.putFile(
            file.token,
            file.remoteUrl,
            file['localFilePath'],
            extra,
            (err, ret) => {
                callback && callback(err, ret)
            }
        )
    }
}

module.exports = Qiniu;
