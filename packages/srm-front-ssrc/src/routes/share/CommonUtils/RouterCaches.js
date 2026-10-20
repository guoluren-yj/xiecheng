// 页面路由缓存
const RouterCaches = {
  historyMap: {},

  setHistoryMap(key = null, value = null) {
    if (!key || typeof key !== 'string') {
      throw new ReferenceError('key is required \n string type !');
    }

    this.historyMap[key] = value;
  },

  getHistoryMap(key = null) {
    if (!key || typeof key !== 'string') {
      return this.historyMap;
    }

    return this.historyMap[key];
  },

  removeRecord(key = null) {
    delete this.historyMap[key];
  },

  isExist(key = null) {
    if (!key || typeof key !== 'string') {
      return true;
    }

    const description = Object.getOwnPropertyDescriptor(this.historyMap, key);
    return !!description;
  },

  removeAll() {
    this.init();
  },

  clear() {
    this.init();
  },

  init() {
    this.historyMap = {};
  },
};

/**
 * example
 *
 * sponsorPriceClarification() {
    const {
      history = {},
      sourceHeaderId,
      sourceFrom,
    } = this.props;
    const {
      location: { pathname = null, search },
    } = history || {};
    const HistoryBackKey = 'ExpertUpdate-PricingClarification';

    const params = {
      sourceHeaderId,
      sourceFrom,
      HistoryBackKey,
      operation: 'creation',
    };

    const HistoryBackPath = pathname + search;
    RouterCaches.setHistoryMap(HistoryBackKey, HistoryBackPath);
    const searchParams = querystring.stringify(params);

    history.push({
      pathname: '/ssrc/expert-scoring/price-clarification/update',
      search: searchParams,
    });
  }


  // get location
  getLocationSearch(key = null) {
    const { history } = this.props;
    const {
      location: { search = {}, },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    if (!key || typeof key !== 'string') {
      return RouterCaches;
    }

    return RouterCaches[key] || null;
  }

  // get back path
  getBackpath() {
    const HistoryBackKey = this.getLocationSearch('HistoryBackKey');
    const historyBack = RouterCaches.getHistoryMap(HistoryBackKey);
    return historyBack;
  }
*/

export { RouterCaches };
