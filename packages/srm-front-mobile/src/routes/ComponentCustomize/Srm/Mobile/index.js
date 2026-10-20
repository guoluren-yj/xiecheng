import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';
import './index.less';
import Center from './Center';
import Message from './Message';
import Contact from './Contact';
import Mine from './Mine';
import MobileContainer from '../../components/MobileContainer';

export default class SrmCustomizeMobile extends Component {
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
    if (!configs['6']) {
      tabs.push({
        name: '首页',
        key: 'center',
        icon: 'dashboard-o',
      });
    }
    if (!configs['7']) {
      tabs.push({
        name: '消息',
        key: 'message',
        icon: 'sms_outline',
      });
    }
    if (!configs['8']) {
      tabs.push({
        name: '通讯录',
        key: 'contact',
        icon: 'card_travel',
      });
    }
    if (!configs['9']) {
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
            isSelected ? 'srm-mobile-tab-item srm-mobile-tab-item-selected' : 'srm-mobile-tab-item'
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
          <div className="srm-mobile-content">
            <div className="srm-mobile-page">
              {displayKey === 'center' ? <Center configs={configs} /> : null}
              {displayKey === 'message' ? <Message /> : null}
              {displayKey === 'contact' ? <Contact /> : null}
              {displayKey === 'mine' ? <Mine configs={configs} /> : null}
            </div>
            <div className="srm-mobile-tab">
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
