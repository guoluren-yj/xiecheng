import React from 'react';
import { Table, NumberField, Lov, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

import tableDS from './indexDS';

const calcRender = (number, precision = 2) => {
  return thousandBitSeparator(number, precision);
};
const calcRenderDJ = (number, precision = 2) => {
  return thousandBitSeparatorDJ(number, precision);
};
@observer
export default class AddLinesModal extends React.Component {
  constructor(props) {
    super(props);
    const { type, invoiceHeaderId, modal } = props;
    this.tableDs = new DataSet(tableDS(type, invoiceHeaderId));
    modal.handleOk(this.handleOk);
    modal.update({ okProps: { disabled: isEmpty(this.tableDs.selected) } });
  }

  componentDidMount() {
    const { typeStatus } = this.props;
    const {
      businessType,
      invoiceHeaderId,
      companyId,
      ouId,
      purOrganizationId,
      purchaseAgentId,
      supplierTenantId,
    } = this.props.detailHeader[typeStatus];
    this.tableDs.setQueryParameter('businessType', businessType);
    this.tableDs.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    this.tableDs.setQueryParameter('companyId', companyId);
    this.tableDs.setQueryParameter('ouId', ouId);
    this.tableDs.setQueryParameter('purOrganizationId', purOrganizationId);
    this.tableDs.setQueryParameter('purchaseAgentId', purchaseAgentId);
    this.tableDs.setQueryParameter('supplierTenantId', supplierTenantId);
    this.tableDs.query();
  }

  componentDidUpdate(prevProps) {
    const { modal, loading } = this.props;
    const { loading: prevLoading } = prevProps;
    if (loading !== prevLoading) {
      modal.update({ okProps: { loading } });
    }
  }

  handleOk = async () => {
    const { onOk } = this.props;
    const vali = await this.tableDs.validate();
    if (!vali) return false;
    const body = this.tableDs.toJSONData().map(({ rowKey, ...other }) => other);
    const res = await onOk(body);
    return res;
  };

  render() {
    const { setting010505, modal } = this.props;
    modal.update({ okProps: { disabled: isEmpty(this.tableDs.selected) } });
    const columns = [
      {
        name: 'displayTrxNum',
        width: 180,
        lock: true,
      },
      {
        name: 'businessTypeMeaning',
        width: 120,
        lock: true,
      },
      {
        name: 'itemCode',
        width: 100,
        lock: true,
      },
      {
        name: 'itemName',
        width: 150,
        lock: true,
      },
      {
        name: 'commonName',
        width: 120,
        lock: true,
      },
      {
        name: 'specifications',
        width: 100,
      },
      {
        name: 'uom',
        width: 100,
      },
      {
        name: 'quantity',
        width: 100,
        renderer: ({ record }) => thousandBitSeparator(record.get('quantity')),
      },
      {
        name: 'remainInvoiceNumber',
        width: 120,
        renderer: ({ record }) => thousandBitSeparator(record.get('remainInvoiceNumber')),
      },
      {
        name: 'currentInvoiceNumber',
        width: 120,
        editor: (record) =>
          this.tableDs.selected.includes(record) && record.get('quantityUpdFlag') ? (
            <NumberField />
          ) : (
            false
          ),
      },
      {
        name: 'freeTaxPrice',
        width: 130,
        renderer: ({ record, value }) =>
          this.tableDs.selected.includes(record)
            ? (record.get('priceUpdFlag') || record.get('taxUpdFlag')) &&
              setting010505 === 'TAX_INCLUDED_PRICE'
              ? calcRenderDJ(
                  math.div(
                    record.get('taxPrice'),
                    math.plus(1, math.div(record.get('taxRate'), 100))
                  ),
                  record.get('pricePrecision')
                )
              : thousandBitSeparatorDJ(value, record.get('pricePrecision'))
            : record.get('priceShieldFlag')
            ? '***'
            : thousandBitSeparatorDJ(value, record.get('pricePrecision')),
      },
      {
        name: 'unitPriceBatch',
        width: 100,
      },
      {
        name: 'freeTaxPriceAmount',
        width: 120,
        renderer: ({ record, value }) => {
          const {
            quantityUpdFlag, // 是否修改数量
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            priceShieldFlag, // 是否价格屏蔽
            unitPriceBatch, // 每
            taxPrice,
            taxRate,
            currentInvoiceNumber,
            freeTaxPrice,
            yarn,
            amountPrecision,
          } = record.toData();
          const isCalc = quantityUpdFlag || priceUpdFlag || taxUpdFlag;
          const ratePlus = math.plus(1, math.div(taxRate, 100));
          const currentInvoice = currentInvoiceNumber || yarn;
          return this.tableDs.selected.includes(record)
            ? isCalc
              ? setting010505 === 'TAX_INCLUDED_PRICE'
                ? calcRender(
                    math.div(
                      math.multipliedBy(math.div(taxPrice, ratePlus), currentInvoice),
                      unitPriceBatch
                    ),
                    2
                  )
                : calcRender(
                    math.div(math.multipliedBy(freeTaxPrice, currentInvoiceNumber), unitPriceBatch),
                    amountPrecision
                  )
              : priceShieldFlag
              ? '***'
              : thousandBitSeparator(value, amountPrecision)
            : priceShieldFlag
            ? '***'
            : thousandBitSeparator(value, amountPrecision);
        },
      },
      {
        name: 'taxRate',
        width: 120,
        editor: (record) =>
          this.tableDs.selected.includes(record) && record.get('taxUpdFlag') ? (
            <Lov modalProps={{ zIndex: 12343 }} />
          ) : (
            false
          ),
      },
      {
        name: 'taxPrice',
        width: 120,
        renderer: ({ record, value }) =>
          this.tableDs.selected.includes(record)
            ? (record.get('priceUpdFlag') || record.get('taxUpdFlag')) &&
              setting010505 === 'NET_PRICE'
              ? calcRender(
                  math.multipliedBy(
                    record.get('freeTaxPrice'),
                    math.plus(1, math.div(record.get('taxRate'), 100))
                  ),
                  record.get('pricePrecision')
                )
              : thousandBitSeparatorDJ(value, record.get('pricePrecision'))
            : record.get('priceShieldFlag')
            ? '***'
            : thousandBitSeparatorDJ(value, record.get('pricePrecision')),
      },
      {
        name: 'taxPriceAmount',
        width: 120,
        renderer: ({ record, value }) => {
          const {
            quantityUpdFlag, // 是否修改数量
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            priceShieldFlag, // 是否价格屏蔽
            unitPriceBatch, // 每
            taxPrice,
            taxRate,
            amountPrecision,
            currentInvoiceNumber,
            freeTaxPrice,
          } = record.toData();
          const isCalc = quantityUpdFlag || priceUpdFlag || taxUpdFlag;
          return this.tableDs.selected.includes(record)
            ? isCalc
              ? setting010505 === 'TAX_INCLUDED_PRICE'
                ? calcRender(
                    math.div(math.multipliedBy(taxPrice, currentInvoiceNumber), unitPriceBatch),
                    amountPrecision
                  )
                : calcRender(
                    math.div(
                      math.multipliedBy(
                        math.multipliedBy(freeTaxPrice, math.plus(1, math.div(taxRate, 100))),
                        currentInvoiceNumber
                      ),
                      unitPriceBatch
                    ),
                    amountPrecision
                  )
              : priceShieldFlag
              ? '***'
              : thousandBitSeparator(value, amountPrecision)
            : priceShieldFlag
            ? '***'
            : thousandBitSeparator(value, amountPrecision);
        },
      },
      {
        name: 'taxAmount',
        width: 120,
        renderer: ({ record, value }) => {
          const {
            quantityUpdFlag, // 是否修改数量
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            priceShieldFlag, // 是否价格屏蔽
            unitPriceBatch, // 每
            taxPrice,
            taxRate,
            currentInvoiceNumber,
            freeTaxPrice,
            amountPrecision,
          } = record.toData();
          const isCalc = quantityUpdFlag || priceUpdFlag || taxUpdFlag;
          const ratePre = math.div(taxRate, 100);
          return this.tableDs.selected.includes(record)
            ? isCalc
              ? setting010505 === 'TAX_INCLUDED_PRICE'
                ? calcRender(
                    math.div(
                      math.multipliedBy(
                        math.multipliedBy(math.div(taxPrice, math.plus(1, ratePre)), ratePre),
                        currentInvoiceNumber
                      ),
                      unitPriceBatch
                    ),
                    amountPrecision
                  )
                : calcRender(
                    math.div(
                      math.multipliedBy(
                        math.multipliedBy(freeTaxPrice, ratePre),
                        currentInvoiceNumber
                      ),
                      unitPriceBatch
                    ),
                    amountPrecision
                  )
              : priceShieldFlag
              ? '***'
              : thousandBitSeparator(value, amountPrecision)
            : priceShieldFlag
            ? '***'
            : thousandBitSeparator(value, amountPrecision);
        },
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'trxType',
        width: 120,
      },
      {
        name: 'trxDate',
        width: 120,
      },
      {
        name: 'parentNumber',
        width: 150,
      },
      {
        width: 160,
        name: 'asnNum',
      },
      {
        width: 160,
        name: 'poNum',
      },
      {
        width: 100,
        name: 'lineLocationNum',
      },
      {
        width: 100,
        name: 'releaseNum',
      },
      {
        width: 160,
        name: 'billNumber',
      },
      {
        width: 120,
        name: 'orderTypeName',
      },
      {
        width: 150,
        name: 'companyName',
      },
      {
        width: 150,
        name: 'ouName',
      },
      {
        width: 150,
        name: 'purchaseOrganizationName',
      },
      {
        width: 150,
        name: 'repertoryOrganizationName',
      },
      {
        width: 120,
        name: 'inventoryName',
      },
      {
        width: 100,
        name: 'agentName',
      },
      {
        width: 150,
        name: 'supplierCode',
      },
      {
        width: 130,
        name: 'supplierCompanyName',
      },
      {
        width: 150,
        name: 'supplierSiteName',
      },
      {
        width: 150,
        name: 'partnerNum',
      },
      {
        width: 150,
        name: 'sourceCode',
      },
      {
        width: 150,
        name: 'externalSystemCode',
      },
      {
        width: 140,
        name: 'sourceOrderTypeNameMeaing',
      },
      {
        width: 120,
        name: 'creationDate',
      },
      {
        width: 100,
        name: 'trxYear',
      },
      {
        width: 100,
        name: 'needInvoiceFlag',
        renderer: ({ value }) =>
          value === '1'
            ? intl.get('hzero.common.no').d('否')
            : intl.get('hzero.common.yes').d('是'),
      },
    ];
    return <Table dataSet={this.tableDs} columns={columns} queryFieldsLimit={3} />;
  }
}
