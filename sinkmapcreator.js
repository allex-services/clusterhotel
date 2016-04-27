function sinkMapCreator(execlib, ParentServicePack) {
  'use strict';
  var sinkmap = new (execlib.lib.Map), ParentSinkMap = ParentServicePack.SinkMap;
  sinkmap.add('service', require('./sinks/servicesinkcreator')(execlib, ParentSinkMap.get('service')));
  sinkmap.add('user', require('./sinks/usersinkcreator')(execlib, ParentSinkMap.get('user')));
  sinkmap.add('monitor', require('./sinks/monitorsinkcreator')(execlib, ParentSinkMap.get('monitor')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;
