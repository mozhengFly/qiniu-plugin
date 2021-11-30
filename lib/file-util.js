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
    },

    /**
     * 删除文件夹
     */
    deleteDirectory (dir) {
        if (fs.existsSync(dir)) {
            this.deleteDirectoryDeep(dir)
        }
    },

    /**
     * 删除文件夹 深度删除
     * @param path
     */
    deleteDirectoryDeep (path) {
        if (fs.existsSync(path)) {
            const files = fs.readdirSync(path)
            files.forEach(file => {
                const curPath = path + '/' + file
                if (fs.statSync(curPath).isDirectory()) {
                    this.deleteDirectoryDeep(curPath)
                } else {
                    fs.unlinkSync(curPath)
                }
            })
            fs.rmdirSync(path)
        }
    }
};
