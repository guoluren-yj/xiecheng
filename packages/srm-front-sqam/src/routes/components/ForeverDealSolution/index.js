/**
 * 永久纠正措施
 * @date: 2019-12-24
 * @author: JCZ <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, getDateFormat, addItemToPagination } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import moment from 'moment';
import notification from 'utils/notification';
import { throttle } from 'lodash';

const { TextArea } = Input;
const prefix = `sqam.common.model.8d`;
@connect(({ foreverDealSolution, loading }) => ({
  foreverDealSolution,
  foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
  tenantId: getCurrentOrganizationId(),
}))
export default class GroupMemberPanel extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this, 'forever');
  }

  componentDidMount() {
    this.handleSearch();
  }

  componentWillUnmount() {
    const { dispatch, stateKey } = this.props;
    if (stateKey) {
      dispatch({
        type: 'foreverDealSolution/updateState',
        payload: {
          [stateKey]: {
            foreverDealSolutionList: [],
            foreverDealSolutionPagination: {},
          },
        },
      });
    }
    dispatch({
      type: 'foreverDealSolution/updateState',
      payload: {
        foreverDealSolutionList: [],
        foreverDealSolutionPagination: {},
      },
    });
  }

  @Bind()
  handleForeverSolutionAdd() {
    const { foreverDealSolution = {}, dispatch, stateKey } = this.props;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = stateKey
      ? foreverDealSolution[stateKey] || {}
      : foreverDealSolution;
    const { current, pageSize, total } = foreverDealSolutionPagination;
    if (current * pageSize < total) {
      notification.warning({
        message: intl.get(`${prefix}.toLastTips3Page`).d('请翻至最后一页新建永久纠正措施行'),
      });
      return;
    }
    if (stateKey) {
      dispatch({
        type: 'foreverDealSolution/updateState',
        payload: {
          [stateKey]: {
            foreverDealSolutionList: [
              ...foreverDealSolutionList,
              {
                _status: 'create',
                pcaActionId: uuidv4(),
              },
            ],
            foreverDealSolutionPagination: addItemToPagination(
              foreverDealSolutionList.length,
              foreverDealSolutionPagination
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'foreverDealSolution/updateState',
        payload: {
          foreverDealSolutionList: [
            ...foreverDealSolutionList,
            {
              _status: 'create',
              pcaActionId: uuidv4(),
            },
          ],
          foreverDealSolutionPagination: addItemToPagination(
            foreverDealSolutionList.length,
            foreverDealSolutionPagination
          ),
        },
      });
    }
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, edProblemHeaderId, tenantId, code, stateKey } = this.props;
    dispatch({
      type: 'foreverDealSolution/fetchData',
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
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'foreverSolution');
  }

  render() {
    const {
      remote,
      customizeTable,
      code,
      custLoading,
      readOnly = true,
      required = false,
      selectedRowKeys = [],
      dataSource = [],
      // onAdd = e => e,
      pagination = {},
      onRemove = (e) => e,
      loading,
      foreverSolutionLoading,
      deleteLoading,
      collaborativeModeFlag = false,
      type,
    } = this.props;
    const { current, pageSize } = pagination;
    const cols = [
      {
        title: intl.get(`${prefix}.orderNum`).d('序号'),
        dataIndex: 'pcaActionId',
        align: 'center',
        width: 50,
        render: (val, record, index) => {
          return pageSize * (current - 1) + index + 1;
        },
      },
      {
        title: intl.get(`${prefix}.measureDesc`).d('措施详述'),
        dataIndex: 'pcaActionDesc',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`pcaActionDesc`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.measureDesc`).d('措施详述'),
                    }),
                  },
                ],
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.measureCheck`).d('措施验证'),
        dataIndex: 'pcaActionRemark',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`pcaActionRemark`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.measureCheck`).d('措施验证'),
                    }),
                  },
                ],
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.chargeName`).d('责任人'),
        dataIndex: 'pcaChangeName',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`pcaChangeName`, {
                initialValue: val,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.finishDate`).d('完成时间'),
        dataIndex: 'pcaActionEndDate',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`pcaActionEndDate`, {
                initialValue: record.pcaActionEndDate ? moment(record.pcaActionEndDate) : null,
              })(<DatePicker disabled={readOnly} format={getDateFormat()} placeholder={null} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const columns = remote
    ?remote.process("SQAM_COMPONENTS_FOREVER_DEAL_SOLUTION_TABLE_COLUMNS",cols,{_this:this})
    :cols;
    const isLoading = loading || foreverSolutionLoading || deleteLoading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            {(type !== 'create' || collaborativeModeFlag) && (
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button loading={isLoading} icon="plus" onClick={throttle(this.handleForeverSolutionAdd, 1500, { trailing: false })}>
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
                rowKey="pcaActionId"
                dataSource={dataSource}
                loading={isLoading}
                columns={columns}
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
