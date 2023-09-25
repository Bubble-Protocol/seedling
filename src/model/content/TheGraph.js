import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { TEST_DATA } from '../config/test-data';

export class GraphClient {

  constructor(uri) {
    this.client = new ApolloClient({
      uri: uri,
      cache: new InMemoryCache(),
    });
  }

  async fetchContent(amount, skip) {
    return TEST_DATA.latest10;
    const query = gql`
      {
        contents(
          first: ${amount},
          skip: ${skip},
          orderBy: publishedAt,
          orderDirection: desc
        ) 
        {
          id
          contentHash
          url
          author {
            id
            username
            address
            registeredAt
          }
          publishedAt
        }
      }
    `;

    try {
      const result = await this.client.query({ query });
      return result.data.contents;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }
}

export default GraphClient;
