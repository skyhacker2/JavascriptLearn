(function() {
  var Job, JobManager, PageSnapshot, callback, guid, i, job;

  PageSnapshot = require('./page_snapshot');

  guid = require('./guid');

  Job = (function() {

    function Job(url, path, callback) {
      this.url = url;
      this.path = path;
      this.callback = callback;
      this.id = guid();
    }

    return Job;

  })();

  JobManager = (function() {

    function JobManager() {}

    JobManager.freeNum = 20;

    JobManager.pool = [];

    JobManager.workerJobMap = {};

    JobManager.push = function(job) {
      return JobManager.pool.push(job);
    };

    JobManager.checker = function() {
      if (JobManager.freeNum > 0 && JobManager.pool.length > 0) {
        JobManager.doJob(JobManager.pool.shift());
      }
      return setTimeout(JobManager.checker, 0);
    };

    JobManager.doJob = function(job) {
      var pageSnapshot;
      JobManager.freeNum -= 1;
      pageSnapshot = new PageSnapshot();
      JobManager.workerJobMap[pageSnapshot.workerId] = job;
      return pageSnapshot.snapshot(job.url, job.path, JobManager.callback);
    };

    JobManager.callback = function(status, workerId) {
      var job;
      JobManager.freeNum += 1;
      if (JobManager.workerJobMap[workerId]) {
        console.log("Worker: " + workerId + " finished.");
        job = JobManager.workerJobMap[workerId];
        job.callback(status, job.id);
        delete JobManager.workerJobMap[workerId];
        return delete job;
      }
    };

    JobManager.init = function() {
      return this.checker();
    };

    return JobManager;

  }).call(this);

  JobManager.init();

  callback = function(status, id) {
    if (status === 'success') {
      return console.log('job: ' + id + ' finished!');
    } else {
      return console.log('job: ' + id + ' fail!');
    }
  };

  for (i = 0; i < 1000; i++) {
    job = new Job('http://www.baidu.com', __dirname + ("/snapshot/baidu" + i + ".png"), callback);
    JobManager.push(job);
  }

}).call(this);
