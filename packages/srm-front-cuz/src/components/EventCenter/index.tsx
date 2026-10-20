type EventConstructor = {
  unitCode: string;
};
export default class EventCenter {
  unitCode: string = 'null';

  isInit: boolean = false;

  eventId: number = 0;

  registerEvents: { [eventId: string]: { eventCode: string; callback: Function } } = {};

  eventCodeMaptoIds: { [eventCode: string]: number[] } = {};

  eventsCollection: { [eventCode: string]: Function } = {};

  lazyOnList: any[] = [];

  constructor(props: EventConstructor) {
    const { unitCode } = props;
    const globalEventCollection = (window as any).CUSTEVENTCOLLECTION;
    this.unitCode = unitCode;
    if (globalEventCollection && globalEventCollection[unitCode]) {
      globalEventCollection[unitCode].forEach((event) => {
        this.eventsCollection[event.eventCode] = event.callback;
      });
      this.isInit = true;
    } else if (globalEventCollection) {
      let globalLazyInit: EventCenter[] = (window as any).CUSTEVENTCOLLECTION.__lazy_init__;
      if (!globalLazyInit) {
        // eslint-disable-next-line no-multi-assign
        globalLazyInit = (window as any).CUSTEVENTCOLLECTION.__lazy_init__ = [];
      }
      globalLazyInit.push(this);
    } else {
      (window as any).CUSTEVENTCOLLECTION = { __lazy_init__: [this] };
    }
  }

  lazyInitEvents() {
    const globalEventCollection = (window as any).CUSTEVENTCOLLECTION;
    if (globalEventCollection && globalEventCollection[this.unitCode]) {
      globalEventCollection[this.unitCode].forEach((event) => {
        this.eventsCollection[event.eventCode] = event.callback;
      });
      if (this.lazyOnList.length > 0) {
        this.lazyOnList.forEach(({ eventId, eventCode }) => {
          if (this.eventsCollection[eventCode]) {
            this.registerEvents[eventId] = {
              eventCode,
              callback: this.eventsCollection[eventCode],
            };
            if (!this.eventCodeMaptoIds[eventCode]) {
              this.eventCodeMaptoIds[eventCode] = [];
            }
            this.eventCodeMaptoIds[eventCode].push(eventId);
          }
        });
        // 不存在的事件编码，直接丢弃;
        this.lazyOnList = [];
      }
    }
  }

  delete(eventId) {
    if (this.registerEvents[eventId]) {
      const { eventCode } = this.registerEvents[eventId];
      // 同编码多重事件逻辑不完善，暂时移除
      // this.eventCodeMaptoIds[eventCode] = this.eventCodeMaptoIds[eventCode].filter(id=>id!==eventId);
      this.eventCodeMaptoIds[eventCode] = [];
      delete this.registerEvents[eventId];
    }
  }

  on(eventCode: string) {
    const currentId = this.eventId;
    if (this.eventsCollection[eventCode]) {
      this.registerEvents[currentId] = { eventCode, callback: this.eventsCollection[eventCode] };
      // 同编码多重事件逻辑不完善，暂时移除
      // if(!this.eventCodeMaptoIds[eventCode]){
      //   this.eventCodeMaptoIds[eventCode] = [];
      // }
      this.eventCodeMaptoIds[eventCode] = [currentId];
    } else if (!this.isInit) {
      this.lazyOnList.push({
        eventId: currentId,
        eventCode,
      });
    }
    this.eventId++;
    return currentId;
  }

  emit(eventCode, ...args) {
    const event = this.eventCodeMaptoIds[eventCode];
    if (event && event.length > 0) {
      // 同编码多重事件逻辑不完善，暂时移除
      // event.forEach(async eventId=>{
      //   this.registerEvents[eventId].callback.apply(undefined, args);
      // });
      return this.registerEvents[event[0]].callback.apply(undefined, args);
    }
  }

  clear() {
    this.registerEvents = {};
    this.eventCodeMaptoIds = {};
    this.eventId = 0;
  }
}
