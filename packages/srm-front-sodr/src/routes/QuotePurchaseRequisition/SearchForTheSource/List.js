import React, { Component } from 'react';
import { InputNumber, Form, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { isNumber, sum, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import DocFlow from '_components/DocFlow';
import EditTable from 'components/EditTable';
import { dateRender, dateTimeRender } from 'utils/renderer';

import { formatAumont, parseAumont, getDynamicLabel } from '@/routes/components/utils';
// import styles from './index.less';

const FormItem = Form.Item;
export default class List extends Component {
  @Bind()
  showLadderInquiry(record) {
    const { showLadderInquiry } = this.props;
    showLadderInquiry(record);
  }

  render() {
    const {
      dataList = [],
      dataPagination = {},
      selectedRowKeys = [],
      // selectedRows = [],
      onSelectRow = () => {},
      onChange,
      loading,
      toSourceDetail,
      customizeTable,
      doubleUnitEnabled,
      // changeQuantityChange = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 180,
        render: (val, record) => <a onClick={() => toSourceDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.itemNum`).d('行号'),
        dataIndex: 'itemNum',
        width: 80,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
        render: (_, { supplierCompanyNum, erpSupplierCompanyNum }) =>
          supplierCompanyNum || erpSupplierCompanyNum,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.supplierCompanyName`).d('供应方名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (_, { supplierCompanyName, supplierName }) => supplierCompanyName || supplierName,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.invOrganizationId`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.itemCode`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.itemNames`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },

      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.orderMaintain.sourceFrom.uomName`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 100,
        render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.orderMaintain.sourceFrom.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
        render: (value, { secondaryUomPrecision }) => formatAumont(value, secondaryUomPrecision),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'uom'),
        dataIndex: 'uomName',
        width: 100,
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 100,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.changeQuantity`).d('本次下单数量'),
        dataIndex: 'changeQuantity',
        width: 120,
        render: (val, record) => {
          if (!selectedRowKeys.find((i) => record.resultId === i)) {
            return formatAumont(val);
          }
          const _uomPrecision = doubleUnitEnabled
            ? record.secondaryUomPrecision
            : record.uomPrecision;
          return (
            <FormItem>
              {record.$form.getFieldDecorator('receiptsOrderQuantity', {
                initialValue: record.receiptsOrderQuantity || record.remainQuantity,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.orderMaintain.sourceFrom.changeQuantity`)
                        .d('本次下单数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => {
                      if (
                        !isNil(record.remainQuantity) &&
                        record.remainQuantity < value &&
                        record.controlOrderFlag !== 0
                      ) {
                        callback(
                          intl
                            .get(`sodr.order.view.message.validator`)
                            .d('本次下单数量大于剩余可下单数量')
                        );
                      }
                      if (value <= 0) {
                        callback(
                          intl
                            .get(`sodr.order.view.message.mustExceedZero`)
                            .d('本次下单数量必须大于零')
                        );
                      }
                      callback();
                    },
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  parser={(value) => parseAumont(value, _uomPrecision)}
                  allowThousandth="true"
                  // onBlur={(item) => {
                  //   changeQuantityChange(item, record);
                  // }}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.occupationQuantity`).d('已创建订单数量'),
        dataIndex: 'occupationQuantity',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.remainQuantity`).d('剩余可下单数量'),
        dataIndex: 'remainQuantity',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.unitPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        width: 100,
        render: (value, record) => formatAumont(value, record.defaultPrecision),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        width: 100,
        render: (value, record) => formatAumont(value, record.financialPrecision, true),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.taxprice`).d('含税单价'),
        dataIndex: 'taxprice',
        width: 100,
        render: (value, record) => formatAumont(value, record.defaultPrecision),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.taxAmount`).d('含税金额'),
        dataIndex: 'taxAmount',
        width: 100,
        render: (value, record) => formatAumont(value, record.financialPrecision, true),
      },
      {
        title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 && (
            <a onClick={() => this.showLadderInquiry(record)}>
              {intl.get(`sodr.orderMaintain.sourceFrom.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ),
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.purOrganizationName`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.orderMaintain.sourceFrom.prNumAndLineNum`).d('采购申请单号|行号'),
        dataIndex: 'prNumAndLineNum',
        width: 150,
        render: (val) => val !== ' | ' && <span>{val}</span>,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 100,
        render: (val) => (
          <Tooltip title={val}>
            <span
              style={{
                width: '100%',
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {val}
            </span>
          </Tooltip>
        ),
      },
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.sourceLineItemId} />
        ),
      },
    ].filter((i) => i);
    // const scrollX = columns.map(item => item.width).reduce((sum, val) => sum + val);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return customizeTable(
      {
        code: 'SODR.PURCHASE_SOURCE_LIST.LINE',
      },
      <EditTable
        loading={loading}
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 390px)' }}
        rowKey="resultId"
        columns={columns}
        dataSource={dataList}
        pagination={{ ...dataPagination, showQuickJumper: true }}
        rowSelection={{
          selectedRowKeys,
          // selectedRows,
          onChange: onSelectRow,
        }}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
