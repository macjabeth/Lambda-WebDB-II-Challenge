const debug = require('debug')('server:init');
const config = require('config');
const server = require('./api/server');

const port = process.env.PORT || config.get('port');
server.listen(port, () => {
  debug(`Listening on PORT ${port}`);
});
