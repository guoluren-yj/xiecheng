/**
 * TransferWrapper - 穿梭框容器组件
 * @date: 2020-05-09
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Tabs, Transfer, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const { TabPane } = Tabs;
const promptCode = 'ssrc.searchResultImport';

/**
 * TransferWrapper - 业务组件
 * @extends {Component} - React.Component
 * @reactProps {!Object} [searchResultImportNew={}] - 数据源
 * @reactProps {!Object} [loading={}] - dva http请求是否完成标识
 * @reactProps {!Object} [loading.effect={}] - 基于对应请求是否完成控制loading
 * @reactProps {boolean} [fetchRfxListLoading=false] - 查询寻源单列表是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ searchResultImportNew }) => ({
  searchResultImportNew,
  organizationId: getCurrentOrganizationId(),
}))
export default class TransferWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'businessEntity',
      entityDestroy: false,
      orgDestroy: false,
    };
  }

  /**
   * 切换tab页签
   * @param {string} activeKey - change后tab对应的key
   */
  @Bind()
  handledChangeTab(activeKey) {
    const {
      onCleanData,
      // entityAllField = [],
      entitySelectFieldList = [],
      // orgAllField = [],
      orgSelectFieldList = [],
    } = this.props;
    let title = '';
    if (activeKey === 'storeOrganization' && entitySelectFieldList && entitySelectFieldList[0]) {
      title = intl
        .get(`${promptCode}.view.message.abandonBusinessEntity`)
        .d('是否放弃所选择的业务实体?');
    } else if (activeKey === 'businessEntity' && orgSelectFieldList && orgSelectFieldList[0]) {
      title = intl
        .get(`${promptCode}.view.message.abandonInventoryOrg`)
        .d('是否放弃所选择的库存组织?');
    } else {
      this.setState({
        activeKey,
        entityDestroy: false,
        orgDestroy: false,
      });
      if (activeKey === 'storeOrganization') {
        // 由业务实体 -> 库存组织
        // setTimeout(() => {
        //   this.orgRef.handleLeftSelectAll(orgSelectFieldList, true);
        // });
      } else {
        // setTimeout(() => {
        //   this.entityRef.handleLeftSelectAll(entitySelectFieldList, true);
        // });
      }
      return;
    }
    Modal.confirm({
      title,
      okText: intl.get('hzero.common.button.yes').d('是'),
      cancelText: intl.get('hzero.common.button.no').d('否'),
      onOk: () => {
        this.setState({
          activeKey,
          [activeKey === 'storeOrganization' ? 'entityDestroy' : 'orgDestroy']: true,
          [activeKey === 'businessEntity' ? 'entityDestroy' : 'orgDestroy']: false,
        });
        // if (activeKey === 'storeOrganization') { // 由业务实体 -> 库存组织
        //   setTimeout(() => {
        //     onCleanData(activeKey);
        //   }, 0);
        // } else {
        //   setTimeout(() => {

        //   }, 0);
        // }
        onCleanData(activeKey);
      },
      onCancel: () => {
        this.setState({
          activeKey: activeKey === 'storeOrganization' ? 'businessEntity' : 'storeOrganization',
        });
      },
    });
  }

  render() {
    const {
      onChange,
      entityLoading = false,
      orgLoading = false,
      entityAllField = [],
      entitySelectFieldList = [],
      orgAllField = [],
      orgSelectFieldList = [],
    } = this.props;
    const { activeKey, entityDestroy = false, orgDestroy = false } = this.state;

    return (
      <React.Fragment>
        <Spin spinning={entityLoading || orgLoading}>
          <Tabs activeKey={activeKey || 'Entity'} animated={false} onChange={this.handledChangeTab}>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.tab.businessEntity`).d('业务实体')}
              key="businessEntity"
            >
              {entityDestroy ? null : (
                <Transfer
                  listStyle={{
                    width: 400,
                    height: 400,
                  }}
                  dataSource={entityAllField}
                  showSearch
                  targetKeys={entitySelectFieldList}
                  onChange={(targetKeys) => onChange(activeKey, targetKeys)}
                  render={(item) => item.title}
                  ref={(vNode) => {
                    this.entityRef = vNode;
                  }}
                  onSearchChange={this.handleSearchChange}
                />
              )}
            </TabPane>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.tab.storeOrganization`).d('库存组织')}
              key="storeOrganization"
            >
              {orgDestroy ? null : (
                <Transfer
                  listStyle={{
                    width: 400,
                    height: 400,
                  }}
                  dataSource={orgAllField}
                  showSearch
                  targetKeys={orgSelectFieldList}
                  onChange={(targetKeys) => onChange(activeKey, targetKeys)}
                  ref={(vNode) => {
                    this.orgRef = vNode;
                  }}
                  render={(item) => item.title}
                  onSearchChange={this.handleSearchChange}
                />
              )}
            </TabPane>
          </Tabs>
        </Spin>
      </React.Fragment>
    );
  }
}
