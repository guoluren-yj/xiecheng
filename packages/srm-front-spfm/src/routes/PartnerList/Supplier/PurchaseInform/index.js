/**
 * PurchaseInform - 采购/财务信息
 * @date: 2023-01-05
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { isNumber, sum } from 'lodash';
import { Form, Row, Col, Spin, Table } from 'hzero-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { queryPurchaseHeader, queryPurchaseLine } from '@/services/supplierService';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class PurchaseInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      purchaseHeadInfo: {},
      purchaseList: [],
      allLoading: false,
    };
  }

  componentDidMount() {
    this.handPurchaseInfo();
  }

  // 查询采购财务信息
  @Bind()
  handPurchaseInfo() {
    const { supplierId } = this.props;
    this.setState({
      allLoading: true,
    });
    Promise.all([
      queryPurchaseHeader({
        supplierId,
        customizeUnitCode: 'SPFM.PARTNER_LIST_SUPPLIER.PURCHASE_HEADER',
      }),
      // 业务信息
      queryPurchaseLine({
        supplierId,
        customizeUnitCode: 'SPFM.PARTNER_LIST_SUPPLIER.PURCHASE_LINE',
      }),
    ])
      .then((res) => {
        if (res) {
          const [purchaseHeadInfo, purchaseList] = res;
          if (getResponse(purchaseHeadInfo)) {
            this.setState({
              purchaseHeadInfo,
            });
          }
          if (getResponse(purchaseList)) {
            this.setState({
              purchaseList: purchaseList.content,
            });
          }
        }
      })
      .finally(() => {
        this.setState({
          allLoading: false,
        });
      });
  }

  render() {
    const { purchaseHeadInfo = {}, purchaseList = [], allLoading } = this.state;
    const { form, customizeForm = () => {}, customizeTable = () => {} } = this.props;

    const {
      accountGroup,
      frozenFlag,
      ouCode,
      ouId,
      schemeGroup,
      accountGroupMeaning,
      reconciliationAccount,
      reconciliationAccountMeaning,
    } = purchaseHeadInfo;
    const { getFieldDecorator } = form;

    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
        width: 150,
        dataIndex: 'organizationCode',
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.organizationName')
          .d('采购组织名称'),
        width: 120,
        dataIndex: 'organizationName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
        width: 150,
        dataIndex: 'purchaseAgentName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
        width: 150,
        dataIndex: 'termName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
        width: 160,
        align: 'left',
        dataIndex: 'typeName',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
        width: 160,
        dataIndex: 'tradeTermsMeaning',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
        width: 160,
        dataIndex: 'tradeTermsSite',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
        width: 150,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
        width: 150,
        dataIndex: 'reconciliationAccountMeaning',
      },
      {
        title: intl.get(`sslm.supplierInform.model.supplierInform.sortNumber`).d('排序码'),
        width: 150,
        dataIndex: 'sortNumber',
      },
      {
        title: intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结'),
        width: 120,
        dataIndex: 'frozenFlag',
        render: yesOrNoRender,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    return (
      <Spin spinning={allLoading || false}>
        {customizeForm(
          {
            code: 'SPFM.PARTNER_LIST_SUPPLIER.PURCHASE_HEADER', // 必传，和unitCode一一对应
            form, // 无论个性化单元是否只读，均必传
            readOnly: true,
            dataSource: purchaseHeadInfo, // 必传，从后端接口获取到的数据
          },
          <Form className="ued-edit-form" style={{ marginLeft: 8, marginRight: 8 }}>
            <Row gutter={24} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.planGroups').d('计划组')}
                >
                  {getFieldDecorator('programmeGroups', {
                    initialValue: purchaseHeadInfo.programmeGroups,
                  })(<span>{purchaseHeadInfo.programmeGroupsMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.schemeGroup')
                    .d('方案组')}
                >
                  {getFieldDecorator('schemeGroup', {
                    initialValue: schemeGroup,
                  })(<span>{schemeGroup}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.accountGroup')
                    .d('账户组')}
                >
                  {getFieldDecorator('accountGroup', {
                    initialValue: accountGroup,
                  })(<span>{accountGroupMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.controlAccount')
                    .d('统驭科目')}
                >
                  {getFieldDecorator('reconciliationAccount', {
                    initialValue: reconciliationAccount,
                  })(<span>{reconciliationAccountMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.erpCompanyCode')
                    .d('erp公司代码')}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: ouId,
                  })(<span>{ouCode}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.termName').d('付款条款')}
                >
                  {getFieldDecorator('termId', {
                    initialValue: purchaseHeadInfo.termId,
                  })(<span>{purchaseHeadInfo.termName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.accountFlag')
                    .d('记账冻结')}
                >
                  {getFieldDecorator('frozenFlag', {
                    initialValue: frozenFlag || 0,
                  })(<span>{yesOrNoRender(frozenFlag || 0)}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.importErp.model.importErp.paymentFreezeCode')
                    .d('付款冻结代码')}
                >
                  {getFieldDecorator('paymentFrozen', {
                    initialValue: purchaseHeadInfo.paymentFrozen,
                  })(<span>{purchaseHeadInfo.paymentFrozenMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        {customizeTable(
          {
            code: 'SPFM.PARTNER_LIST_SUPPLIER.PURCHASE_LINE',
            readOnly: true,
          },
          <Table
            bordered
            // rowKey="supplierSyncPfId"
            columns={columns}
            dataSource={purchaseList}
            scroll={{ x: scrollX }}
            pagination={false}
          />
        )}
      </Spin>
    );
  }
}
