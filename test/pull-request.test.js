const { Application } = require('probot')

const PullRequest = require('../lib/pull-request')

describe('review', () => {
  describe('opended()', () => {
    let app
    let github
    const configFile = ''

    beforeEach(() => {
      app = new Application()

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
      app.auth = () => Promise.resolve(github)
    })

    test('should retrive opened PRs to review', async () => {
      const pullRequest = new PullRequest(github, 'outsideris', 'review-reminder')
      await pullRequest.opened()

      expect(github.search.issues).toHaveBeenCalled()
    })
  })

  describe('getReviews()', () => {
    let app
    let github
    const configFile = ''

    beforeEach(() => {
      app = new Application()
    })

    test('should remain latest review status by users', async () => {
      github = {
        repos: {
          getContent: jest.fn().mockReturnValue({
            data: { content: Buffer.from(configFile).toString('base64') }
          })
        },
        pullRequests: {
          getReviews: jest.fn().mockResolvedValue({
            data: [
              { user: { login: 'reviewer1', avatar_url: 'avartar' },
                state: 'CHANGES_REQUESTED' },
              { user: { login: 'reviewer2', avatar_url: 'avartar' },
                state: 'COMMENTED' },
              { user: { login: 'reviewer2', avatar_url: 'avartar' },
                state: 'APPROVED' }
            ]
          })
        }
      }
      app.auth = () => Promise.resolve(github)

      const pullRequest = new PullRequest(github, 'outsideris', 'review-reminder')
      pullRequest.toReview = [{
        url: 'https://github.com/outsideris/review-reminder/pull/2',
        number: 2,
        title: 'test pr 2',
        author: 'outsideris',
        authorAvatar: 'https://avatars1.githubusercontent.com/u/390146?v=4',
        reviews: []
      }]
      await pullRequest.getReviews()

      expect(pullRequest.toReview[0].reviews).toHaveLength(2)
    })

    test('should remain 11latest review status by users', async () => {
      github = {
        repos: {
          getContent: jest.fn().mockReturnValue({
            data: { content: Buffer.from(configFile).toString('base64') }
          })
        },
        pullRequests: {
          getReviews: jest.fn().mockResolvedValue({
            data: []
          })
        }
      }
      app.auth = () => Promise.resolve(github)

      const pullRequest = new PullRequest(github, 'outsideris', 'review-reminder')
      pullRequest.toReview = [{
        url: 'https://github.com/outsideris/review-reminder/pull/2',
        number: 2,
        title: 'test pr 2',
        author: 'outsideris',
        authorAvatar: 'https://avatars1.githubusercontent.com/u/390146?v=4',
        reviews: []
      }]
      await pullRequest.getReviews()

      expect(pullRequest.toReview[0].reviews).toHaveLength(0)
    })
  })

  describe('getReviewers()', () => {
    let app
    let github
    const configFile = ''

    beforeEach(() => {
      app = new Application()

      github = {
        repos: {
          getContent: jest.fn().mockReturnValue({
            data: { content: Buffer.from(configFile).toString('base64') }
          })
        },
        pullRequests: {
          getReviewRequests: jest.fn().mockResolvedValue({
            data: {
              users: [
                { login: 'reviewer1', avatar_url: 'avatar1' },
                { login: 'reviewer2', avatar_url: 'avatar2' }
              ]
            }
          })
        }
      }

      // Mock out GitHub client
      app.auth = () => Promise.resolve(github)
    })

    test('should add reviews who waiting to review', async () => {
      const pullRequest = new PullRequest(github, 'outsideris', 'review-reminder')
      pullRequest.toReview = [{
        url: 'https://github.com/outsideris/review-reminder/pull/2',
        number: 2,
        title: 'test pr 2',
        author: 'outsideris',
        authorAvatar: 'https://avatars1.githubusercontent.com/u/390146?v=4',
        reviews: []
      }]
      await pullRequest.getReviewers()

      expect(pullRequest.toReview[0].reviews).toHaveLength(2)
    })
  })
})
