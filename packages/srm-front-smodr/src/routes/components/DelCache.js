import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { getActiveTabKey } from 'utils/menuTab';
import { deleteCache } from 'components/CacheComponent/index.js';

// 记录key
const keyMap = {};

export default function delCache({ cacheKey } = {}) {
  return function HOCFactory(WrappedComponent) {
    class HOC extends Component {
      delKey;

      componentWillMount() {
        const {
          location: { state = { _back: 1 } },
        } = this.props;

        this.delKey = cacheKey;
        // 出现则记录
        if (!keyMap[cacheKey]) {
          keyMap[cacheKey] = true;
        } else {
          this.delKey = getActiveTabKey();
        }

        if (!(state && state._back === -1)) {
          deleteCache(this.delKey);
        }
      }

      componentWillUnmount() {
        delete keyMap[this.delKey];
      }

      render() {
        return <WrappedComponent {...this.props} />;
      }
    }

    return withRouter(HOC);
  };
}
