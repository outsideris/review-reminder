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
      authorAvatar: o.user.avatar_url
    }))

    return this.toReview
  }
}
