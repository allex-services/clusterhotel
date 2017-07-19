function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex_hotelservice']
    },
    sinkmap: {
      dependencies: ['allex_hotelservice']
    }
  };
}

module.exports = createServicePack;

