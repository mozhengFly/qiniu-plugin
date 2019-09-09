const fs = require('fs');

module.exports = {
    /**
     * get all files from directory
     * @param directoryPath
     * @param callback
     */
    getFileList (directoryPath, callback) {
        let fileList = [];
        this.getFileByDirectory(directoryPath, fileList);
        callback && callback(fileList)
    },
    getFileByDirectory (directoryPath, fileList) {
        fs.readdirSync(directoryPath).map(url => {
            let path = directoryPath + '/' + url;
            if (url.charAt(0) !== '.' && fs.existsSync(path)) {
                if (fs.statSync(path).isDirectory()) {
                    this.getFileByDirectory(path, fileList)
                } else {
                    fileList.push({
                        localFilePath: path
                    })
                }
            }
        })
    }
};
