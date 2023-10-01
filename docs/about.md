---
title: About Seedling
description: Welcome to Seedling, a decentralized platform designed to embody the essence of free and fair content sharing. Seedling is inspired by the simplicity and user-friendly experience of platforms like Medium, but with a decentralized twist.
image: ./img/seedling2.png
image-width: full
---
# About Seedling

Welcome to Seedling, a decentralized platform designed to embody the essence of free and fair content sharing. Seedling is inspired by the simplicity and user-friendly experience of platforms like Medium, but with a decentralized twist. It's an arena for writers and readers to interact, share insights, and reward captivating narratives through cryptocurrency tipping.

## How It Works

Seedling marries blockchain technology with the effortless content creation and sharing experience you love. Here's a snapshot of how it operates:

1. **Publishing**: 
   - Writers craft their stories, insights, or articles in [markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) and store them in their GitHub accounts.
   - Through Seedling, they publish the public URLs of their articles, which are then recorded on the blockchain, making them easily discoverable by other users.

2. **Reading**: 
   - Anyone can browse through the latest articles on a sleek, user-friendly interface reminiscent of Medium.
   - No account or wallet is needed to browse the content.

3. **Engagement**:
   - Connect your wallet to follow and tip users. Follows are held privately in the browser, hidden from other users.
   - Follow your favourite authors to keep up with their latest publications.
   - Share your favourite content on social media using the share links provided.
   - Express your appreciation by tipping authors with cryptocurrency. A modest 10% platform fee is levied on tips to support the maintenance and further development of Seedling.

4. **Decentralization**:
   - Your content remains yours, stored securely in your [GitHub](https://github.com) account, with Seedling acting as a window for others to discover and engage with your work.
   - Seedling operates on robust smart contracts which ensure a fair, transparent, and decentralized process for every action on the platform.
     - A [User Registry contract](https://goerli.basescan.org/address/0x04C2973Ab533B1eBe60ba608C026B37799BC5983) holds a mapping of GitHub accounts to user wallet addresses.
     - A [Content Registry contract](https://goerli.basescan.org/address/0x038ADdfd80f722E4826A467690Ab50EEbE1cfFb7) accepts published urls, accepting only content located on the user's registered GitHub account.  The content's hash is recorded alongside the url allowing future verification.
     - A [Tip Jar contract](https://goerli.basescan.org/address/0x778629c02e8Fe1Eb10e2149e017a20D519e55D6e) lets users tip content directly, automatically forwarding the tip to the content's author minus a small platform fee. 
     - [TheGraph](https://thegraph.com/) is used by the app to query published content.

## Beta Phase

Seedling is currently in a Beta phase, which means we're testing the waters, ironing out bugs, and continually enhancing the platform. The beta version runs on the Base Goerli testnet. New features are in the pipeline to support GitHub organisations and to allow users to create publications with free or paid subscriptions.

We're excited to invite users to explore Seedling, share feedback, and help us create a truly decentralized content-sharing space.

## Join Us

Embark on a journey of decentralized content discovery and sharing with Seedling. Connect your wallet and GitHub account, and step into a realm where content ownership reigns supreme.

Feel free to reach out with any questions, feedback, or suggestions on the [Bubble Protocol Discord server](https://discord.gg/sSnvK5C) or at support@seedling-d.app.

Happy reading and writing on Seedling!

_Last updated: 1-Oct-2023_





