/**
 * InterfaceAllocation - 外部系统分配 - 分配接口
 * @date: 2018-12-17
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Transfer, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * InterfaceOperationUnit - 分配接口
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
    const { onHandleAddInterface, onHandleRemoveInterface } = this.props;
    if (direction === 'right') {
      onHandleAddInterface(moveKeys);
    } else {
      onHandleRemoveInterface(moveKeys);
    }
  }

  render() {
    const {
      interfaceVisible,
      onHandleInterfaceModal,
      interfaceData = [],
      interfaceTargetKeys = [],
      loading,
    } = this.props;
    return (
      <Modal
        title={intl.get('sitf.externalSystems.view.menu.interfaceAllocation').d('分配接口')}
        visible={interfaceVisible}
        onCancel={() => onHandleInterfaceModal(false)}
        footer={false}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Transfer
            showSearch
            rowKey={record => record.interfaceId}
            listStyle={{ height: 350, width: 200 }}
            dataSource={interfaceData}
            targetKeys={interfaceTargetKeys}
            render={item => item.interfaceName}
            onChange={this.handleChange}
          />
        </Spin>
      </Modal>
    );
  }
}
