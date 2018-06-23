module.exports = class PullRequest {
  constructor (github, owner, repo) {
    this.github = github
    this.owner = owner
    this.repo = repo
    this.count = 0
    this.toReview = []
  }

  async opened () {
    const query = `repo:${this.owner}/${this.repo} is:pr is:open`

    const params = {
      q: query,
      sort: 'updated',
      order: 'desc'
    }

    const openedPRs = await this.github.search.issues(params)

    this.count = openedPRs.data.total_count
    this.toReview = openedPRs.data.items.map(o => ({
      url: o.html_url,
      number: o.number,
      title: o.title,
      author: o.user.login,
      authorAvatar: o.user.avatar_url,
      reviews: []
    }))

    return this.toReview
  }

  async getReviews () {
    const promises = this.toReview.map((p) =>
      this.github.pullRequests.getReviews({
        owner: this.owner,
        repo: this.repo,
        number: p.number
      }).then((res) => {
        const reviews = res.data.map(r => ({
          user: r.user.login,
          userAvatar: r.user.avatar_url,
          state: r.state
        }))

        if (reviews.length > 0) {
          p.reviews = reviews.reduce((acc, cur) => {
            if (!acc.length) { acc = [acc] }

            const index = acc.findIndex(i => i.user === cur.user)
            if (index >= 0) {
              acc[index] = cur
            } else {
              acc.push(cur)
            }
            return acc
          })
        } else {
          p.reviews = []
        }
      })
    )

    await Promise.all(promises)
  }

  async getReviewers () {
    const promises = this.toReview.map((p) =>
      this.github.pullRequests.getReviewRequests({
        owner: this.owner,
        repo: this.repo,
        number: p.number
      }).then((res) => {
        const reviewers = res.data.users.map(r => ({
          user: r.login,
          userAvatar: r.avatar_url,
          state: 'WAITING'
        }))

        p.reviews = p.reviews.concat(reviewers)
      })
    )

    await Promise.all(promises)
  }
}
