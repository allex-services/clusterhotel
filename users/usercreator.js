function createUser(execlib, ParentUser) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    _magicroleending = 'cluster';

  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash) {
    ParentUser.call(this, prophash);
    this.name = null;
    if (prophash && prophash.profile && prophash.role && prophash.profile.role.substr(-_magicroleending.length) === _magicroleending) {
      this.name = prophash.name;
    }
  }
  
  ParentUser.inherit(User, require('../methoddescriptors/user'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/, require('../visiblefields/user'));
  User.prototype.__cleanUp = function () {
    this.name = null;
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.onSpawned = function (sink) {
    if (this.name && sink) {
      taskRegistry.run('readState', {
        state: taskRegistry.run('materializeState', {
          sink: sink
        }),
        name: 'access_info',
        cb: this.onAccessInfo.bind(this)
      });
    }
    ParentUser.prototype.onSpawned.call(this, sink);
  };

  User.prototype.onAccessInfo = function (accessinfo) {
    if (!this.destroyed) {
      return;
    }
    if (!(this.name && accessinfo && accessinfo.ipaddress && accessinfo.port && accessinfo.tokens && accessinfo.tokens.user)) {
      return;
    }
    this.__service.sinkMaintainers.goAcquire(this.name, 'ws://'+accessinfo.ipaddress+':'+accessinfo.port, {ip: {name: this.name, role: 'user', token: accessinfo.tokens.user}});
  };

  return User;
}

module.exports = createUser;
