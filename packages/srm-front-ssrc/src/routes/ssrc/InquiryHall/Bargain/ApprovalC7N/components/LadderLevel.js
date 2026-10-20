import React, { PureComponent } from 'react';
import { Form, Output, Table } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';

/**
 * 阶梯报价子组件
 * @ReactProps {Object} ladderQuotationTableDs - 表格DS
 * @ReactProps record 报价行信息
 */
export default class Index extends PureComponent {
  componentDidMount() {
    const {
      ladderQuotationTableDs,
      doubleUnitFlag,
      templateInfo = {},
      getCustomizeUnitCode = noop,
    } = this.props;
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setQueryParameter('commonProps', {
      templateInfo,
      customizeUnitCode: getCustomizeUnitCode('ladderLevel'),
    });
    ladderQuotationTableDs.query();
  }

  getColumns() {
    const { doubleUnitFlag } = this.props;
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
        ? {
            name: 'validLadderSecPrice',
            width: 120,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetLadderSecPrice',
            width: 120,
          }
        : null,
      {
        name: 'validLadderPrice',
        width: 120,
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'currentBargainPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'currentBargainRemark',
        width: 100,
      },
      {
        name: 'validBargainPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validBargainRemark',
        width: 100,
      },
    ].filter(Boolean);
    return columns;
  }

  render() {
    const {
      record,
      ladderQuotationTableDs,
      getCustomizeUnitCode = noop,
      customizeTable = noop,
    } = this.props;
    return (
      <div>
        <Form
          columns={2}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          labelAlign="left"
        >
          <Output
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
            value={record.get('supplierCompanyName')}
          />
          <Output
            label={intl.get('ssrc.inquiryHall.model.inquiryHall.itemCode').d('物料编码')}
            value={record.get('itemCode')}
          />
          <Output
            label={intl.get('ssrc.inquiryHall.model.inqueryHall.itemName').d('物料名称')}
            value={record.get('itemName')}
          />
        </Form>
        <div style={{ marginTop: '16px' }}>
          {customizeTable(
            {
              code: getCustomizeUnitCode('ladderLevel'),
              dataSet: ladderQuotationTableDs,
            },
            <Table
              dataSet={ladderQuotationTableDs}
              columns={this.getColumns()}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            />
          )}
        </div>
      </div>
    );
  }
}
