/*
 * @Author: ZhangHao <hao.zhang07@hand-china.com>
 * @Date: 2020-08-21 10:23:29
 * @Version: 1.1.0
 * @Copyright: Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Row, Col, Form, Input, InputNumber } from 'hzero-ui';
import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import { getCurrentTenant, getEditTableData, getResponse } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { isEmpty } from 'lodash';
import Lov from 'components/Lov';
import LovMultiple from '@/routes/components/LovMultiple';

import { saveBatchMaintenanceRaters } from '@/services/evaluationDocManageService';

export default class BatchMaintenanceRaters extends PureComponent {
  state = {
    selectedRows: [],
    dataSource: [],
    loading: false,
  };

  /**
   *当lov变化是执行
   */
  @Bind()
  handleLovChange = (val, lovRecord = {}, record) => {
    const {
      $form: { setFieldsValue },
    } = record;
    const { userName, unitName } = lovRecord;
    setFieldsValue({ userName, respUserId: lovRecord.userId, userDepartment: unitName });
  };

  get columns() {
    const { averageFlag } = this.props;
    return [
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.scoreUser`).d('评分用户'),
        dataIndex: 'loginName',
        width: 120,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`loginName`, {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierDocManage.model.docManage.scoreUser`)
                          .d('评分用户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={record.loginName}
                    code="SSLM.KPI_CHOOSE_USER"
                    queryParams={{ tenantId: getCurrentTenant().tenantId }}
                    lovOptions={{ displayField: 'loginName', valueField: 'loginName' }}
                    onChange={(lovValue, lovRecord) =>
                      this.handleLovChange(lovValue, lovRecord, record)
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.loginName;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.userName`).d('评分用户描述'),
        dataIndex: 'userName',
        onCell: this.onCell,
        width: 120,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <Fragment>
                <Form.Item style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator('respUserId', {
                    initialValue: record.respUserId,
                  })(<div />)}
                </Form.Item>
                <Form.Item>
                  {record.$form.getFieldDecorator(`userName`, {
                    initialValue: val,
                  })(<Input disabled />)}
                </Form.Item>
              </Fragment>
            );
          } else {
            return record.userName;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.department`).d('部门'),
        dataIndex: 'userDepartment',
        width: 80,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`userDepartment`, {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
        dataIndex: 'respWeight',
        width: 80,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`respWeight`, {
                  initialValue: val,
                  rules: [
                    {
                      required: !averageFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierDocManage.model.docManage.scoreWeight`)
                          .d('权重'),
                      }),
                    },
                  ],
                })(
                  <InputNumber min={0} max={100} step={0.01} precision={2} disabled={averageFlag} />
                )}
              </Form.Item>
            );
          } else {
            return record.respWeight;
          }
        },
      },
    ];
  }

  /**
   * 保存按钮处理逻辑
   */
  @Bind()
  handleSave = () => {
    const {
      modal,
      selectedRowKeys,
      evalHeaderId,
      handleRefresh,
      query,
      selectAllFlag,
      unChooseEvalDtlIds,
    } = this.props;
    const { dataSource } = this.state;
    const isEditing = !!dataSource.find(d => d._status === 'create' || d._status === 'update');
    const dataArray = getEditTableData(dataSource, ['_status', 'evalDtlRespId']);
    if (isEditing && Array.isArray(dataArray) && dataArray.length !== 0) {
      const kpiEvalDtlRespList = dataArray;
      const body = {
        selectAllFlag,
        kpiEvalDtlRespList,
        ...query,
      };
      if (selectAllFlag === 0) {
        body.evalDtlIds = selectedRowKeys;
      } else {
        body.unChooseEvalDtlIds = unChooseEvalDtlIds;
      }
      this.setState({
        loading: true,
      });
      saveBatchMaintenanceRaters({
        evalHeaderId,
        body,
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.EVALUATIONPERSON',
      })
        .then(async res => {
          if (getResponse(res)) {
            await handleRefresh();
            modal.close();
          }
        })
        .finally(() => {
          this.setState({
            loading: false,
          });
        });
    }
  };

  @Bind()
  handleAdd = () => {
    const { dataSource } = this.state;
    const newData = {
      _status: 'create',
      loginName: '',
      userName: '',
      respWeight: '',
      evalDtlRespId: uuidv4(),
    };
    this.setState({
      dataSource: [...dataSource, newData],
    });
  };

  // 新增评分人（改为支持多选带出）
  @Bind()
  handleMultipleAdd = lovRecords => {
    const { dataSource } = this.state;
    const newData = lovRecords.map(({ loginName, userId, userName, unitName }) => ({
      _status: 'create',
      loginName,
      userName,
      respWeight: '',
      respUserId: userId,
      userDepartment: unitName,
      evalDtlRespId: uuidv4(),
    }));
    this.setState({
      dataSource: [...dataSource, ...newData],
    });
  };

  /**
   *维护评分人信息 modal 删除评分人
   *
   * @memberof DetailModal
   */
  @Bind()
  handleRemove = () => {
    const { selectedRows, dataSource } = this.state;
    const lastArray = dataSource.filter(
      n => !selectedRows.find(d => d.evalDtlRespId === n.evalDtlRespId)
    );
    this.setState({
      dataSource: lastArray,
      selectedRows: [],
    });
  };

  @Bind()
  handleSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRows });
  };

  render() {
    const { customizeTable } = this.props;
    const { dataSource, selectedRows, loading } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.evalDtlRespId),
      onChange: this.handleSelectChange,
    };
    return (
      <Fragment>
        <Row justify="end" type="flex" style={{ marginBottom: 10 }}>
          <Col span={2}>
            <Button
              style={{ marginRight: 8 }}
              onClick={this.handleRemove}
              disabled={isEmpty(selectedRows)}
            >
              {intl.get('hzero.common.button.remove').d('移除')}
            </Button>
          </Col>
          <Col span={2}>
            {/* <Button onClick={this.handleAdd}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button> */}
            <LovMultiple
              isButton
              style={{ marginRight: 8 }}
              code="SSLM.KPI_CHOOSE_USER"
              changeSelectRows={lovRecords => this.handleMultipleAdd(lovRecords)}
              originTenantId={getCurrentTenant().tenantId}
              queryParams={{ tenantId: getCurrentTenant().tenantId }}
              // lovOptions={{ valueField: 'loginName', displayField: 'loginName' }}
              buttonText={intl.get('hzero.common.button.add').d('新增')}
            />
          </Col>
          <Col span={2}>
            <Button
              style={{ marginRight: 8 }}
              type="primary"
              onClick={this.handleSave}
              loading={loading}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          </Col>
        </Row>
        {customizeTable(
          {
            code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.EVALUATIONPERSON',
          },
          <EditTable
            columns={this.columns}
            dataSource={dataSource}
            bordered
            loading={loading}
            pagination={false}
            rowSelection={rowSelection}
            rowKey="evalDtlRespId"
          />
        )}
      </Fragment>
    );
  }
}
