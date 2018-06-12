const createScheduler = require('probot-scheduler');

module.exports = robot => {
  scheduler = createScheduler(robot);

  robot.on('schedule.repository', context => {
  });
}
