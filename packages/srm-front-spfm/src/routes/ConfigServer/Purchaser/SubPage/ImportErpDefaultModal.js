/*
 *ImportErpDefaultModal - 导入erp弹出框
 * @date: 2019/11/18
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { sum, isNumber, isEmpty } from 'lodash';
import { Modal, Button, Form, Input } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  delItemToPagination,
} from 'utils/utils';

import styles from './index.less';

const tenantId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
@connect(({ configServer, loading }) => ({
  configServer,
  queryLoading: loading.effects['configServer/fetchImportErpDefault'],
  saveLoading: loading.effects['configServer/saveImportErpDefault'],
}))
export default class ImportErpDefaultModal extends Component {
  componentDidMount() {
    this.importErpDefault();
  }

  /**
   * 查询导入erp默认值
   */
  @Bind()
  importErpDefault(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchImportErpDefault',
      payload: { tenantId, page },
    });
  }

  /**
   * 新建 Table
   */
  @Bind()
  handleCreateRow() {
    const {
      dispatch,
      configServer: { importErpList = [], paginationList = {} },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        importErpList: [
          {
            importErpConfigId: uuidv4(),
            enabledFlag: 1,
            _status: 'create', // 新建标记位
          },
          ...importErpList,
        ],
        paginationList: addItemToPagination(importErpList.length, paginationList),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveImportErp() {
    const {
      configServer: { importErpList = {} },
    } = this.props;
    const filterImportList = getEditTableData(importErpList, ['_status', 'importErpConfigId']);
    if (isEmpty(filterImportList)) return;
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/saveImportErpDefault',
      payload: {
        importErpList: filterImportList,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.importErpDefault();
      }
    });
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    const {
      configServer: { importErpList },
    } = this.props;
    const newStatusList = importErpList.filter(item => item._status === 'create');
    if (handleModal && newStatusList.length >= 1) {
      Modal.confirm({
        content: intl
          .get('spfm.configServer.view.message.save')
          .d('当前有未保存的数据,继续操作将丢失？'),
        onOk: () => {
          handleModal('importErpDefaultVisible', false);
        },
      });
    } else {
      handleModal('importErpDefaultVisible', false);
    }
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      configServer: { importErpList },
      dispatch,
    } = this.props;
    const newFinanceList = importErpList.map(item =>
      record.importErpConfigId === item.importErpConfigId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'configServer/updateState',
      payload: { importErpList: newFinanceList },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      configServer: { importErpList },
      dispatch,
    } = this.props;
    const newImportErpList = importErpList.map(item => {
      if (item.importErpConfigId === record.importErpConfigId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'configServer/updateState',
      payload: { importErpList: newImportErpList },
    });
  }

  /**
   * 清除新建的行
   * @param {object} record
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      configServer: { importErpList = [], paginationList },
    } = this.props;
    const newImportErpList = importErpList.filter(
      item => item.importErpConfigId !== record.importErpConfigId
    );
    dispatch({
      type: 'configServer/updateState',
      payload: {
        importErpList: newImportErpList,
        paginationList: delItemToPagination(importErpList.length, paginationList),
      },
    });
  }

  render() {
    const {
      importErpDefaultVisible,
      saveLoading,
      queryLoading,
      configServer: { importErpList = [], paginationList },
    } = this.props;
    const isSave = importErpList.filter(o => o._status === 'create' || o._status === 'update');
    const columns = [
      {
        title: intl.get('spfm.configServer.view.message.companyName').d('公司名称'),
        dataIndex: 'companyId',
        key: 'companyId',
        width: 160,
        render: (text, record) => {
          const returnComponent = !(record._status === 'create' || record._status === 'update') ? (
            record.companyName
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfm.configServer.view.message.companyName').d('公司名称'),
                    }),
                  },
                ],
                initialValue: record.companyId,
              })(
                <Lov
                  code="HPFM.COMPANY"
                  queryParams={{
                    tenantId,
                  }}
                  textField="companyName"
                  textValue={record.companyName}
                />
              )}
            </Form.Item>
          );
          return returnComponent;
        },
      },
      {
        title: intl.get('spfm.configServer.view.message.schemeGroup').d('方案组'),
        dataIndex: 'schemeGroup',
        width: 100,
        render: (val, record) =>
          record._status === 'create' || record._status === 'update' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('schemeGroup', {
                initialValue: val,
                rules: [
                  {
                    pattern: /^[A-Za-z0-9]*$/,
                    message: intl
                      .get(`spfm.configServer.view.message.patternValidate`)
                      .d('请输入字母或数字'),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input style={{ width: '76px' }} step={1} min={1} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.configServer.view.message.accountGroup').d('账户组'),
        dataIndex: 'accountGroup',
        width: 100,
        render: (val, record) =>
          record._status === 'create' || record._status === 'update' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('accountGroup', {
                initialValue: val,
                rules: [
                  {
                    pattern: /^[A-Za-z0-9]*$/,
                    message: intl
                      .get(`spfm.configServer.view.message.patternValidate`)
                      .d('请输入字母或数字'),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input style={{ width: '76px' }} step={1} min={1} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.configServer.view.message.currencyName').d('订单货币'),
        dataIndex: 'currencyName',
        key: 'currencyName',
        width: 120,
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('currencyCode', {
                  initialValue: record.currencyCode,
                })(
                  <Lov
                    code="SMDM.CURRENCY"
                    lovOptions={{ displayField: 'currencyName', valueField: 'currencyCode' }}
                    textField="currencyName"
                    textValue={record.currencyName}
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
        title: intl.get('spfm.configServer.view.message.payMethod').d('付款方式'),
        dataIndex: 'termName',
        key: 'termName',
        width: 120,
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('termId', {
                  initialValue: record.termId,
                })(
                  <Lov
                    code="SMDM.PAYMENT.TERM"
                    textField="termName"
                    textValue={record.termName}
                    lovOptions={{ displayField: 'termName', valueField: 'termId' }}
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
        title: intl.get('spfm.configServer.view.message.recoAccount').d('统驭科目'),
        dataIndex: 'reconciliationAccountMeaning',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('reconciliationAccount', {
                  initialValue: record.reconciliationAccount,
                })(
                  <Lov
                    code="SSLM.RECONCILIATION_ACCOUNT"
                    queryParams={{ tenantId }}
                    textValue={val}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
                    }}
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
        title: intl.get('spfm.configServer.view.message.sortNumber').d('排序码'),
        dataIndex: 'sortNumber',
        width: 100,
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('sortNumber', {
                  initialValue: val,
                  rules: [
                    {
                      pattern: /^[A-Za-z0-9]*$/,
                      message: intl
                        .get(`spfm.configServer.view.message.patternValidate`)
                        .d('请输入字母或数字'),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', { max: 30 }),
                    },
                  ],
                })(<Input typeCase="upper" inputChinese={false} />)}
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
        width: 70,
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: val,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (val, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return (
      <Modal
        title={
          <div>
            {intl.get('spfm.configServer.view.message.sapDefaultConfig').d('导入sap默认值配置')}
          </div>
        }
        width={sum(columns.map(n => (isNumber(n.width) ? n.width : 0)))}
        footer={null}
        visible={importErpDefaultVisible}
        onCancel={this.handleModalVisible}
        wrapClassName={styles['risk-scan']}
      >
        <Form>
          <div style={{ textAlign: 'right' }}>
            <Button
              loading={saveLoading}
              onClick={() => this.handleSaveImportErp()}
              disabled={isEmpty(isSave)}
              icon="save"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              icon="plus"
              type="primary"
              onClick={() => {
                this.handleCreateRow();
              }}
              style={{ marginLeft: 8 }}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <EditTable
            style={{ paddingTop: '0px' }}
            bordered
            rowKey="importErpConfigId"
            loading={queryLoading || saveLoading}
            pagination={paginationList}
            onChange={this.importErpDefault}
            columns={columns}
            dataSource={importErpList}
          />
        </Form>
      </Modal>
    );
  }
}
