function createClusterUsersService(execlib, ParentServicePack) {
  'use strict';
  var ParentService = ParentServicePack.Service,
    dataSuite = execlib.dataSuite;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) ,
      'monitor': require('./users/monitorusercreator')(execlib, parentFactory.get('monitor')) 
    };
  }

  function ClusterUsersService(prophash) {
    ParentService.call(this, prophash);
  }
  
  ParentService.inherit(ClusterUsersService, factoryCreator, require('./storagedescriptor'));
  
  ClusterUsersService.prototype.__cleanUp = function() {
    ParentService.prototype.__cleanUp.call(this);
  };
  ClusterUsersService.prototype.createStorage = function(storagedescriptor) {
    return ParentService.prototype.createStorage.call(this, storagedescriptor);
  };
  return ClusterUsersService;
}

module.exports = createClusterUsersService;
