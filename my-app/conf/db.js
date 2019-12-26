const env = process.env.NODE_ENV;
let MYSQL_CONF;
let REDIS_CONF;

if (env === 'dev') {
    MYSQL_CONF = {
        host: '39.107.42.37',
        user: 'jinjinjin',
        password: 'jinjinjin',
        port: '3306',
        database: 'newTable'
    }
    REDIS_CONF = {
        host: '127.0.0.1',
        port: '6379'
    }
}

if (env === 'production') {
    MYSQL_CONF = {
        host: '39.107.42.37',
        user: 'jinjinjin',
        password: 'jinjinjin',
        port: '3306',
        database: 'newTable'
    }
    REDIS_CONF = {
        host: '127.0.0.1',
        port: '6379'
    }
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF
}
