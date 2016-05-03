function createClusterUsersService(execlib, ParentServicePack) {
  'use strict';
  var ParentService = ParentServicePack.Service,
    dataSuite = execlib.dataSuite,
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

  function ClusterUsersService(prophash) {
    ParentService.call(this, prophash);
    this.sinkMaintainers = new sinknamemaintenance.SinkMaintainterMap(this.onRemoteSink.bind(this));
  }
  
  ParentService.inherit(ClusterUsersService, factoryCreator, require('./storagedescriptor'));
  
  ClusterUsersService.prototype.__cleanUp = function() {
    if (this.sinkMaintainers) {
      lib.containerDestroyAll(this.sinkMaintainers);
      this.sinkMaintainers.destroy();
    }
    this.sinkMaintainers = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  ClusterUsersService.prototype.createStorage = function(storagedescriptor) {
    return ParentService.prototype.createStorage.call(this, storagedescriptor);
  };
  ClusterUsersService.prototype.onRemoteSink = function (sink, sinkname) {
    if (sink) {
      this._onStaticallyStartedSubService(q.defer(), sinkname+'_gateway', sink);
    }
  };
  return ClusterUsersService;
}

module.exports = createClusterUsersService;
