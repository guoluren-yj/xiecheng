/**
 * InterfaceOperationUnit - 外部系统定义 - 分配业务实体
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
 * InterfaceOperationUnit - 分配业务实体
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class InterfaceOperationUnit extends PureComponent {
  /**
   *
   * @param {Array} targetKeys 当前数据集合
   * @param {String} direction 穿梭框方向
   * @param {Array} moveKeys 变动的主键数组
   */
  @Bind()
  handleChange(targetKeys, direction, moveKeys) {
    const { onHandleAddUnitOptions, onHandleRemoveUnitOptions } = this.props;
    if (direction === 'right') {
      onHandleAddUnitOptions(moveKeys);
    } else {
      onHandleRemoveUnitOptions(moveKeys);
    }
  }

  render() {
    const {
      ouVisible,
      onHandleOUModal,
      unitOptionsData = [],
      ouTargetKeys = [],
      loading,
    } = this.props;
    return (
      <Modal
        title={intl.get('sitf.externalSystems.view.menu.operationUnit').d('分配业务实体')}
        visible={ouVisible}
        onCancel={() => onHandleOUModal(false)}
        footer={false}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Transfer
            showSearch
            rowKey={record => record.ouId}
            listStyle={{ height: 350, width: 200 }}
            dataSource={unitOptionsData}
            targetKeys={ouTargetKeys}
            render={item => item.ouName}
            onChange={this.handleChange}
          />
        </Spin>
      </Modal>
    );
  }
}
