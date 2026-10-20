/**
 * 相关标准化
 * @date: 2019-12-24
 * @author: JCZ <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import { Form, Input, Button, Row, Col, Select, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, addItemToPagination } from 'utils/utils';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { throttle } from 'lodash';

const prefix = `sqam.common.model.8d`;
const { TextArea } = Input;
@connect(({ relateStandard, loading }) => ({
  relateStandard,
  relateStandardLoading: loading.effects['relateStandard/fetchData'],
  tenantId: getCurrentOrganizationId(),
}))
export default class GroupMemberPanel extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'relateStandard/init',
    });
  }

  componentWillUnmount() {
    const { dispatch, stateKey } = this.props;
    if (stateKey) {
      dispatch({
        type: 'relateStandard/updateState',
        payload: {
          [stateKey]: {
            relateStandardList: [],
            relateStandardPagination: {},
          },
        },
      });
    }
    dispatch({
      type: 'relateStandard/updateState',
      payload: {
        relateStandardList: [],
        relateStandardPagination: {},
      },
    });
  }

  @Bind()
  handleStandardSolutionAdd() {
    const { relateStandard = {}, dispatch, stateKey } = this.props;
    const { relateStandardList = [], relateStandardPagination = {} } = stateKey
      ? relateStandard[stateKey] || {}
      : relateStandard;
    const { current, pageSize, total } = relateStandardPagination;
    if (current * pageSize < total) {
      notification.warning({
        message: intl.get(`${prefix}.toLastStandardPage`).d('请翻至最后一页新建相关标准化行'),
      });
      return;
    }
    if (stateKey) {
      dispatch({
        type: 'relateStandard/updateState',
        payload: {
          [stateKey]: {
            relateStandardList: [
              ...relateStandardList,
              {
                _status: 'create',
                relevantStandardId: uuidv4(),
              },
            ],
            relateStandardPagination: addItemToPagination(
              relateStandardList.length,
              relateStandardPagination
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'relateStandard/updateState',
        payload: {
          relateStandardList: [
            ...relateStandardList,
            {
              _status: 'create',
              relevantStandardId: uuidv4(),
            },
          ],
          relateStandardPagination: addItemToPagination(
            relateStandardList.length,
            relateStandardPagination
          ),
        },
      });
    }
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, edProblemHeaderId, tenantId, code, stateKey } = this.props;
    dispatch({
      type: 'relateStandard/fetchData',
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
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'relateStandard');
  }

  render() {
    const {
      remote,
      customizeTable,
      code,
      custLoading,
      readOnly = true,
      // required = false,
      selectedRowKeys = [],
      dataSource = [],
      // onAdd = e => e,
      pagination = {},
      onRemove = (e) => e,
      loading,
      deleteLoading,
      relateStandardLoading,
      relateStandard = {},
      collaborativeModeFlag = false,
      type,
    } = this.props;
    const { current, pageSize } = pagination;
    const {
      enumMap: { standardItems = [] },
    } = relateStandard;
    const cols = [
      {
        title: intl.get(`${prefix}.orderNum`).d('序号'),
        dataIndex: 'relevantStandardId',
        align: 'center',
        width: 50,
        render: (val, record, index) => {
          return pageSize * (current - 1) + index + 1;
        },
      },
      {
        title: intl.get(`${prefix}.standard`).d('标准化项'),
        dataIndex: 'standardCode',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`standardCode`, {
                initialValue: val,
              })(
                <Select disabled={readOnly} allowClear style={{ width: '100%' }}>
                  {standardItems.map((item) => (
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
        title: intl.get(`${prefix}.standardActionDesc`).d('措施详情'),
        dataIndex: 'standardActionDesc',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`standardActionDesc`, {
                initialValue: val,
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.handleFlag`).d('是否已处理'),
        dataIndex: 'handleFlag',
        align: 'center',
        width: 60,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`handleFlag`, {
                initialValue: !!val,
              })(<Checkbox disabled={readOnly} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.remark`).d('备注'),
        dataIndex: 'standardRemark',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`standardRemark`, {
                initialValue: val,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const columns=remote
    ?remote.process("SQAM_COMPONENTS_RELATE_STANDARD_TABLE_COLUMNS",cols,{_this:this})
    : cols;
    const isLoading = loading || deleteLoading || relateStandardLoading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            {(type !== 'create' || collaborativeModeFlag) && (
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button loading={isLoading} icon="plus" onClick={throttle(this.handleStandardSolutionAdd, 1500, { trailing: false })}>
                  {intl.get(`${prefix}.add`).d('新增')}
                </Button>
                <Button
                  icon="delete"
                  loading={isLoading}
                  onClick={throttle(onRemove, 1500, { trailing: false })}
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
                custLoading,
              },
              <EditTable
                bordered
                rowKey="relevantStandardId"
                dataSource={dataSource}
                columns={columns}
                loading={isLoading}
                pagination={pagination}
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
