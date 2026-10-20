/**
 * InvoiceUpdateRule - 开具发票规则定义
 * @date: 2018-11-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Modal, InputNumber, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender, numberRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';

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
@formatterCollections({
  code: ['sodr.invoiceUpdateRule'],
})
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
    }).then((res) => {
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
    const newinvoiceUpdRuleData = invoiceUpdRuleData.map((item) =>
      item.ruleId === record.ruleId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'invoiceUpdateRule/updateState',
      payload: { invoiceUpdRuleData: newinvoiceUpdRuleData },
    });
  }

  @Bind()
  handleCheckTaxAmount(value, record) {
    const {
      $form: { getFieldValue, setFields },
    } = record;
    const taxAmountTolerance = getFieldValue('taxAmountTolerance');
    console.log(taxAmountTolerance);
    setFields({
      taxAmountTolerance: {
        value: taxAmountTolerance,
        errors:
          value && !taxAmountTolerance
            ? [
                new Error(
                  intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sodr.invoiceUpdateRule.model.invoiceUpdateRule.taxAmountTolerance')
                      .d('税额允差'),
                  })
                ),
              ]
            : null,
      },
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
    const newinvoiceUpdRuleData = invoiceUpdRuleData.map((item) => {
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
    const isSave = invoiceUpdRuleData.filter((o) => o._status === 'update');

    const modalProps = {
      visible,
      width: 1000,
      footer: null,
      onCancel: () => handleModal('invoiceRuleVisible', false),
    };

    const columns = [
      {
        title: intl.get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.consignType`).d('业务类型'),
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
                        name: intl
                          .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.type`)
                          .d('业务类型'),
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
        title: (
          <Tooltip
            title={intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.createInvoiceTable`)
              .d('创建发票列表页')}
          >
            {intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.quanUpdFlag`)
              .d('允许修改数量')}
          </Tooltip>
        ),
        width: 200,
        dataIndex: 'quantityUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('quantityUpdFlag', {
                  initialValue: record.quantityUpdFlag ? 1 : 0,
                })(<Checkbox disabled={record.consignmentType === 'EC'} />)}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip
                title={intl
                  .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.createInvoiceTable`)
                  .d('创建发票列表页')}
              >
                <span>{yesOrNoRender(val)}</span>
              </Tooltip>
            );
          }
        },
      },
      {
        title: (
          <Tooltip
            title={`${intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.createInvoiceTable`)
              .d('创建发票列表页')}、${intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.updateInvoiceDetail`)
              .d('维护发票详情页')}`}
          >
            {intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.priceUpdFlag`)
              .d('允许修改单价')}
          </Tooltip>
        ),
        width: 200,
        dataIndex: 'priceUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('priceUpdFlag', {
                  initialValue: record.priceUpdFlag ? 1 : 0,
                })(<Checkbox disabled={record.consignmentType === 'EC'} />)}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip
                title={`${intl
                  .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.createInvoiceTable`)
                  .d('创建发票列表页')}、${intl
                  .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.updateInvoiceDetail`)
                  .d('维护发票详情页')}`}
              >
                <span>{yesOrNoRender(val)}</span>
              </Tooltip>
            );
          }
        },
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.createInvoiceTable`)
              .d('创建发票列表页')}
          >
            {intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.taxUpdFlag`)
              .d('允许修改税率')}
          </Tooltip>
        ),
        width: 200,
        dataIndex: 'taxUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxUpdFlag', {
                  initialValue: record.taxUpdFlag ? 1 : 0,
                })(<Checkbox disabled={record.consignmentType === 'EC'} />)}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip
                title={intl
                  .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.createInvoiceTable`)
                  .d('创建发票列表页')}
              >
                <span>{yesOrNoRender(val)}</span>
              </Tooltip>
            );
          }
        },
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.updateInvoiceDetail`)
              .d('维护发票详情页')}
          >
            {intl
              .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.taxAmountUpdFlag`)
              .d('允许修改税额')}
          </Tooltip>
        ),
        width: 200,
        dataIndex: 'taxAmountUpdFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxAmountUpdFlag', {
                  initialValue: record.taxAmountUpdFlag ? 1 : 0,
                })(
                  <Checkbox onChange={(e) => this.handleCheckTaxAmount(e.target.checked, record)} />
                )}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip
                title={intl
                  .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.updateInvoiceDetail`)
                  .d('维护发票详情页')}
              >
                <span>{yesOrNoRender(val)}</span>
              </Tooltip>
            );
          }
        },
      },
      {
        title: intl
          .get(`sodr.invoiceUpdateRule.model.invoiceUpdateRule.taxAmountTolerance`)
          .d('税额允差'),
        width: 200,
        dataIndex: 'taxAmountTolerance',
        render: (val, record) => {
          console.log(record);
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxAmountTolerance', {
                  initialValue: record.taxAmountTolerance,
                  rules: [
                    {
                      required: record.$form.getFieldValue('taxAmountUpdFlag'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.invoiceUpdateRule.model.invoiceUpdateRule.taxAmountTolerance')
                          .d('税额允差'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} step={0.01} />)}
              </Form.Item>
            );
          } else {
            return numberRender(val, 2);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
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
        <Modal
          {...modalProps}
          title={intl.get(`sodr.invoiceUpdateRule.view.title`).d('开具发票规则定义')}
        >
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <Button
              type="primary"
              disabled={isEmpty(isSave)}
              loading={saving || loading}
              onClick={this.handleSave}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <EditTable
            bordered
            rowKey="ruleId"
            pagination={false}
            loading={loading}
            columns={columns}
            dataSource={invoiceUpdRuleData}
            style={{ paddingTop: '16px' }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
