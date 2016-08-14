module.exports = {
    env: 'development',
    auth: {
        // user: 'marvin',
        // pass: 'martian'
    },
    db: {
        host: 'localhost',
        name: 'c09',
        user: 'root',
        pass: '',
        port: 27017,
        uri: function () {
            return 'mongodb://' + /*this.user + ':' + this.pass + '@' +*/ 
                this.host + ':' + this.port + '/' + this.name;
        }
    },
    session: {
        name: 'galactus.sess',
        secret: 'bugs bunny',
        timeout: 0.2 * 60 * 1000 // 15 minutes
    }
};
