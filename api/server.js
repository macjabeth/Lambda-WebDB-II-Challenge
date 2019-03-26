const debug = require('debug')('server:log');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const server = express();

// middleware
server.use(express.json());
server.use(compression());
server.use(helmet());
server.use((req, res, next) => {
  res.on('finish', () => {
    debug(`${req.method} ${req.originalUrl} - ${res.statusCode} [${res.statusMessage}]`);
  });
  next();
});

// routes
server.use('/api/zoos', require('../routes/zoos'));
server.use('/api/bears', require('../routes/bears'));

module.exports = server;
