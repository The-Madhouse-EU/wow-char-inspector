import { CMap } from '@grandlinex/e-kernel';

export default class NMap extends CMap<string, number> {
  increase(key: string, value = 1): void {
    if (this.has(key)) {
      this.set(key, this.get(key)! + value);
    } else {
      this.set(key, value);
    }
  }

  decrease(key: string, value = 1): void {
    if (this.has(key)) {
      const newValue = this.get(key)! - value;
      this.set(key, newValue);
    } else {
      this.set(key, -value);
    }
  }
}
