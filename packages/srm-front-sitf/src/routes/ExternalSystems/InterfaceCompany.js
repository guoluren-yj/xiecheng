/**
 * InterfaceCompany - 外部系统定义 - 分配公司
 * @date: 2018-09-07
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Transfer, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
/**
 * InterfaceCompany - 分配公司
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class InterfaceCompany extends PureComponent {
  /**
   *
   * @param {Array} targetKeys 当前数据集合
   * @param {String} direction 穿梭框方向
   * @param {Array} moveKeys 变动的主键数组
   */
  @Bind()
  handleChange(targetKeys, direction, moveKeys) {
    const { onHandleAddCompany, onHandleRemoveCompany } = this.props;
    if (direction === 'right') {
      onHandleAddCompany(moveKeys);
    } else {
      onHandleRemoveCompany(moveKeys);
    }
  }

  render() {
    const {
      companyVisible,
      onHandleCompanyModal,
      companyData = [],
      companyTargetKeys = [],
      loading,
    } = this.props;
    return (
      <Modal
        title={intl.get('sitf.externalSystems.view.menu.company').d('分配公司')}
        visible={companyVisible}
        onCancel={() => onHandleCompanyModal(false)}
        footer={false}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Transfer
            showSearch
            rowKey={record => record.companyId}
            listStyle={{ height: 350, width: 200 }}
            dataSource={companyData}
            targetKeys={companyTargetKeys}
            render={item => item.companyName}
            onChange={this.handleChange}
          />
        </Spin>
      </Modal>
    );
  }
}
