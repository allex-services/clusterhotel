function createUser(execlib, ParentUser) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash) {
    ParentUser.call(this, prophash);
    this.name = null;
    if (prophash && prophash.profile && prophash.profile.role === 'cluster') {
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
    if (!(accessinfo && accessinfo.ipaddress && accessinfo.port && accessinfo.tokens && accessinfo.tokens.user)) {
      return;
    }
    taskRegistry.run('acquireSink', {
      connectionString: 'ws://'+accessinfo.ipaddress+':'+accessinfo.port,
      identity: {ip: {name: this.name, role: 'user', token: accessinfo.tokens.user}},
      onSink: this.onSelfClusterSink.bind(this),
      onCannotConnect: console.error.bind(console, 'ooops'),//d.reject.bind(d),
      singleshot: true
    });
  };

  User.prototype.onSelfClusterSink = function (sink) {
    if (!this.destroyed) {
      sink.destroy();
      return;
    }
    this.__service._onStaticallyStartedSubService(q.defer(), this.name+'_gateway', sink);
  };

  return User;
}

module.exports = createUser;
