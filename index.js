const createScheduler = require('probot-scheduler')

const PullRequest = require('./lib/pull-request')

module.exports = robot => {
  const scheduler = createScheduler(robot, {
    // interval: 60 * 60 * 1000 // 1 hour
    interval: 1 * 30 * 1000 // 1 hour
  })

  robot.on('schedule.repository', notify)

  async function notify (context) {
    let config = await context.config('review-reminder.yml', {})

    if (!config) {
      scheduler.stop(context.payload.repository)
      return
    }

    const pullRequest = new PullRequest(context.github, context.payload.repository.owner.login, context.payload.repository.name)
    await pullRequest.opened()
    await pullRequest.getReviews()
    await pullRequest.getReviewers()
  }
}
