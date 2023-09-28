import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { TEST_DATA } from '../config/test-data';
import { keccak256 } from 'viem';

export class GraphClient {

  cache = [];

  constructor(uri) {
    this.client = new ApolloClient({
      uri: uri,
      cache: new InMemoryCache(),
    });
  }

  async fetchContent(id) {
    const query = gql`
      query GetContentById($id: ID!) {
        contents(
          where: {id: $id}
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
          tips {
            id
            tipper
            amount
            total
            tippedAt
          }
        }
      }
    `;
    return this._fetch('contents', query, {id});
  }

  
  async fetchLatestContent(amount, skip) {
    // return TEST_DATA.latest10;
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
          tips {
            id
            tipper
            amount
            total
            tippedAt
          }
        }
      }
    `;
    return this._fetch('contents', query);
  }

  async fetchUser(id) {
    const query = gql`
      query GetUserById($id: ID!) {
        users(
          where: {id: $id}
        ) 
        {
          id
          username
          address
          registeredAt
        }
      }
    `;
    return this._fetch('users', query, {id});
  }

  async fetchUserContent(authorId, amount, skip) {
    const query = gql`
      query GetContentById($authorId: ID!) {
        contents(
          where: {author: $authorId}
          first: ${amount},
          skip: ${skip},
          orderBy: publishedAt,
          orderDirection: desc
        ) 
        {
          id
          contentHash
          url
          publishedAt
          tips {
            id
            tipper
            amount
            total
            tippedAt
          }
        }
      }
    `;
    return this._fetch('contents', query, {authorId});
  }

  
  async _fetch(type, query, variables={}) {
    const queryHash = keccak256(JSON.stringify(query)+JSON.stringify(variables));
    if (this.cache[queryHash]) return this.cache[queryHash];
    try {
      const result = await this.client.query({ query, variables });
      this.cache[queryHash] = result.data[type];
      return result.data[type];
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

}

export default GraphClient;
