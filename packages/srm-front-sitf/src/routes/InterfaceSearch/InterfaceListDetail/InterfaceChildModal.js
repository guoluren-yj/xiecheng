/**
 * InterfaceChildModal - 接口查询 - 接口表 - 接口查询字表弹框
 * @date: 2018-10-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal } from 'hzero-ui';
import InterfaceChildList from './InterfaceChildList';

/**
 * 接口查询 - 接口表 - 接口查询字表弹框
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class InterfaceChildModal extends PureComponent {
  render() {
    const {
      modalVisible,
      handleVisible,
      configData = {},
      dataSource = {},
      title = '',
      queryChildData,
      childLevelPath,
      fetchId,
      childParams,
    } = this.props;
    return (
      <Modal
        visible={modalVisible}
        title={title}
        footer={null}
        maskClosable={false}
        width="100%"
        onCancel={() => handleVisible(false)}
      >
        <InterfaceChildList
          modalConfig={configData}
          modalDataSource={dataSource}
          queryChildData={queryChildData}
          childLevelPath={childLevelPath}
          fetchId={fetchId}
          patentParams={childParams}
        />
      </Modal>
    );
  }
}
