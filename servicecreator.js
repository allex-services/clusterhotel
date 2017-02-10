function createClusterHotelService(execlib, ParentService) {
  'use strict';
  var dataSuite = execlib.dataSuite,
    lib = execlib.lib,
    q = lib.q,
    sinknamemaintenance = require('./sinknamemaintenancecreator')(execlib);

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) ,
      'monitor': require('./users/monitorusercreator')(execlib, parentFactory.get('monitor')) 
    };
  }

  function ClusterHotelService(prophash) {
    ParentService.call(this, prophash);
    this.sinkMaintainers = new sinknamemaintenance.SinkMaintainterMap(this.onRemoteSink.bind(this));
  }
  
  ParentService.inherit(ClusterHotelService, factoryCreator, require('./storagedescriptor'));
  
  ClusterHotelService.prototype.__cleanUp = function() {
    if (this.sinkMaintainers) {
      lib.containerDestroyAll(this.sinkMaintainers);
      this.sinkMaintainers.destroy();
    }
    this.sinkMaintainers = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  ClusterHotelService.prototype.createStorage = function(storagedescriptor) {
    return ParentService.prototype.createStorage.call(this, storagedescriptor);
  };
  ClusterHotelService.prototype.onRemoteSink = function (sink, sinkname) {
    if (sink) {
      this._onStaticallyStartedSubService(sinkname+'_gateway', sink);
    }
  };
  return ClusterHotelService;
}

module.exports = createClusterHotelService;
