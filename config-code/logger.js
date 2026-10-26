function logger(level,message){
    const timeStamp = new Date().toISOString()

    console.log(`${timeStamp} ${level} ${message}`);
}

module.exports = {
    info : (message) => logger('INFO', message),
    warn : (message) => logger('WARN', message),
    error : (message) => logger('ERROR', message),
    debug : (message) => logger('DEBUG', message),
}