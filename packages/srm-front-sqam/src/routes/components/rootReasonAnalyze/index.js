/**
 * 根本原因分析
 * @date: 2019-12-24
 * @author: JCZ <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId, addItemToPagination } from 'utils/utils';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { throttle } from 'lodash';

const { TextArea } = Input;
const prefix = `sqam.common.model.8d`;
@connect(({ rootReasonAnalyze, loading }) => ({
  rootReasonAnalyze,
  rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
  tenantId: getCurrentOrganizationId(),
}))
export default class GroupMemberPanel extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'rootReasonAnalyze/init',
    });
  }

  componentWillUnmount() {
    const { dispatch, stateKey } = this.props;
    if (stateKey) {
      dispatch({
        type: 'rootReasonAnalyze/updateState',
        payload: {
          [stateKey]: {
            rootReasonAnalyzeList: [],
            rootReasonAnalyzePagination: {},
          },
        },
      });
    }
    dispatch({
      type: 'rootReasonAnalyze/updateState',
      payload: {
        rootReasonAnalyzeList: [],
        rootReasonAnalyzePagination: {},
        customizeUnitCode: 'SQAM.INITIATED_8D.DETAIL.ROOTCAUSE',
      },
    });
  }

  @Bind()
  handleRootReasonAdd() {
    const { rootReasonAnalyze = {}, dispatch, stateKey } = this.props;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = stateKey
      ? rootReasonAnalyze[stateKey] || {}
      : rootReasonAnalyze;
    const { current, pageSize, total } = rootReasonAnalyzePagination;
    if (current * pageSize < total) {
      notification.warning({
        message: intl
          .get(`${prefix}.toLastAnalyzeReasonPage`)
          .d('请翻至最后一页新建根本原因分析行'),
      });
      return;
    }
    if (stateKey) {
      dispatch({
        type: 'rootReasonAnalyze/updateState',
        payload: {
          [stateKey]: {
            rootReasonAnalyzeList: [
              ...rootReasonAnalyzeList,
              {
                _status: 'create',
                rootCauseId: uuidv4(),
              },
            ],
            rootReasonAnalyzePagination: addItemToPagination(
              rootReasonAnalyzeList.length,
              rootReasonAnalyzePagination
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'rootReasonAnalyze/updateState',
        payload: {
          rootReasonAnalyzeList: [
            ...rootReasonAnalyzeList,
            {
              _status: 'create',
              rootCauseId: uuidv4(),
            },
          ],
          rootReasonAnalyzePagination: addItemToPagination(
            rootReasonAnalyzeList.length,
            rootReasonAnalyzePagination
          ),
        },
      });
    }
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, edProblemHeaderId, tenantId, code, stateKey } = this.props;
    dispatch({
      type: 'rootReasonAnalyze/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId,
        page,
        customizeUnitCode: code,
        stateKey,
      },
    });
  }

  /**
   * 行操作
   * @param {array} selectedRowKeys - 选中行Rowkey
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'rootReason');
  } 

  render() {
    const {
      remote,
      readOnly = true,
      // required = false,
      selectedRowKeys = [],
      dataSource = [],
      // onAdd = e => e,
      rootAnalyzeLoading,
      pagination = {},
      onRemove = (e) => e,
      loading,
      deleteLoading,
      rootReasonAnalyze = {},
      customizeTable,
      code,
      custLoading,
      collaborativeModeFlag = false,
      type,
    } = this.props;
    const {
      enumMap: { reasonType = [] },
    } = rootReasonAnalyze;
    const { current, pageSize } = pagination;
    const cols = [
      {
        title: intl.get(`${prefix}.orderNum`).d('序号'),
        dataIndex: 'rootCauseId',
        align: 'center',
        width: 80,
        render: (val, record, index) => {
          return pageSize * (current - 1) + index + 1;
        },
      },
      {
        title: intl.get(`${prefix}.rootCauseType`).d('原因类型'),
        dataIndex: 'rootCauseTypeCode',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`rootCauseTypeCode`, {
                initialValue: val,
              })(
                <Select disabled={readOnly} allowClear style={{ width: '100%' }}>
                  {reasonType.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
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
        title: intl.get(`${prefix}.occurCause`).d('发生原因'),
        dataIndex: 'occurCause',
        align: 'center',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`occurCause`, {
                initialValue: val,
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.flowOutCause`).d('流出原因'),
        dataIndex: 'flowOutCause',
        align: 'center',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`flowOutCause`, {
                initialValue: val,
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.preventCause`).d('未预防的原因'),
        dataIndex: 'preventCause',
        align: 'center',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`preventCause`, {
                initialValue: val,
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const columns = remote
    ? remote.process("SQAM_COMPONENTS_ROOT_REASON_ANALYZE_TABLE_COLUMS",cols,{_this:this})
    : cols;
    const isLoading = deleteLoading || loading || rootAnalyzeLoading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            {(type !== 'create' || collaborativeModeFlag) && (
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button loading={isLoading} icon="plus" onClick={throttle(this.handleRootReasonAdd, 1500, { trailing: false })}>
                  {intl.get(`${prefix}.add`).d('新增')}
                </Button>
                <Button
                  icon="delete"
                  onClick={throttle(onRemove, 1500, { trailing: false })}
                  loading={isLoading}
                  disabled={selectedRowKeys.length === 0}
                  style={{ marginLeft: 16 }}
                >
                  {intl.get(`${prefix}.del`).d('删除')}
                </Button>
              </div>
            )}

            {customizeTable(
              {
                code,
              },
              <EditTable
                bordered
                rowKey="rootCauseId"
                loading={isLoading}
                dataSource={dataSource}
                columns={columns}
                pagination={pagination}
                custLoading={custLoading}
                onChange={this.handleSearch}
                rowSelection={
                  readOnly
                    ? null
                    : {
                        selectedRowKeys,
                        onChange: this.handleRowSelect,
                      }
                }
              />
            )}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
