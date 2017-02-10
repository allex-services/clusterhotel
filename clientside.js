function createClientSide(execlib) {
  'use strict';
  var execSuite = execlib.execSuite,
  allex_hotelserviceServicePack = execSuite.registry.get('allex_hotelservice'),
  ParentServicePack = allex_hotelserviceServicePack;

  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack)
  };
}

module.exports = createClientSide;
