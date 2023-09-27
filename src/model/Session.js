import localStorage from "./utils/LocalStorage";

export class Session {

  username = undefined;
  userId = undefined;

  constructor(id) {
    this.id = id;
    this._loadState();
  }

  hasAccount() {
    return this.userId !== undefined;
  }

  hasUsername() {
    return this.username !== undefined;
  }

  connectToGithub() {
    // TODO
    return Promise.resolve();
  }

  createAccount() {
    // TODO
    return Promise.resolve();
  }

  _loadState() {
    const json = localStorage.read(this.id);
    if (json) {
      const state = JSON.parse(json);
      this.userId = state.userId;
      this.username = state.username;
    }
  }

  _saveState() {
    console.trace('saving session state');
    const state = {
      userId: this.userId,
      username: this.username
    }
    localStorage.write(this.id, JSON.stringify(state));
  }

}
