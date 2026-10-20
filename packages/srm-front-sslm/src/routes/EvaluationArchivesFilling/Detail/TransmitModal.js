/*
 * @Date: 2022-01-05 17:43:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty, divide, round } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Drawer, Button, Form, Input, InputNumber, Alert, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';

import styles from './index.less';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();

export default class TransmitModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
  }

  // 选中项改变时的回调
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  // 新增
  @Bind()
  handleAdd() {
    const { dataSource } = this.state;
    const { averageFlag, weightSameFlag, currentRespWeight = 100 } = this.props;
    // 非平均式计算且权重不一致，只能新增一行数据
    if (!averageFlag && !weightSameFlag && dataSource.length === 1) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
          .d('存在权重不一致的指标，无法转交给多个评分人'),
      });
      return;
    }
    // 非平均式计算且权重一致，权重默认均分
    if (!averageFlag && weightSameFlag) {
      const respWeight = round(divide(currentRespWeight, dataSource.length + 1), 2);
      const newList = [{ _status: 'create', scorerId: uuidv4() }, ...dataSource].map((n) => ({
        ...n,
        respWeight,
      }));
      newList.forEach((n) => {
        if (n.$form) {
          n.$form.resetFields(['respWeight']); // 重置已经修改过的权重
        }
      });
      this.setState({
        dataSource: newList,
      });
    } else {
      this.setState({
        dataSource: [{ _status: 'create', scorerId: uuidv4() }, ...dataSource],
      });
    }
  }

  // 删除
  @Bind()
  handleDelete() {
    const { selectedRowKeys, dataSource } = this.state;
    const { averageFlag, weightSameFlag, currentRespWeight = 100 } = this.props;
    const newList = dataSource.filter((n) => !selectedRowKeys.includes(n.scorerId));
    const respWeight = round(divide(currentRespWeight, newList.length), 2);
    let newDataSource = [];
    // 非平均式计算且权重一致，删除后权重重新分配
    if (!averageFlag && weightSameFlag) {
      newDataSource = newList.map((n) => ({ ...n, respWeight }));
    } else {
      newDataSource = newList;
    }
    this.setState({
      dataSource: newDataSource,
      selectedRowKeys: [],
      selectedRows: [],
    });
  }

  // 保存
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { onOk } = this.props;
    if (isEmpty(dataSource)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.message.addedAtLeastOne')
          .d('至少新增一行数据'),
      });
    } else {
      const editData = getEditTableData(dataSource, ['_status', 'scorerId']);
      if (!isEmpty(editData)) {
        onOk(editData);
      }
    }
  }

  render() {
    const { visible, onClose, averageFlag, weightSameFlag, onOkLoading } = this.props;
    const { dataSource, selectedRowKeys, selectedRows } = this.state;
    const rowSelection = {
      onChange: this.handleSelectChange,
      selectedRowKeys,
      selectedRows,
    };
    const showFlag = !averageFlag && !weightSameFlag;
    const columns = [
      {
        title: intl.get('sslm.supplierDocManage.model.docManage.scoreUser').d('评分用户'),
        dataIndex: 'loginName',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Fragment>
              {record.$form.getFieldDecorator('respUserId')}
              <FormItem>
                {record.$form.getFieldDecorator('loginName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierDocManage.model.docManage.scoreUser')
                          .d('评分用户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.KPI_CHOOSE_USER"
                    queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'loginName', valueField: 'loginName' }}
                    onChange={(_, lovRecord) => {
                      record.$form.setFieldsValue({
                        respUserId: lovRecord.userId,
                        userName: lovRecord.userName,
                        userDepartment: lovRecord.unitName,
                      });
                    }}
                  />
                )}
              </FormItem>
            </Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.userName`).d('评分用户描述'),
        dataIndex: 'userName',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>{record.$form.getFieldDecorator('userName')(<Input disabled />)}</FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.department`).d('部门'),
        dataIndex: 'userDepartment',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('userDepartment')(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
        dataIndex: 'respWeight',
        width: 120,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('respWeight', {
                initialValue: val,
                rules: [
                  {
                    required: !averageFlag && weightSameFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.supplierDocManage.model.docManage.scoreWeight`)
                        .d('权重'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  disabled={averageFlag || !weightSameFlag}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierDocManage.model.docManage.transmitReason').d('转交原因'),
        dataIndex: 'transformReason',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>{record.$form.getFieldDecorator('transformReason')(<Input />)}</FormItem>
          ) : (
            val
          ),
      },
    ];
    return (
      <Drawer
        visible={visible}
        onClose={onClose}
        width={800}
        wrapClassName={styles['transmit-modal']}
        title={intl.get('sslm.supplierDocManage.view.title.editScorerInfo').d('编辑评分人信息')}
      >
        <Spin spinning={onOkLoading || false}>
          {showFlag && (
            <Alert
              message={intl
                .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
                .d('存在权重不一致的指标，无法转交给多个评分人')}
              type="info"
              showIcon
            />
          )}
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              style={{ margin: '0 8px' }}
              disabled={isEmpty(selectedRows)}
              onClick={this.handleDelete}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button type="primary" onClick={this.handleAdd}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          </div>
          <EditTable
            bordered
            rowKey="scorerId"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowSelection={rowSelection}
          />
        </Spin>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            left: 0,
          }}
        >
          <Button
            loading={onOkLoading}
            onClick={this.handleSave}
            type="primary"
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
          <Button onClick={onClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </Drawer>
    );
  }
}
