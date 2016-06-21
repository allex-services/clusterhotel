function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex:users']
    },
    sinkmap: {
      dependencies: ['allex:users']
    }
  };
}

module.exports = createServicePack;

