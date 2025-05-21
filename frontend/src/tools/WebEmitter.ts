export default class WebEmitter {
  events: Map<string, any[]>;

  constructor() {
    this.events = new Map();
  }

  on<T>(name: string, listener: (d: T) => void) {
    if (!this.events.has(name)) {
      this.events.set(name, []);
    }

    this.events.get(name)?.push(listener);
  }

  removeListener(name: string, listenerToRemove: any) {
    if (!this.events.has(name)) {
      throw new Error(
        `Can't remove a listener. Event "${name}" doesn't exits.`,
      );
    }

    const filterListeners = (listener: any) => listener !== listenerToRemove;

    const ev = this.events.get(name)?.filter(filterListeners) || [];
    this.events.set(name, ev);
  }

  emit<T>(name: string, data: T) {
    if (this.events.has(name)) {
      const fireCallbacks = (callback: (data: T) => void) => {
        callback(data);
      };

      this.events.get(name)?.forEach(fireCallbacks);
    }
  }
}
