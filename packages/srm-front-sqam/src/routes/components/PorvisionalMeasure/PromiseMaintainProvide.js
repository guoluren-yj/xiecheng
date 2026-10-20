/**
 * 保持持续供货
 * @date: 2019-12-24
 * @author: JCZ <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Form, Input, Button, Row, Col, InputNumber, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { sum, throttle } from 'lodash';
import { getDateFormat, addItemToPagination } from 'utils/utils';
import moment from 'moment';
import { thousandBitSeparator } from '@/routes/utils.js';
import notification from 'utils/notification';
import styles from './index.less';

const prefix = `sqam.common.model.8d`;
const { TextArea } = Input;

@connect(({ promiseMaintainProvide, loading }) => ({
  promiseMaintainProvide,
  promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
}))
export default class GroupMemberPanel extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'promiseMaintainProvide/init',
    });
  }

  componentWillUnmount() {
    const { dispatch, stateKey } = this.props;
    if (stateKey) {
      dispatch({
        type: 'promiseMaintainProvide/updateState',
        payload: {
          [stateKey]: {
            promiseMaintainProvideList: [],
            promiseMaintainProvidePagination: {},
          },
        },
      });
    }
    dispatch({
      type: 'promiseMaintainProvide/updateState',
      payload: {
        promiseMaintainProvideList: [],
        promiseMaintainProvidePagination: {},
      },
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, edProblemHeaderId, tenantId, code, stateKey } = this.props;
    dispatch({
      type: 'promiseMaintainProvide/fetchData',
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
   * 新增
   * 保证持续供货
   */
  @Bind()
  handleContinueSupplyAdd() {
    const { promiseMaintainProvide = {}, dispatch, stateKey } = this.props;
    const { promiseMaintainProvideList = [], promiseMaintainProvidePagination = {} } = stateKey
      ? promiseMaintainProvide[stateKey] || {}
      : promiseMaintainProvide;
    const { current, pageSize, total } = promiseMaintainProvidePagination;
    if (current * pageSize < total) {
      notification.warning({
        message: intl
          .get(`sqam.common.model.8d.toLastPromiseMaintainProvide`)
          .d('请翻至最后一页新建临时围堵措施—保证持续供货'),
      });
      return;
    }
    if (stateKey) {
      dispatch({
        type: 'promiseMaintainProvide/updateState',
        payload: {
          [stateKey]: {
            promiseMaintainProvideList: [
              ...promiseMaintainProvideList,
              {
                _status: 'create',
                edProblemTeamId: uuidv4(),
              },
            ],
            promiseMaintainProvidePagination: addItemToPagination(
              promiseMaintainProvideList.length,
              promiseMaintainProvidePagination
            ),
          },
        },
      });
    } else {
      dispatch({
        type: 'promiseMaintainProvide/updateState',
        payload: {
          promiseMaintainProvideList: [
            ...promiseMaintainProvideList,
            {
              _status: 'create',
              edProblemTeamId: uuidv4(),
            },
          ],
          promiseMaintainProvidePagination: addItemToPagination(
            promiseMaintainProvideList.length,
            promiseMaintainProvidePagination
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
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'continueSupply');
  }

  render() {
    const {
      remote,
      readOnly = true,
      required = false,
      selectedRowKeys = [],
      dataSource = [],
      onRemove = (e) => e,
      pagination = {},
      promiseMaintainProvide = {},
      deleteLoading,
      loading,
      code,
      customizeTable,
      custLoading,
      promiseMaintainProvideLoading,
      collaborativeModeFlag = false,
      type,
    } = this.props;
    const {
      enumMap: { inventoryDistributes = [] },
    } = promiseMaintainProvide;
    const cols = [
      {
        title: intl.get(`${prefix}.inventoryCode`).d('库存分布'),
        dataIndex: 'inventoryCode',
        align: 'center',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`inventoryCode`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.inventoryCode`).d('库存分布'),
                    }),
                  },
                ],
              })(
                <Select disabled={readOnly} allowClear style={{ width: '100%' }}>
                  {inventoryDistributes.map((n) => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.inventoryCodeMeaning
          ),
      },
      {
        title: intl.get(`${prefix}.effectFlag`).d('是否影响'),
        dataIndex: 'effectFlag',
        align: 'center',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`effectFlag`, {
                initialValue: val,
              })(<Checkbox disabled />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${prefix}.doubtfulQuantity`).d('可疑数量'),
        dataIndex: 'doubtfulQuantity',
        align: 'center',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`doubtfulQuantity`, {
                initialValue: val,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  allowThousandth
                  disabled={readOnly}
                  min={0}
                />
              )}
            </Form.Item>
          ) : (
            // val
            thousandBitSeparator(val)
          ),
      },
      {
        title: intl.get(`${prefix}.badQuantity`).d('不良品数量'),
        dataIndex: 'badQuantity',
        align: 'center',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`badQuantity`, {
                initialValue: val,
              })(
                <InputNumber
                  allowThousandth
                  disabled={readOnly}
                  style={{ width: '100%' }}
                  min={0}
                  onChange={(value) => {
                    record.$form.setFieldsValue({ effectFlag: value ? 1 : 0 });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            // val
            thousandBitSeparator(val)
          ),
      },
      {
        title: intl.get(`${prefix}.handleMeasure`).d('处理措施'),
        dataIndex: 'measures',
        align: 'center',
        width: 240,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`measures`, {
                initialValue: val,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.handleMeasure`).d('处理措施'),
                    }),
                  },
                ],
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            <div id="bad-disabled-wrapper">
              <TextArea
                disabled
                defaultValue={val}
                className={styles['bad-new-disabled-textarea']}
                row={2}
              />
            </div>
          ),
      },
      {
        title: intl.get(`${prefix}.chargeName`).d('责任人'),
        dataIndex: 'supplyChargeName',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`supplyChargeName`, {
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
        dataIndex: 'suppliyEndDate',
        align: 'center',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`suppliyEndDate`, {
                initialValue: record.suppliyEndDate ? moment(record.suppliyEndDate) : undefined,
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
      {
        title: intl.get(`${prefix}.remark`).d('备注'),
        dataIndex: 'supplyActionRemark',
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !readOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`supplyActionRemark`, {
                initialValue: val,
              })(<TextArea disabled={readOnly} row={2} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const columns = remote
    ?remote.process("SQAM_COMPONENTS_PROMISE_MAINTAIN_PROVIDE_TABLE_COLUMNS",cols,{_this:this})
    : cols;
    const isLoading = deleteLoading || loading || promiseMaintainProvideLoading;
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
                  icon="plus"
                  loading={isLoading}
                  onClick={throttle(this.handleContinueSupplyAdd, 1500, { trailing: false })}
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
                clearCache: (a, b, cb) => {
                  if (a !== b) {
                    cb(a);
                  }
                },
              },
              <EditTable
                bordered
                loading={isLoading}
                rowKey="edProblemTeamId"
                dataSource={dataSource.filter((item) => item.deleteFlag !== 1)}
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
                scroll={{ x: sum(columns.map((n) => n.width)) + 400 }}
              />
            )}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
