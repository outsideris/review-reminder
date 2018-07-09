module.exports = {
  getWebhook: async (github, owner, repo, hookId) => {
    const result = await github.repos.getHooks({owner, repo})
    const hook = result.data.find(h => h.id === hookId)

    return hook ? hook.config.url : null
  }
}
