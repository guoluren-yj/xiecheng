/**
 * 针对后续生产
 * @date: 2019-12-24
 * @author: JCZ <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId, getDateFormat, addItemToPagination } from 'utils/utils';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { connect } from 'dva';
import moment from 'moment';
import notification from 'utils/notification';
import { throttle } from 'lodash';
import { dateRender } from 'utils/renderer';

const prefix = `sqam.common.model.8d`;
const { TextArea } = Input;

@connect(({ followUpProduce, loading }) => ({
  followUpProduce,
  followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
  tenantId: getCurrentOrganizationId(),
}))
export default class GroupMemberPanel extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this, 'followUp');
  }

  componentDidMount() {
    this.handleSearch();
  }

  componentWillUnmount() {
    const { dispatch, stateKey } = this.props;
    if (stateKey) {
      dispatch({
        type: 'followUpProduce/updateState',
        payload: {
          [stateKey]: {
            followUpProduceList: [],
            followUpProducePagination: {},
          },
        },
      });
    }
    dispatch({
      type: 'followUpProduce/updateState',
      payload: {
        followUpProduceList: [],
        followUpProducePagination: {},
      },
    });
  }

  /**
   * 新增
   * 保证持续供货
   */
  @Bind()
  handleFollowUpAdd() {
    const { followUpProduce = {}, dispatch, stateKey } = this.props;
    const { followUpProduceList = [], followUpProducePagination = {} } = stateKey
      ? followUpProduce[stateKey] || {}
      : followUpProduce;
    const { current, pageSize, total } = followUpProducePagination;
    if (current * pageSize < total) {
      notification.warning({
        message: intl
          .get(`sqam.common.model.8d.toLastShortMeaturePage`)
          .d('请翻至最后一页新建短期措施行'),
      });
      return;
    }
    if (stateKey) {
      dispatch({
        type: 'followUpProduce/updateState',
        payload: {
          [stateKey]: {
            followUpProduceList: [
              ...followUpProduceList,
              {
                _status: 'create',
                produceActionId: uuidv4(),
              },
            ],
            followUpProducePagination: addItemToPagination(
              followUpProduceList.length,
              followUpProducePagination
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'followUpProduce/updateState',
        payload: {
          followUpProduceList: [
            ...followUpProduceList,
            {
              _status: 'create',
              produceActionId: uuidv4(),
            },
          ],
          followUpProducePagination: addItemToPagination(
            followUpProduceList.length,
            followUpProducePagination
          ),
        },
      });
    }
  }

  /**
   * 行操作
   * @param {array} selectedRowKeys - 选中行Rowkey
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'followUp');
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, edProblemHeaderId, tenantId, code, stateKey } = this.props;
    dispatch({
      type: 'followUpProduce/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId,
        page,
        customizeUnitCode: code,
        stateKey,
      },
    });
  }

  render() {
    const {
      remote,
      readOnly = true,
      required = false,
      selectedRowKeys = [],
      dataSource = [],
      pagination = {},
      // onAdd = e => e,
      onRemove = (e) => e,
      loading,
      deleteLoading,
      followUpProduceLoading,
      customizeTable,
      code,
      custLoading,
      collaborativeModeFlag = false,
      type,
    } = this.props;
    const { current, pageSize } = pagination;
    const cols = [
      {
        title: intl.get(`${prefix}.orderNum`).d('序号'),
        dataIndex: 'produceActionId',
        align: 'center',
        width: 50,
        render: (val, record, index) => {
          return pageSize * (current - 1) + index + 1;
        },
      },
      {
        title: intl.get(`${prefix}.measureDesc`).d('措施详述'),
        dataIndex: 'measuresDesc',
        align: 'center',
        width: 210,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`measuresDesc`, {
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
        dataIndex: 'produceActionRemark',
        align: 'center',
        width: 210,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`produceActionRemark`, {
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
        dataIndex: 'produceChargeName',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`produceChargeName`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.chargeName`).d('责任人'),
                    }),
                  },
                ],
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.finishDate`).d('完成时间'),
        dataIndex: 'produceEndDate',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`produceEndDate`, {
                initialValue: record.produceEndDate ? moment(record.produceEndDate) : undefined,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.finishDate`).d('完成时间'),
                    }),
                  },
                ],
              })(<DatePicker disabled={readOnly} format={getDateFormat()} placeholder={null} />)}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
    ];
    const columns=remote
    ?remote.process("SQAM_COMPONENTS_FOLLOW_UP_PRODUCE_TABLE_COLUMNS",cols,{_this: this})
    :cols;
    const isLoading = deleteLoading || followUpProduceLoading || loading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            {(type !== 'create' || collaborativeModeFlag) && (
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button
                  loading={isLoading}
                  icon="plus"
                  onClick={throttle(this.handleFollowUpAdd, 1500, { trailing: false })}
                >
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
                rowKey="produceActionId"
                loading={isLoading}
                dataSource={dataSource}
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
