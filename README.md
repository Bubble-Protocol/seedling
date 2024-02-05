# Seedling

Seedling is a Web3 version of Medium.

https://seedling-d.app

## What is Seedling?

Seedling is a decentralised discovery platform for publishing, discovering and engaging with written content. It is designed to directly link readers to authors and their content without a central organisation in the middle, and to allow authors to finance their work through tipping, subscriptions and crowd funding.

For a full description of Seedling, it's features and it's vision, see the [About article](https://seedling-d.app/article/0x3d1733d3a0635a790df5eb6012e5af6b14ad0333c42b5bb6d9c4298971ae4241).

## Current Features

Currently, discovery is decentralised and tipping is supported. Content is published to a smart contract on the [Polygon](https://polygon.technology/) blockchain and [TheGraph network](https://thegraph.com/) is used by the dapp to query the on-chain data.

Content is hosted by its author in their GitHub account.  Future versions can support other hosting options, such as self hosting, IPFS, [Bubble private hosting](https://bubbleprotocol.com), and others - any content with a public uri.

## Platform Architecture

![architecture diagram](docs/img/architecture.png)

**User Registry**

A [user registry](src/contracts/users/UserRegistry.sol) (on-chain) is maintained for the purpose of discouraging users from publishing and earning tips for works they do not own. It also allows users to be followed and their content queried. 

Users must register to associate their content host (currently GitHub only) with their wallet address by registering with an off-chain OAuth server. The OAuth process ensures they own the GitHub repo or are admin to a company GitHub repo.

The intention is to create a permissioned network of OAuth servers to help decentralise user registration.

Only permitted OAuth servers can register users:
```
event UserRegistered (
  bytes32 indexed id,
  string username,
  address indexed user
);

function register(string memory _username, address _user) onlyRole(REGISTER_ROLE);
```
where:
```
_username     = <host-platform-id>:<username-or-id>
_user_        = <authorised-wallet-address>
REGISTER_ROLE = role granted to a Seedling-trusted OAuth server
```

**Content Publishing**

Content is published to a [content registry](src/contracts/content/ContentRegistry.sol). The content itself is not published, only the host, url pathname and content hash is published. Publishing registers the content hash, url and author id, and emits a `PublishedContent` event.  The content hash forms its unique content id.

```
event PublishedContent(
  bytes32 indexed hash,
  string url,
  bytes32 indexed author
);
  
function publish(bytes32 _contentHash, string memory _username, string memory _contentPath);
```
where:
```
_contentHash = <unique content id>
_username    = <host-platform-id>:<username-or-id>
_contentPath = <path>
```
example:
```
publish('0x...', 'github:alice', 'blog/who-is-this-bob-anyway.md')

// emits: PublishedContent('0x...', 'github:alice/blog/who-is-this-bob-anyway.md', '0x...')
```

The registry only permits publication if the publisher's address is registered to publish on behalf of the given username.

The `host-platform-id` in the username can support multiple protocols. The dapp converts the published content url to the content's actual url, in this case `https://raw.githubusercontent.com/alice/blog/who-is-this-bob-anyway.md` and reads the content.


**Tipping**

Content can be tipped via the [tipjar](src/contracts/tips/TipJar.sol) smart contract. This emits a `Tip` event for display in the dapp and takes a small platform fee. The platform fee is designed to cover the costs of user registration and TheGraph network fees, making the platform self-sustaining.

```
event Tip (
  bytes32 contentId,
  address tipper,
  uint256 amount,
  uint256 total
);

function tip(bytes32 _contentHash) payable;
```

**Discovery**

[TheGraph Network](https://thegraph.com/) provides a fast, convenient and decentralised way to query the on-chain state. All content, tips and user metadata are queried through TheGraph. The content itself and user profile images are read from GitHub.

## Contributing

Seedling is open source and contributions to the code, features, reviews, testing and documentation are very welcome. Please fork and submit pull requests as you see fit.

To contact the developers and join the discussion, join the [Bubble Protocol discord server](https://discord.gg/sSnvK5C) and post in the Seedling channel.

