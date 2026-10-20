/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-filename-extension */
import React, { Component } from "react";
import { Tabs } from "choerodon-ui/pro";
import formatterCollections from "hzero-front/lib/utils/intl/formatterCollections";
import { Header } from 'hzero-front/lib/components/Page';
import intl from "hzero-front/lib/utils/intl";
import styles from './styles.less';
import SalesAccount from "./SalesAccount";
import SalesRole from "./SalesRole";


@formatterCollections({ code: ['hiam.purAccountManage', 'hzero.common', 'hiam.subAccount', "hiam.roleManagement"] })
export default class Index extends Component<any> {

  search = {};

  constructor(props) {
    super(props);

    const search = props.location.search.split("?")[1];
    const urlParams: any = {};
    if (search) {
      search.split("&").forEach(param => {
        const [paramKey, paramValue] = param.split("=");
        urlParams[paramKey] = paramValue;
      });
    }
    this.search = urlParams;
  }

  componentDidUpdate(prevProps) {
    let { location: { search } } = this.props as any;
    if (prevProps.location.search !== search) {
      const urlParams: any = {};
      search = this.props.location.search.split("?")[1];
      if (search) {
        search.split("&").forEach(param => {
          const [paramKey, paramValue] = param.split("=");
          urlParams[paramKey] = paramValue;
        });
      }
      this.search = urlParams;
      this.forceUpdate();
    }
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hiam.purAccountManage.title.sailorAccountManage').d('供应商销售员管理')}
        />
        <div className={styles["manage-container"]}>
          <div className="manage-content">
            <Tabs animated={false} defaultActiveKey="account">
              <Tabs.TabPane tab={intl.get('hiam.purAccountManage.title.salesAccount').d('销售账户')} key="account">
                <SalesAccount search={this.search} />
              </Tabs.TabPane>
              <Tabs.TabPane tab={intl.get('hiam.purAccountManage.title.salesRole').d('销售角色')} key="role">
                <SalesRole search={this.search} />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </>
    );
  }
}