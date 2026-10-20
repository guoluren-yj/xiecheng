/**
 * LadderLevel
 * @date: 2021-10-1
 * @author: LZJ <zhijian.li@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Output, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { TooltipTitle } from '@/utils/utils';

/**
 * 阶梯报价子组件
 * @ReactProps {Object} ladderQuotationTableDs - 表格DS
 * @ReactProps record 报价行信息
 */
export default class Index extends PureComponent {
  componentDidMount() {
    const { ladderQuotationTableDs, doubleUnitFlag } = this.props;
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.query();
  }

  getColumns() {
    const { isOfflineFlag, doubleUnitFlag, record: lineRecord } = this.props;
    const columns = [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 120,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryLadderTo',
            width: 120,
          }
        : null,
      {
        name: 'ladderFrom',
        width: 120,
      },
      {
        name: 'ladderTo',
        width: 120,
      },
      doubleUnitFlag
        ? isOfflineFlag
          ? {
              name: 'currentLadderSecPrice',
              width: 120,
              editor: (line) => {
                return (
                  isOfflineFlag && (
                    <C7nPrecisionInputNumber
                      currency="quotationCurrencyCode"
                      name="currentLadderSecPrice"
                      record={line}
                      headerRecord={lineRecord}
                    />
                  )
                );
              },
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('currency_precision')),
            }
          : {
              name: 'validLadderSecPrice',
              width: 120,
            }
        : null,
      doubleUnitFlag
        ? isOfflineFlag
          ? {
              name: 'currentNetLadderSecPrice',
              width: 120,
              editor: (line) => {
                return (
                  isOfflineFlag && (
                    <C7nPrecisionInputNumber
                      currency="quotationCurrencyCode"
                      name="currentNetLadderSecPrice"
                      record={line}
                      headerRecord={lineRecord}
                    />
                  )
                );
              },
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('currency_precision')),
            }
          : {
              name: 'validNetLadderSecPrice',
              width: 120,
            }
        : null,
      isOfflineFlag
        ? {
            name: 'currentLadderPrice',
            width: 120,
            editor: (line) => {
              return (
                <C7nPrecisionInputNumber
                  currency="quotationCurrencyCode"
                  name="currentLadderPrice"
                  record={line}
                  headerRecord={lineRecord}
                  disabled={doubleUnitFlag}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          }
        : {
            name: 'validLadderPrice',
            width: 120,
          },
      isOfflineFlag
        ? {
            name: 'currentNetLadderPrice',
            width: 120,
            editor: (line) => {
              return (
                <C7nPrecisionInputNumber
                  currency="quotationCurrencyCode"
                  name="currentNetLadderPrice"
                  record={line}
                  headerRecord={lineRecord}
                  disabled={doubleUnitFlag}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          }
        : {
            name: 'validNetLadderPrice',
            width: 120,
          },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      !isOfflineFlag && {
        header: (
          <TooltipTitle
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
              .d('辅助单位对应的还价单价')}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
            doubleUnitFlag={doubleUnitFlag}
          />
        ),
        name: 'currentBargainPrice',
        width: 100,
        editor: (line) => {
          return <C7nPrecisionInputNumber name="validLadderPrice" record={line} />;
        },
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      !isOfflineFlag && {
        name: 'currentBargainRemark',
        width: 100,
        editor: true,
      },
      !isOfflineFlag && {
        header: (
          <TooltipTitle
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary`)
              .d('辅助单位对应的有效还价单价')}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
            doubleUnitFlag={doubleUnitFlag}
          />
        ),
        name: 'validBargainPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      !isOfflineFlag && {
        name: 'validBargainRemark',
        width: 100,
      },
    ].filter(Boolean);
    return columns;
  }

  render() {
    const { record, ladderQuotationTableDs } = this.props;
    return (
      <div>
        <Form
          labelLayout="vertical"
          columns={3}
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
            value={record.get('supplierCompanyName')}
          />
          <Output
            label={intl.get('ssrc.rf.model.rf.itemCode').d('物料编码')}
            value={record.get('itemCode')}
          />
          <Output
            label={intl.get('ssrc.rf.model.rf.itemName').d('物料名称')}
            value={record.get('itemName')}
          />
        </Form>
        <div style={{ marginTop: '32px' }}>
          <Table dataSet={ladderQuotationTableDs} columns={this.getColumns()} />
        </div>
      </div>
    );
  }
}
