/* eslint-disable array-callback-return */
/**
 * deliveryCompanySupplier - 审批规则定义
 * @date: 2020-6-4
 * @author: ChenJing <jing.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Drawer } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import Company from './Company';
import Supplier from './Supplier';

@connect(({ deliveryCompanySupplier }) => ({
  deliveryCompanySupplier,
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sodr.onlyInvoiceRule',
    'entity.company',
    'entity.supplier',
    'sslm.sample',
    'sslm.common',
    'sfin.common',
    'hiam.authorityManagement',
  ],
})
export default class EnterDefinition extends Component {
  state = {
    activeKey: 'COMPANY',
  };

  componentDidMount() {
    this.handleTabsChange(this.state.activeKey);
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  handleHideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('enterDefinitionVisible', false);
    }
  }

  /**
   * tabs切换执行
   * @param {String} activeKey 激活面板的key
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
    const { dispatch, configHeaderId } = this.props;
    dispatch({
      type: 'deliveryCompanySupplier/fetchCompaynyData',
      payload: {
        configHeaderId,
        configType: activeKey,
      },
    });
  }

  render() {
    const {
      visible = false,
      tenantId,
      configHeaderId,
      companyIncludeAllFlag,
      supplierIncludeAllFlag,
      includeAllFlag,
      allSelectLoading,
    } = this.props;
    const { activeKey } = this.state;

    return (
      <Drawer
        destroyOnClose
        placement="right"
        width={1000}
        onClose={this.handleHideModal}
        visible={visible}
      >
        <React.Fragment>
          <div style={{ marginTop: -18 }}>
            <Tabs
              activeKey={activeKey}
              animated={false}
              onChange={this.handleTabsChange}
              tabPosition="left"
            >
              <Tabs.TabPane tab={intl.get('sslm.sample.model.company').d('公司')} key="COMPANY">
                <Company
                  organizationId={tenantId}
                  configHeaderId={configHeaderId}
                  companyIncludeAllFlag={companyIncludeAllFlag}
                  includeAllFlag={includeAllFlag}
                  allSelectLoading={allSelectLoading}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={intl.get('entity.supplier.tag').d('供应商')} key="SUPPLIER">
                <Supplier
                  organizationId={tenantId}
                  configHeaderId={configHeaderId}
                  supplierIncludeAllFlag={supplierIncludeAllFlag}
                  includeAllFlag={includeAllFlag}
                  allSelectLoading={allSelectLoading}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </React.Fragment>
      </Drawer>
    );
  }
}
