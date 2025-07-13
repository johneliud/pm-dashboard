const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async testConnection() {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProject(owner, repo, projectNumber) {
    try {
      const { data } = await this.octokit.rest.projects.get({
        project_id: projectNumber,
      });
      return { success: true, project: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProjectItems(owner, repo, projectNumber) {
    try {
      // Use GraphQL API for Projects V2
      const query = `
        query getProjectItems($owner: String!, $repo: String!, $projectNumber: Int!) {
          repository(owner: $owner, name: $repo) {
            projectV2(number: $projectNumber) {
              id
              title
              items(first: 100) {
                nodes {
                  id
                  type
                  content {
                    ... on Issue {
                      id
                      number
                      title
                      body
                      state
                      assignees(first: 10) {
                        nodes {
                          login
                          name
                          avatarUrl
                        }
                      }
                      createdAt
                      updatedAt
                      milestone {
                        title
                        dueOn
                      }
                      labels(first: 10) {
                        nodes {
                          name
                        }
                      }
                    }
                    ... on PullRequest {
                      id
                      number
                      title
                      body
                      state
                      assignees(first: 10) {
                        nodes {
                          login
                          name
                          avatarUrl
                        }
                      }
                      createdAt
                      updatedAt
                      milestone {
                        title
                        dueOn
                      }
                    }
                  }
                  fieldValues(first: 20) {
                    nodes {
                      ... on ProjectV2ItemFieldTextValue {
                        text
                        field {
                          ... on ProjectV2FieldCommon {
                            name
                          }
                        }
                      }
                      ... on ProjectV2ItemFieldNumberValue {
                        number
                        field {
                          ... on ProjectV2FieldCommon {
                            name
                          }
                        }
                      }
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                        field {
                          ... on ProjectV2FieldCommon {
                            name
                          }
                        }
                      }
                      ... on ProjectV2ItemFieldDateValue {
                        date
                        field {
                          ... on ProjectV2FieldCommon {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const { repository } = await this.octokit.graphql(query, {
        owner,
        repo,
        projectNumber,
      });

      if (!repository?.projectV2) {
        return { success: false, error: 'Project not found' };
      }

      return { success: true, items: repository.projectV2.items.nodes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRepositoryInfo(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return { success: true, repository: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = GitHubService;