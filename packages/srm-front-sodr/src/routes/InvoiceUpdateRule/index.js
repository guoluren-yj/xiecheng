/**
 * InvoiceUpdateRule - 开具发票规则定义
 * @date: 2018-11-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';

const promptCode = 'sodr.invoiceUpdateRule.model.common';

/**
 * 开具发票规则定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} libraryPosition - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ invoiceUpdateRule, loading }) => ({
  invoiceUpdateRule,
  loading: loading.effects['invoiceUpdateRule/fetchInvoiceUpdRule'],
  saving: loading.effects['invoiceUpdateRule/saveAllowanceRule'],
  organizationId: getCurrentOrganizationId(),
}))
export default class InvoiceUpdateRule extends PureComponent {
  state = {};

  componentDidMount() {
    this.handleSearchInvoiceUpdRule();
  }

  /**
   * 查询发票允差配置数据
   * @param {Object} payload 请求参数
   */
  @Bind()
  handleSearchInvoiceUpdRule() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'invoiceUpdateRule/fetchInvoiceUpdRule',
      payload: { organizationId },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      organizationId,
      invoiceUpdateRule: { invoiceUpdRuleData },
    } = this.props;
    const payloadData = getEditTableData(invoiceUpdRuleData, ['ruleId']);
    if (isEmpty(payloadData)) return;

    // const payloadData = tableData.map(item => {
    //   return { tenantId: organizationId, ...item };
    // });
    dispatch({
      type: 'invoiceUpdateRule/saveInvoiceUpdRule',
      payload: { payloadData, organizationId },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchInvoiceUpdRule();
      }
    });
  }

  /**
   * 编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      dispatch,
      invoiceUpdateRule: { invoiceUpdRuleData = [] },
    } = this.props;
    const newinvoiceUpdRuleData = invoiceUpdRuleData.map(item =>
      item.ruleId === record.ruleId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'invoiceUpdateRule/updateState',
      payload: { invoiceUpdRuleData: newinvoiceUpdRuleData },
    });
  }

  /**
   * 取消编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      dispatch,
      invoiceUpdateRule: { invoiceUpdRuleData = [] },
    } = this.props;
    const newinvoiceUpdRuleData = invoiceUpdRuleData.map(item => {
      if (item.ruleId === record.ruleId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'invoiceUpdateRule/updateState',
      payload: { invoiceUpdRuleData: newinvoiceUpdRuleData },
    });
  }

  render() {
    const {
      loading,
      saving,
      visible,
      handleModal,
      invoiceUpdateRule: { invoiceUpdRuleData = [] },
    } = this.props;
    const isSave = invoiceUpdRuleData.filter(o => o._status === 'update');

    const modalProps = {
      visible,
      width: 1000,
      footer: null,
      onCancel: () => handleModal('invoiceRuleVisible', false),
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.consignmentType`).d('业务类型'),
        dataIndex: 'consignmentType',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('consignmentTypeMeaning', {
                  initialValue: record.consignmentTypeMeaning,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.consignmentType`).d('业务类型'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    style={{ width: 200 }}
                    disabled={record._status === 'update'}
                    lovCode="SFIN.CONSIGNMENT_TYPE"
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.consignmentTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.quantityUpdFlag`).d('允许修改数量'),
        width: 200,
        align: 'center',
        dataIndex: 'quantityUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('quantityUpdFlag', {
                  initialValue: record.quantityUpdFlag ? 1 : 0,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.priceUpdFlag`).d('允许修改单价'),
        width: 200,
        align: 'center',
        dataIndex: 'priceUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('priceUpdFlag', {
                  initialValue: record.priceUpdFlag ? 1 : 0,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.taxUpdFlag`).d('允许修改税率'),
        width: 200,
        align: 'center',
        dataIndex: 'taxUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxUpdFlag', {
                  initialValue: record.taxUpdFlag ? 1 : 0,
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
        align: 'center',
        dataIndex: 'edit',
        width: 100,
        render: (_, record) => (
          <React.Fragment>
            {record._status === 'update' ? (
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
          </React.Fragment>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          <Header title={intl.get(`${promptCode}.title`).d('开具发票规则定义')}>
            <Button
              type="primary"
              disabled={isEmpty(isSave)}
              loading={saving || loading}
              onClick={this.handleSave}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Header>
          <Content>
            <EditTable
              bordered
              rowKey="ruleId"
              pagination={false}
              loading={loading}
              columns={columns}
              dataSource={invoiceUpdRuleData}
            />
          </Content>
        </Modal>
      </React.Fragment>
    );
  }
}
