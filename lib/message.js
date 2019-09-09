const color = {
    // success
    green: '\x1B[32m%s\x1B[39m',
    // info
    blue: '\x1B[34m%s\x1B[39m',
    // warning
    yellow: '\x1B[33m%s\x1B[39m',
    // error
    red: '\x1B[31m%s\x1B[39m'
}

module.exports = {
    success(msg) {
        console.log(color.green, msg)
    },
    info(msg) {
        console.log(color.blue, msg)
    },
    warning(msg) {
        console.log(color.yellow, msg)
    },
    error(msg) {
        console.log(color.red, msg)
    }
}
