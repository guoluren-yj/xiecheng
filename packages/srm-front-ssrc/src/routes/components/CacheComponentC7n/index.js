/**
 * c7n缓存组件
 */
import React from 'react';
import { getActiveTabKey } from 'utils/menuTab';

export default function CacheComponentC7n(
  initPropsFn = () => {}, // init funciton,, return need cache's ds
  cacheKey // cacheMap key
) {
  return (Component) => {
    class WrapComponent extends React.Component {
      constructor(props) {
        super(props);
        this.cacheKey = cacheKey || getActiveTabKey();
        let cacheDs = {};
        if (window.dsCacheMap && window.dsCacheMap[this.cacheKey]) {
          cacheDs = window.dsCacheMap[this.cacheKey] || {};
        } else {
          cacheDs = initPropsFn(props) || {};
        }
        this.state = {
          initDs: cacheDs,
        };
      }

      componentWillUnmount() {
        if (!window.dsCacheMap) {
          window.dsCacheMap = {};
        }
        window.dsCacheMap[this.cacheKey] = this.state.initDs;
      }

      render() {
        return <Component {...this.state.initDs} {...this.props} />;
      }
    }
    return WrapComponent;
  };
}
