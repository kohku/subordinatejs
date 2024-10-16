export class PerformanceMeter {

  private _startTime = 0;

  start () {
    if (this._startTime === 0) {
      this._startTime = performance.now();
    }
  }

  stop (): DOMHighResTimeStamp | void {
    try {
      if (this._startTime !== 0) {
        const endTime = performance.now();
        // strip the ms and get the seconds
        return (endTime - this._startTime) / 1000;
      }
    } finally {
      this._startTime = 0;
    }
  }
}
