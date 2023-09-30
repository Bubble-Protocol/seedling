import localStorage from "../utils/LocalStorage";

export class FollowManager {
 
  sessionId;
  following = [];

  constructor(sessionId) {
    this.sessionId = sessionId;
    this.follow = this.follow.bind(this);
    this.unfollow = this.unfollow.bind(this);
    this.isFollowing = this.isFollowing.bind(this);
    this.followers = this.followers.bind(this);
    this._loadState();
  }

  follow(username) {
    if (!this.isFollowing(username)) {
      this.following.push({username, session: this.sessionId, time: Date.now()});
      this._saveState();
    }
  }

  unfollow(username) {
    this.following = this.following.filter(f => f.session !== this.sessionId || f.username !== username);
    this._saveState();
  }

  isFollowing(username) {
    return !!this.following.find(f => f.session === this.sessionId && f.username === username);
  }

  followers() {
    return this.following
      .filter(f => f.session === this.sessionId)
      .map(f => { return {username: f.username, time: f.time}});
  }

  _loadState() {
    const json = localStorage.read('following');
    if (json) {
      const state = JSON.parse(json);
       this.following = state.following || [];
    }
  }

  _saveState() {
    console.trace('saving follower state', this.following);
    const state = {
      following: this.following
    }
    localStorage.write('following', JSON.stringify(state));
  }

}