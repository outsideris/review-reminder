const { createRobot } = require('probot')

const PullRequest = require('../lib/pull-request')

describe('review', () => {
  describe('opended()', () => {
    let robot
    let github
    const configFile = ''

    beforeEach(() => {
      robot = createRobot()

      github = {
        repos: {
          getContent: jest.fn().mockReturnValue({
            data: { content: Buffer.from(configFile).toString('base64') }
          })
        },
        integrations: {
          getInstallations: jest.fn()
        },
        search: {
          issues: jest.fn().mockReturnValue({
            data: {
              total_count: 2,
              items: [{
                html_url: 'https://github.com/outsideris/review-reminder/pull/2',
                title: 'test pr 2',
                number: 2,
                user: { login: 'outsideris', avatar_url: 'https://avatars1.githubusercontent.com/u/390146?v=4' },
                body: 'test pr 2'
              },
              {
                html_url: 'https://github.com/outsideris/review-reminder/pull/1',
                title: 'test pr 1',
                number: 1,
                user: { login: 'outsideris', avatar_url: 'https://avatars1.githubusercontent.com/u/390146?v=4' },
                body: 'test pr 1'
              }]
            }
          })
        }
      }

      // Mock out GitHub client
      robot.auth = () => Promise.resolve(github)
    })

    test('should retrive opened PRs to review', async () => {
      const pullRequest = new PullRequest(github, 'outsideris', 'review-reminder')
      await pullRequest.opened()

      expect(github.search.issues).toHaveBeenCalled()
    })
  })
})
