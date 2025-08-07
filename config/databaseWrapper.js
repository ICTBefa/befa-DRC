class DatabaseWrapper {
    constructor(pool) {
        this.pool = pool;
    }

    connection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) reject(err);

                console.log('MySQL pool connected: threadId ' + connection.threadId);

                const query = (sql, binding) => {
                    return new Promise((resolve, reject) => {
                        connection.query(sql, binding, (err, result) => {
                            if (err) reject(err);
                            resolve(result);
                        });
                    });
                };

                const release = () => {
                    return new Promise((resolve, reject) => {
                        if (err) reject(err);
                        console.log('MySQL pool released: threadId ' + connection.threadId);
                        resolve(connection.release());
                    });
                };

                resolve({query, release});
            });
        });
    }

    query(sql, binding) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, binding, (err, results, fields) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = DatabaseWrapper;