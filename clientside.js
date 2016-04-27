function createClientSide(execlib) {
  'use strict';
  var execSuite = execlib.execSuite,
  allex_usersserviceServicePack = execSuite.registry.get('allex_usersservice'),
  ParentServicePack = allex_usersserviceServicePack;

  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack)
  };
}

module.exports = createClientSide;
