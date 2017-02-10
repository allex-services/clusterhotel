function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex:hotel']
    },
    sinkmap: {
      dependencies: ['allex:hotel']
    }
  };
}

module.exports = createServicePack;

