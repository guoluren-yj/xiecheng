/*
 * RiskScanModal - 未加入监控企业的风险扫描弹出框
 * @date: 2019/07/04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Modal, Button, Form, Select } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import uuid from 'uuid/v4';
// import { isEmpty, isArray, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { getUserOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import Switch from 'components/Switch';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
@connect(({ configServer, loading }) => ({
  configServer,
  queryLoading: loading.effects['configServer/fetchReconciliationSource'],
  saveLoading: loading.effects['configServer/saveReconciliationSource'],
}))
export default class ReconciliationSourceModal extends Component {
  state = {
    dataSource: [],
    tenantId: getUserOrganizationId(),
  };

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { tenantId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchReconciliationSource',
      payload: { tenantId },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(item => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  @Bind()
  save() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    const lines = getEditTableData(dataSource, ['_status', 'sourceConfigId'], { force: true });
    if (dataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      dispatch({
        type: 'configServer/saveReconciliationSource',
        payload: lines,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  // @Bind()
  // delete() {
  //   const { selectedRows, dataSource } = this.state;
  //   const { dispatch } = this.props;
  //   const selectedRowKeys = selectedRows.map(item => item.sourceConfigId);
  //   const newDataSource = [];
  //   const deleteList = [];
  //   Modal.confirm({
  //     title: intl.get(`spfm.configServer.view.message.ifClean`).d('确认删除？'),
  //     onOk: () => {
  //       dataSource.forEach(item => {
  //         if (!selectedRowKeys.includes(item.sourceConfigId)) {
  //           newDataSource.push(item);
  //         } else if (item._status !== 'create') {
  //           deleteList.push(omit(item, ['$form']));
  //         }
  //       });
  //       if (!isEmpty(deleteList)) {
  //         dispatch({
  //           type: 'configServer/deleteReconciliationSource',
  //           payload: deleteList,
  //         }).then(res => {
  //           if (res) {
  //             notification.success();
  //             this.handleSearch();
  //           }
  //         });
  //       }
  //       this.setState({ selectedRows: [], dataSource: newDataSource });
  //     },
  //   });
  // }

  /**
   * 添加行
   */
  @Bind()
  newAdd() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [{ _status: 'create', sourceConfigId: uuid(), sourceName: null }, ...dataSource],
    });
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('reconciliationSourceVisible', false);
    }
  }

  render() {
    const { dataSource } = this.state;
    const { reconciliationSourceVisible, saveLoading, queryLoading, enumMap } = this.props;
    const { numSource } = enumMap;

    const columns = [
      {
        title: intl.get(`spfm.configServer.view.message.datasource`).d('数据来源'),
        dataIndex: 'sourceCode',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`sourceCode`, {
                initialValue: record.sourceCode,
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (value === 'RCV') {
                        callback(record.$form.setFieldsValue({ enabledFlag: 1 }));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(value, option) => {
                    record.$form.registerField('sourceName');
                    record.$form.setFieldsValue({
                      sourceName: option ? option.props.children : '',
                    });
                  }}
                >
                  {numSource.map(n => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status.ifEnabled').d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag || 0,
              })(<Checkbox disabled={record.$form.getFieldValue('sourceCode') === 'RCV'} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status.default').d('默认'),
        dataIndex: 'defaultFlag',
        width: 70,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`defaultFlag`, {
                initialValue: record.defaultFlag || 0,
              })(<Switch />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];

    return (
      <Modal
        title={
          <div>
            {intl.get(`spfm.configServer.view.message.modal.accountSource`).d('对账数据来源')}
          </div>
        }
        visible={reconciliationSourceVisible}
        onCancel={this.handleModalVisible}
        width={600}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          {/* <Button
            onClick={this.delete}
            // loading={deleting}
            // disabled={isArray(selectedRows) && isEmpty(selectedRows)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button> */}
          <Button onClick={this.save} loading={saveLoading} style={{ marginRight: '8px' }}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.newAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="sourceConfigId"
          loading={queryLoading}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
        />
      </Modal>
    );
  }
}
