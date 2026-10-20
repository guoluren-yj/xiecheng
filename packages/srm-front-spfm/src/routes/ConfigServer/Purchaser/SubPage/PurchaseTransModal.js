/**
 * PurchaseTransModal -采购事务类配置
 * @date: 2018-12-18
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Button, Form, Input, Checkbox, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isNumber, sum, omit } from 'lodash';

import uuidv4 from 'uuid/v4';

import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  delItemToPagination,
  addItemToPagination,
  getEditTableData,
} from 'utils/utils';
import EditTable from 'components/EditTable';

import styles from './index.less';
@connect(({ loading, configServer }) => ({
  loading: loading.effects['configServer/fetchRcvTrxTypeListPurchase'],
  saveLoading: loading.effects['configServer/saveRcvTrxTypePurchase'],
  configServer,
}))
export default class PurchaseTransModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.fetchRcvTrxTypeList();
  }

  @Bind()
  fetchRcvTrxTypeList(params = {}) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'configServer/fetchRcvTrxTypeListPurchase',
      payload: {
        organizationId,
        fromConfigCenterFlag: 1,
        page: isEmpty(params) ? {} : params,
      },
    });
  }

  @Bind()
  hideModal() {
    const { onHandleShowPurchaseTrans } = this.props;
    if (onHandleShowPurchaseTrans) {
      onHandleShowPurchaseTrans('purchaseTransVisible', false);
    }
  }

  @Bind()
  handleCreateData() {
    const {
      dispatch,
      configServer: {
        trxTypeList: { content = [] },
        trxTypePagination = {},
      },
    } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        trxTypeList: {
          content: [
            {
              rcvTrxTypeId: uuidv4(),
              externalSystemCode: 'SRM',
              refTrxTypeId: '',
              rcvTrxTypeCode: '',
              rcvTrxTypeName: '',
              enabledFlag: 1,
              refTrxTypeCode: '',
              refTrxTypeName: '',
              sourceCode: 'SRM',
              externalSystemName: 'SRM',
              tenantId: organizationId,
              _status: 'create',
            },
            ...(content || []),
          ],
        },
        trxTypePagination: addItemToPagination(content.length, trxTypePagination),
      },
    });
  }

  /**
   * 取消新建
   * @param {*Object} record 行记录
   */
  @Bind()
  handleCancelOrg(record = {}) {
    const {
      dispatch,
      configServer: {
        trxTypeList: { content = [] },
        trxTypePagination = {},
      },
    } = this.props;
    const endData = content.filter((item) => item.rcvTrxTypeId !== record.rcvTrxTypeId);
    dispatch({
      type: 'configServer/updateState',
      payload: {
        trxTypeList: {
          content: [...endData],
        },
        trxTypePagination: delItemToPagination(content.length, trxTypePagination),
      },
    });
  }

  /**
   * 取消编辑
   * @param {*Object} record 行记录
   * @param {*Boolean} flag 编辑状态
   */
  @Bind()
  handleOrgEdit(record = {}, flag) {
    const {
      dispatch,
      configServer: {
        trxTypeList: { content = [] },
      },
    } = this.props;
    const newContent = content.map((item) => {
      if (item.rcvTrxTypeId === record.rcvTrxTypeId) {
        if (flag) {
          return { ...item, _status: 'update' };
        } else {
          return omit(item, ['_status', '$form']);
        }
      }
      return item;
    });

    dispatch({
      type: 'configServer/updateState',
      payload: {
        trxTypeList: {
          content: newContent,
        },
      },
    });
  }

  /**
   * 带出采购事务名称
   */
  @Bind()
  changeTransCode(record = {}, lovRecord = {}) {
    const { setFieldsValue } = record.$form;
    setFieldsValue({ refTrxTypeName: lovRecord.rcvTrxTypeName });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveData() {
    const {
      dispatch,
      configServer: {
        trxTypeList: { content = [] },
        trxTypePagination = {},
      },
    } = this.props;
    const params = getEditTableData(content, ['rcvTrxTypeId']);
    if (Array.isArray(params) && params.length === 0) {
      return;
    }
    const endParams = params.map((item, index, arr) => {
      const {
        externalSystemCode,
        externalSystemName,
        refTrxTypeId,
        refTrxTypeCode,
        ...otherValues
      } = item;
      debugger;
      const flagIndex = content.findIndex((o) => {
        return o.rcvTrxTypeId === arr[index].rcvTrxTypeId;
      });
      const externalSystem =
        externalSystemCode && (externalSystemCode !== 'SRM') === externalSystemName
          ? content[flagIndex].externalSystemCode
          : externalSystemCode;
      const refTrxType =
        refTrxTypeId === refTrxTypeCode ? content[flagIndex].refTrxTypeId : refTrxTypeId;
      return {
        externalSystemCode: externalSystem,
        externalSystemName,
        refTrxTypeId: refTrxType,
        refTrxTypeCode,
        ...otherValues,
      };
    });
    dispatch({
      type: 'configServer/saveRcvTrxTypePurchase',
      payload: [...endParams],
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchRcvTrxTypeList(trxTypePagination);
      }
    });
  }

  @Bind()
  handleChangeSource(value, record) {
    const {
      rcvTrxTypeId,
      $form: { setFieldsValue },
    } = record;
    const {
      dispatch,
      configServer: {
        trxTypeList: { content = [] },
      },
    } = this.props;
    const newContent = content.map((item) => {
      if (item.rcvTrxTypeId === rcvTrxTypeId) {
        if (value === 'SRM') {
          setFieldsValue({ externalSystemCode: value });
          return {
            ...item,
            displayExternalSystemName: 'SRM',
          };
        } else {
          setFieldsValue({ externalSystemCode: undefined });
          return {
            ...item,
            displayExternalSystemName: undefined,
          };
        }
      } else {
        return item;
      }
    });
    dispatch({
      type: 'configServer/updateState',
      payload: {
        trxTypeList: {
          content: newContent,
        },
      },
    });
  }

  render() {
    const {
      loading,
      saveLoading,
      purchaseTransVisible,
      configServer: { trxTypeList = {}, trxTypePagination = {}, enumMap = {} },
    } = this.props;
    const { sourceFrom = [] } = enumMap;
    const { content: dataSource = [] } = trxTypeList;
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.purchaser.sourceCode`).d('数据来源'),
        dataIndex: 'sourceCode',
        width: 160,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('sourceCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.model.purchaser.sourceCode`)
                          .d('数据来源'),
                      }),
                    },
                  ],
                  initialValue: record.sourceCode,
                })(
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      setTimeout(() => this.forceUpdate(), 600);
                      this.handleChangeSource(value, record);
                    }}
                  >
                    {sourceFrom.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.externalSystemCode`).d('外部系统代码'),
        dataIndex: 'externalSystemCode',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('externalSystemCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.model.purchaser.externalSystemCode`)
                          .d('外部系统代码'),
                      }),
                    },
                  ],
                  initialValue: record.externalSystemCode,
                })(
                  <Lov
                    code="SITF.ES_RELATIONS"
                    textField="externalSystemCode"
                    disabled={getFieldValue('sourceCode') === 'SRM'}
                    onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.rcvTrxTypeCode`).d('事务类型编码'),
        dataIndex: 'rcvTrxTypeCode',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('rcvTrxTypeCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.model.purchaser.rcvTrxTypeCode`)
                          .d('事务类型编码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Input
                    disabled={!!record.rcvTrxTypeCode}
                    inputChinese={false}
                    onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.rcvTrxTypeName`).d('事务类型名称'),
        dataIndex: 'rcvTrxTypeName',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('rcvTrxTypeName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.model.purchaser.rcvTrxTypeName`)
                          .d('事务类型名称'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <TLEditor
                    onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                    field="rcvTrxTypeName"
                    token={record._token}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(
                  <Checkbox
                    onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                    checkedValue={1}
                    unCheckedValue={0}
                  />
                )}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.refTrxTypeId`).d('对应SRM事务类型编码'),
        dataIndex: 'refTrxTypeId',
        width: 180,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('refTrxTypeId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.model.purchaser.refTrxTypeId`)
                          .d('对应SRM事务类型编码'),
                      }),
                    },
                  ],
                  initialValue: record.refTrxTypeCode,
                })(
                  <Lov
                    code="SPFM.RECEIVE_TRX_TYPE"
                    textValue={record.refTrxTypeCode}
                    lovOptions={{ displayField: 'rcvTrxTypeCode' }}
                    onChange={(_, lovRecord) => {
                      setTimeout(() => this.forceUpdate(), 600);
                      this.changeTransCode(record, lovRecord);
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.refTrxTypeCode;
          }
        },
      },
      {
        title: intl
          .get(`spfm.configServer.model.purchaser.refTrxTypeName`)
          .d('对应SRM事务类型名称'),
        dataIndex: 'refTrxTypeName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('refTrxTypeName', {
                  initialValue: val,
                })(<Input onChange={() => setTimeout(() => this.forceUpdate(), 600)} disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <a onClick={() => this.handleCancelOrg(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            );
          } else if (record._status === 'update') {
            return (
              <a onClick={() => this.handleOrgEdit(record, false)}>
                {intl.get('hzero.common.status.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a onClick={() => this.handleOrgEdit(record, true)}>
                {intl.get('hzero.common.status.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const saveDisabled = !dataSource.some((item) => ['update', 'create'].includes(item._status));
    return (
      <Modal
        title={intl
          .get('spfm.configServer.model.purchaser.view.purchaseTrans.title')
          .d('采购事务类型配置')}
        visible={purchaseTransVisible}
        footer={null}
        width={1000}
        onCancel={this.hideModal}
      >
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type="primary" onClick={() => this.handleCreateData()} style={{ marginLeft: 8 }}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            onClick={() => this.handleSaveData()}
            loading={saveLoading}
            disabled={saveDisabled}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <EditTable
          bordered
          className={styles['purchase-trans-modal']}
          scroll={{ x: scrollX }}
          loading={loading}
          rowKey="rcvTrxTypeId"
          dataSource={dataSource}
          columns={columns}
          pagination={trxTypePagination}
          onChange={(page) => this.fetchRcvTrxTypeList(page)}
        />
      </Modal>
    );
  }
}
