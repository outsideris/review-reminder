const { Application } = require('probot')
const notification = require('../lib/notification')

describe('notification', () => {
  describe('getWebhook()', () => {
    let app
    let github
    const configFile = ''

    beforeEach(() => {
      app = new Application()

      github = {
        repos: {
          getContent: jest.fn().mockReturnValue({
            data: { content: Buffer.from(configFile).toString('base64') }
          }),
          getHooks: jest.fn().mockReturnValue({
            data: [
              { type: 'Repository',
                id: 123456,
                name: 'web',
                active: true,
                events: [ 'push' ],
                config:
                  { content_type: 'json',
                    insecure_ssl: '0',
                    url: 'https://hooks.slack.com/services/abcdefg' },
                updated_at: '2018-06-25T18:57:44Z',
                created_at: '2018-06-25T18:50:05Z'
              }
            ]
          })
        }
      }

      app.auth = () => Promise.resolve(github)
    })

    test('should get pre-registered webhook', async () => {
      const url = await notification.getWebhook(github, 'outsideris', 'review-reminder', 123456)

      expect(github.repos.getHooks).toHaveBeenCalled()
      expect(url).toBe('https://hooks.slack.com/services/abcdefg')
    })
  })
})
