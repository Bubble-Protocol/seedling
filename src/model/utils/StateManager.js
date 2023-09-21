import { useEffect, useState } from "react";
import { EventManager } from "./EventManager";

export class StateManager {

  listeners = new EventManager();
  state = {}

  register(name, initialValue) {
    this.state[name] = initialValue;
    this.listeners.addEvents([name]);
  }

  dispatch(name, newValue) {
    if (!this.listeners.hasEvent(name)) throw new Error('non-existent state data: '+name);
    this.state[name] = newValue;
    this.listeners.notifyListeners(name, newValue);
  }

  useStateData(name) {
    if (!this.listeners.hasEvent(name)) throw new Error('non-existent state data: '+name);
    const listeners = this.listeners;
    const initialValue = this.state[name];
    return () => {
      const [data, updateData] = useState(initialValue);
      useEffect(() => {
        listeners.on(name, updateData);
        return () => listeners.off(name, updateData);
      }, [])
      return data;
    }
  }

}