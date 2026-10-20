/**
 * 相关标准化
 * @date: 2019-12-24
 * @author: JCZ <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Select, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId, addItemToPagination } from 'utils/utils';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { throttle } from 'lodash';

const prefix = `sqam.common.model.8d`;
@connect(({ isSuitUnderItem, loading }) => ({
  isSuitUnderItem,
  tenantId: getCurrentOrganizationId(),
  isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
}))
export default class GroupMemberPanel extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'isSuitUnderItem/init',
    });
  }

  componentWillUnmount() {
    const { dispatch, stateKey } = this.props;
    if (stateKey) {
      dispatch({
        type: 'isSuitUnderItem/updateState',
        payload: {
          [stateKey]: {
            isSuitUnderItemList: [],
            isSuitUnderItemPagination: {},
          },
        },
      });
    }
    dispatch({
      type: 'isSuitUnderItem/updateState',
      payload: {
        isSuitUnderItemList: [],
        isSuitUnderItemPagination: {},
      },
    });
  }

  @Bind()
  handleIsSuitUnderItemAdd() {
    const { isSuitUnderItem = {}, dispatch, stateKey } = this.props;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = stateKey
      ? isSuitUnderItem[stateKey] || {}
      : isSuitUnderItem;
    const { current, pageSize, total } = isSuitUnderItemPagination;
    if (current * pageSize < total) {
      notification.warning({
        message: intl
          .get(`${prefix}.toLastApplyItemPage`)
          .d('请翻至最后一页新建是否适用以下项目行'),
      });
      return;
    }
    if (stateKey) {
      dispatch({
        type: 'isSuitUnderItem/updateState',
        payload: {
          [stateKey]: {
            isSuitUnderItemList: [
              ...isSuitUnderItemList,
              {
                _status: 'create',
                applicableItemsId: uuidv4(),
              },
            ],
            isSuitUnderItemPagination: addItemToPagination(
              isSuitUnderItemList.length,
              isSuitUnderItemPagination
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'isSuitUnderItem/updateState',
        payload: {
          isSuitUnderItemList: [
            ...isSuitUnderItemList,
            {
              _status: 'create',
              applicableItemsId: uuidv4(),
            },
          ],
          isSuitUnderItemPagination: addItemToPagination(
            isSuitUnderItemList.length,
            isSuitUnderItemPagination
          ),
        },
      });
    }
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, edProblemHeaderId, tenantId, code, stateKey } = this.props;
    dispatch({
      type: 'isSuitUnderItem/fetchData',
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
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'isSuitUnderItem');
  }

  render() {
    const {
      remote,
      customizeTable,
      code,
      custLoading,
      readOnly = true,
      //   required,
      selectedRowKeys = [],
      dataSource = [],
      // onAdd = e => e,
      pagination = {},
      onRemove = (e) => e,
      loading,
      isSuitUnderItemLoading,
      deleteLoading,
      isSuitUnderItem = {},
      collaborativeModeFlag = false,
      type,
    } = this.props;
    const { current, pageSize } = pagination;
    const {
      enumMap: { otherItems = [] },
    } = isSuitUnderItem;
    const cols = [
      {
        title: intl.get(`${prefix}.orderNum`).d('序号'),
        dataIndex: 'applicableItemsId',
        align: 'center',
        width: 50,
        render: (val, record, index) => {
          return pageSize * (current - 1) + index + 1;
        },
      },
      {
        title: intl.get(`${prefix}.otherItem`).d('其他项目'),
        dataIndex: 'applicationItemCode',
        align: 'center',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`applicationItemCode`, {
                initialValue: val,
              })(
                <Select disabled={readOnly} allowClear style={{ width: '100%' }}>
                  {otherItems.map((item) => (
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
        title: intl.get(`${prefix}.itemDesc`).d('项目说明'),
        dataIndex: 'itemDesc',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`itemDesc`, {
                initialValue: val,
              })(<Input disabled={readOnly} />)}
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
        dataIndex: 'itemRemark',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`itemRemark`, {
                initialValue: val,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const columns = remote
    ?remote.process("SQAM_COMPONENTS_IS_SUIT_UNDER_ITEM_TABLE_COLUMNS",cols,{_this:this})
    :cols;
    const isLoading = loading || isSuitUnderItemLoading || deleteLoading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            {(type !== 'create' || collaborativeModeFlag) && (
              <div
                className="table-groupMember-operator"
                style={{ display: readOnly ? 'none' : 'block', marginBottom: 16 }}
              >
                <Button loading={isLoading} icon="plus" onClick={throttle(this.handleIsSuitUnderItemAdd, 1500, { trailing: false })}>
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
                rowKey="applicableItemsId"
                dataSource={dataSource}
                loading={isLoading}
                columns={columns}
                onChange={this.handleSearch}
                pagination={pagination}
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
