function createSinkNameMaintenance(execlib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;


  function SinkNameMaintainer(sinkcb) {
    this.sinkcb = sinkcb;
    this.how = null;
    this.where = null;
    this.who = null;
    this.sink = null;
    this.task = null;
    this.sinkDestroyedListener = null;
  }
  SinkNameMaintainer.prototype.destroy = function () {
    this.purgeSinkDestroyedListener();
    this.purgeTask();
    this.sink = null;
    this.who = null;
    this.where = null;
    this.how = null;
    this.sinkcb = null;
  };
  SinkNameMaintainer.prototype.purgeSinkDestroyedListener = function () {
    if (this.sinkDestroyedListener) {
      this.sinkDestroyedListener.destroy();
    }
    this.sinkDestroyedListener = null;
  };
  SinkNameMaintainer.prototype.purgeTask = function () {
    if (this.task) {
      this.task.destroy();
    }
    this.task = null;
  };
  SinkNameMaintainer.prototype.go = function (how, where, who) {
    if (lib.isIdentical(this.where, where) && lib.isIdentical(this.who, who)) {
      return;
    }
    this.how = how;
    this.where = where;
    this.who = who;
    this.purgeTask();
    if (this.sink) {
      if (!this.sinkDestroyedListener) {
        this.sinkDestroyedListener = this.sink.destroyed.attach(this.onSink.bind(this, null));
      }
      return;
    }
    this.createTask();
  };
  SinkNameMaintainer.prototype.onSink = function (sink) {
    this.purgeSinkDestroyedListener();
    this.sink = sink;
    this.sinkcb(sink);
    if (!sink && !this.task) {
      this.createTask();
    }
  };
  SinkNameMaintainer.prototype.createTask = function () {
    if (this.how === null) {
      return;
    }
    if (this.task) {
      console.log('already have task', this.where, this.who);
      return;
    }
    switch (this.how) {
      case 'acquire':
        this.createAcquireSinkTask();
        break;
      case 'find':
        this.createFindSinkTask();
        break;
      default:
        throw new lib.Error('UNKNOWN_SINK_ACQUIRER_METHOD', this.how);
    }
  };
  SinkNameMaintainer.prototype.createAcquireSinkTask = function () {
    console.log('acquireSink to', this.where, 'as', this.who);
    this.task = taskRegistry.run('acquireSink', {
      connectionString: this.where,
      identity: this.who,
      onSink: this.onSink.bind(this),
      onCannotConnect: this.onAcquireFail.bind(this)/*,
      debug:true*/
    });
  };
  SinkNameMaintainer.prototype.onAcquireFail = function () {
    this.purgeTask();
    lib.runNext(this.createTask.bind(this), lib.intervals.Second);
  };

  function SinkMaintainterMap(sinkcb) {
    lib.Map.call(this);
    this.sinkcb = sinkcb;
  }
  lib.inherit(SinkMaintainterMap, lib.Map);
  SinkMaintainterMap.prototype.destroy = function () {
    this.sinkcb = null;
    lib.Map.destroy.call(this);
  };
  SinkMaintainterMap.prototype.onSink = function (sinkname, sink) {
    this.sinkcb(sink, sinkname);
  };
  SinkMaintainterMap.prototype.getOrCreate = function (sinkname) {
    var m = this.get(sinkname);
    if (!m) {
      m = new SinkNameMaintainer(this.onSink.bind(this, sinkname));
      this.add(sinkname, m);
    }
    return m;
  };
  SinkMaintainterMap.prototype.goAcquire = function (sinkname, where, who) {
    this.getOrCreate(sinkname).go('acquire', where, who);
  };

  return {
    SinkNameMaintainer: SinkNameMaintainer,
    SinkMaintainterMap : SinkMaintainterMap
  };
}

module.exports = createSinkNameMaintenance;
