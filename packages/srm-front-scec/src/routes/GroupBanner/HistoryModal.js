/**
 * customBar - 平台自定义栏操作记录
 * @date: 2019年2月20日 20:16:26
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
// import { isEmpty } from 'lodash';
// import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 平台自定义栏操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} customBar - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */
const messagePrompt = 'scec.companyBanner.model.companyBanner';
export default class HistoryModal extends Component {
  /**
   * render查询表单
   */
  render() {
    const { visible, loading, onCancel, pagination, dataSource, onChange } = this.props;

    const columns = [
      {
        title: intl.get(`${messagePrompt}.processUser`).d('操作人'),
        dataIndex: 'operatedByName',
        width: 120,
      },
      {
        title: intl.get(`${messagePrompt}.processDate`).d('操作时间'),
        dataIndex: 'operatedDate',
        render: dateTimeRender,
        width: 150,
      },
      {
        title: intl.get(`${messagePrompt}.processStatusMeaning`).d('动作'),
        dataIndex: 'operationName',
        width: 80,
      },
      {
        title: intl.get(`${messagePrompt}.processRemark`).d('说明'),
        dataIndex: 'operatedRemark',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get('scec.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={onCancel}
        // onOk={onCancel}
        footer={null}
        width={800}
      >
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          rowKey="bannerHistoryId"
          onChange={page => onChange(page)}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
