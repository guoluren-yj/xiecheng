import React, { Fragment, Component } from 'react';
import { Header } from 'components/Page';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Alert } from 'choerodon-ui';
import SrmCustomize from './Srm';
import MallCustomize from './Mall';
import SrmCustomizeMobile from './Srm/Mobile';
import MallCustomizeMobile from './Mall/Mobile';

import styles from "./index.less";

const { TabPane } = Tabs;

const defaultActiveKey = 'mall';
@formatterCollections({ code: ['smbl.componentCustomize'] })
export default class ComponentCustomize extends Component {
  state = {
    activeKey: defaultActiveKey,
    customizeConfigs: {},
  };

  changeTab = (key) => {
    this.setState({ activeKey: key });
  }

  updateCustomizeConfigs = (data, key) => {
    this.setState({
      customizeConfigs: {
        ...this.state.customizeConfigs,
        [key]: data,
      },
    });
  }

  render() {
    return (
      <Fragment>
        <Header
          title={intl.get('smbl.componentCustomize.view.title.componentCustomize').d('组件个性化')}
        />
        <div className={styles["config-content"]}>
          <Tabs defaultActiveKey={defaultActiveKey} className='config-tabs' onChange={this.changeTab}>
            <TabPane title={intl.get('smbl.componentCustomize.view.mall').d('商城')} key="mall">
              <Alert
                iconType="help"
                message={intl.get("smbl.componentCustomize.view.alert1").d("可在列表添加需要移除的子应用；右侧可实时预览设置")}
                type="info"
                showIcon
                closable
              />
              <MallCustomize updateCustomizeConfigs={this.updateCustomizeConfigs} customizeConfigs={this.state.customizeConfigs.mall || []} />
            </TabPane>
            <TabPane title="SRM" key="srm">
              <Alert
                iconType="help"
                message={intl.get("smbl.componentCustomize.view.alert1").d("可在列表添加需要移除的子应用；右侧可实时预览设置")}
                type="info"
                showIcon
                closable
              />
              <SrmCustomize updateCustomizeConfigs={this.updateCustomizeConfigs} customizeConfigs={this.state.customizeConfigs.srm || []} />
            </TabPane>
          </Tabs>
          <div className="preview-area">
            <div className="preview-area-title">{intl.get("hzero.common.preview").d("预览")}</div>
            {
              this.state.activeKey === "mall" ? (
                <MallCustomizeMobile customizeConfigs={this.state.customizeConfigs.mall || []} />
              ) : (
                <SrmCustomizeMobile customizeConfigs={this.state.customizeConfigs.srm || []} />
              )
            }
          </div>
        </div>
      </Fragment>
    );
  }
}
