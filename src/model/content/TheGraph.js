import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const TEST_DATA = {
  latest10: [
    {
        "__typename": "Content",
        "id": "0x041e68994bf081a37906d3d46b031a9f3df85454e78b5f1e6e532a019c6dd42b",
        "contentHash": "0x041e68994bf081a37906d3d46b031a9f3df85454e78b5f1e6e532a019c6dd42b",
        "url": "github:bubble-protocol/bubble-contracts/main/README.md",
        "author": {
            "__typename": "User",
            "id": "0xb3035a5e7385509a6e6dec0beb3fe45ec8b876bdc429eea130ded6a7845bcc31",
            "username": "github:bubble-protocol",
            "address": "0x5d4a0ed69dfd97f40262c3909494ec740648918a",
            "registeredAt": "1695633580"
        },
        "publishedAt": "1695633768"
    }
  ]
}
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
