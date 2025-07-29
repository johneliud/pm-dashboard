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
      let allItems = [];
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        // Use GraphQL API for Projects V2 with pagination
        const query = `
          query getProjectItems($owner: String!, $repo: String!, $projectNumber: Int!, $cursor: String) {
            repository(owner: $owner, name: $repo) {
              projectV2(number: $projectNumber) {
                id
                title
                items(first: 100, after: $cursor) {
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
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
                        closedAt
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
                        closedAt
                        mergedAt
                        milestone {
                          title
                          dueOn
                        }
                      }
                      ... on DraftIssue {
                        id
                        title
                        body
                        assignees(first: 10) {
                          nodes {
                            login
                            name
                            avatarUrl
                          }
                        }
                        createdAt
                        updatedAt
                      }
                    }
                    fieldValues(first: 30) {
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
                        ... on ProjectV2ItemFieldIterationValue {
                          title
                          startDate
                          duration
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
          cursor,
        });

        if (!repository?.projectV2) {
          return { success: false, error: 'Project not found' };
        }

        const items = repository.projectV2.items;
        allItems = allItems.concat(items.nodes);
        hasNextPage = items.pageInfo.hasNextPage;
        cursor = items.pageInfo.endCursor;
      }

      return { success: true, items: allItems };
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