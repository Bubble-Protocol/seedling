export class EventManager {

  updateListeners = {}

  constructor(events=[]) {
    this.addEvents(events);
  }

  addEvents(events) {
    events.forEach(event => this.updateListeners[event] = []);
  }

  hasEvent(event) {
    return !!this.updateListeners[event];
  }

  on(event, listener) {
    if (this.updateListeners[event] === undefined) throw new Error('invalid event');
    if (!this.updateListeners[event].includes(listener)) this.updateListeners[event].push(listener);
  }

  off(event, listener) {
    if (this.updateListeners[event] === undefined) throw new Error('invalid event');
    this.updateListeners[event] = this.updateListeners[event].filter(l => l !== listener);
  }

  notifyListeners(event, ...payload) {
    if (this.updateListeners[event] === undefined) throw new Error('invalid event');
    this.updateListeners[event].forEach(l => l(...payload));
  }

}