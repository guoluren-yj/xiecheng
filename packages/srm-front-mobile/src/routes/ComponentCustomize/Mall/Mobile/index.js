import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';
import './index.less';
import Home from './Home';
import Classify from './Clssify';
import ShoppingCar from './ShoppingCar';
import Mine from './Mine';
import MobileContainer from '../../components/MobileContainer';

export default class MallCustomizeMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: null,
    };
  }

  remakeCustomizeConfigs = (customizeConfigs) => {
    const object = {};
    customizeConfigs.forEach((i) => {
      object[i.componetCode] = true;
    });
    return object;
  };

  render() {
    const { currentKey } = this.state;
    const { customizeConfigs } = this.props;
    const configs = this.remakeCustomizeConfigs(customizeConfigs);

    const tabs = [];
    if (!configs['4']) {
      tabs.push({
        name: '首页',
        key: 'home',
        icon: 'home-o',
      });
    }
    if (!configs['5']) {
      tabs.push({
        name: '分类',
        key: 'classify',
        icon: 'dashboard-o',
      });
    }
    if (!configs['6']) {
      tabs.push({
        name: '购物车',
        key: 'shoppingCar',
        icon: 'shopping_cart-o',
      });
    }
    if (!configs['7']) {
      tabs.push({
        name: '我的',
        key: 'mine',
        icon: 'person_outline',
      });
    }

    // 当前显示的tab
    let displayTab = tabs.length && tabs[0];
    tabs.forEach((i) => {
      if (i.key === currentKey) {
        displayTab = i;
      }
    });
    const displayKey = displayTab && displayTab.key;

    const TabItem = ({ tab, isSelected }) => {
      return (
        <div
          className={
            isSelected
              ? 'mall-mobile-tab-item mall-mobile-tab-item-selected'
              : 'mall-mobile-tab-item'
          }
          onClick={() => {
            this.setState({
              currentKey: tab.key,
            });
          }}
        >
          <Icon type={tab.icon} />
          <div>{tab.name}</div>
        </div>
      );
    };

    return (
      <Fragment>
        <MobileContainer>
          <div className="mall-mobile-content">
            <div className="mall-mobile-page">
              {displayKey === 'home' ? <Home configs={configs} /> : null}
              {displayKey === 'classify' ? <Classify /> : null}
              {displayKey === 'shoppingCar' ? <ShoppingCar /> : null}
              {displayKey === 'mine' ? <Mine /> : null}
            </div>
            <div className="mall-mobile-tab">
              {tabs.map((tab) => (
                <TabItem tab={tab} isSelected={tab.key === displayKey} />
              ))}
            </div>
          </div>
        </MobileContainer>
      </Fragment>
    );
  }
}
