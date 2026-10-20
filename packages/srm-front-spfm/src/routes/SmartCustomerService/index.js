/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-07-25 14:51:32
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-25 16:02:05
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse, Spin } from 'hzero-ui';
import querystring from 'querystring';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryUserInfo } from '@/services/smartCustomerService';

const { Panel } = Collapse;
@formatterCollections({ code: ['customer.service'] })
export default class SmartCustomerServiceHTML extends React.Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(window.location.search.substr(1));
    const { partnerId, params } = routerParam;
    const { device, webUrl } = params ? JSON.parse(params) : {};
    this.state = {
      data: {},
      device,
      webUrl,
      loading: false,
      partnerId: partnerId === 'undefined' ? undefined : partnerId,
    };
  }

  componentWillMount() {
    this.handleQuery();
  }

  componentDidUpdate() {
    const routerParam = querystring.parse(window.location.search.substr(1));
    const { partnerId, params } = routerParam;
    const { device, webUrl } = params ? JSON.parse(params) : {};
    const newPartnerId = partnerId === 'undefined' ? undefined : partnerId;
    if (this.state.partnerId !== newPartnerId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          partnerId: newPartnerId,
          device,
          webUrl,
        },
        () => this.handleQuery()
      );
      this.handleQuery();
    }
  }

  handleQuery() {
    const { partnerId } = this.state;
    if (partnerId) {
      this.setState({
        loading: true,
      });
      queryUserInfo(partnerId)
        .then((data) => {
          if (getResponse(data)) {
            this.setState({
              data,
            });
          }
        })
        .finally(() => {
          this.setState({
            loading: false,
          });
        });
    }
  }

  render() {
    const { data = {}, device, webUrl, loading = false } = this.state;
    const { loginName, realName, tenantName, email, phone, crmTenantList = [] } = data;
    return (
      <Spin spinning={loading}>
        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel
            style={{ fontSize: '14px' }}
            header={intl.get('customer.service.model.user.environment').d('用户登陆环境信息')}
            key="1"
          >
            <div style={{ fontSize: '12px' }}>
              <p>
                {intl.get('customer.service.model.user.webUrl').d('登陆地址')}：{webUrl}
              </p>
              <p>
                {intl.get('customer.service.model.user.useEnvironment').d('使用设备')}：{device}
              </p>
            </div>
          </Panel>
          <Panel
            style={{ fontSize: '14px' }}
            header={intl.get('customer.service.model.user.userInfo').d('当前用户信息')}
            key="2"
          >
            <div style={{ fontSize: '12px' }}>
              <p>
                {intl.get('customer.service.model.user.loginName').d('子账户编码')}：{loginName}
              </p>
              <p>
                {intl.get('customer.service.model.user.realName').d('子账户名称')}：{realName}
              </p>
              <p>
                {intl.get('customer.service.model.user.phone').d('手机号码')}：{phone}
              </p>
              <p>
                {intl.get('customer.service.model.user.email').d('邮箱')}：{email}
              </p>
              <p>
                {intl.get('customer.service.model.user.tenantName').d('账号租户')}：{tenantName}
              </p>
            </div>
          </Panel>
          <Panel
            style={{ fontSize: '14px' }}
            header={intl.get('customer.service.model.user.partnerInfo').d('合作伙伴信息')}
            key="3"
          >
            <div style={{ fontSize: '12px', width: '100%' }}>
              <p style={{ fontSize: '14px', opacity: '0.7' }}>
                {intl.get('customer.service.model.user.customerTenantList').d('客户租户列表')}
              </p>
              {crmTenantList.map((ele) => {
                return <p>{`${ele.customCompanyNum} ${ele.customCompanyName}`}</p>;
              })}
            </div>
          </Panel>
        </Collapse>
      </Spin>
    );
  }
}
