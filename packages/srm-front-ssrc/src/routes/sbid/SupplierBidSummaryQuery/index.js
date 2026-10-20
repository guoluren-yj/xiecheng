/**
 * 投标汇总查询
 * @date: 2020-12-23
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { exportSupplierQuotationLines } from '@/services/bidHallService';
import { numberSeparatorRender } from '@/utils/renderer';
import { isText } from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { lineDS } from './LineDS';

const promptCode = 'ssrc.supplierBidSummaryQuery';

@withCustomize({
  unitCode: ['SSRC.SUPPLIER_BID_SUMMARY.QUERY'],
})
@formatterCollections({ code: ['ssrc.supplierBidSummaryQuery', 'ssrc.common'] })
export default class SupplierBidSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doubleUnitFlag: false,
    };
  }

  lineDS = new DataSet(lineDS());

  componentDidMount() {
    this.lineDS.setQueryParameter('customizeUnitCode', 'SSRC.SUPPLIER_BID_SUMMARY.QUERY');
    this.queryDoubleUnit();
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  /**
   * 导出Excel
   */
  @Bind()
  async handleExport() {
    const quotationLineIds = this.lineDS.selected.map((item) => item.toData().quotationLineId);
    const downloadUrl = await exportSupplierQuotationLines({
      quotationLineIds: quotationLineIds.join(','),
    });
    if (downloadUrl) {
      fetch(downloadUrl)
        .then((res) => res.blob()) // 创建文件流
        .then((data) => {
          const blobUrl = window.URL.createObjectURL(data); // 通过原生方法createObjectURL创建文件流的资源路径
          const a = document.createElement('a');
          a.download = decodeURIComponent(
            `${intl
              .get(`${promptCode}.model.supBidSumQuery.export`)
              .d('供应商投标汇总查询导出')}.xls`
          );
          a.href = blobUrl;
          a.click();
        });
    }
  }

  getColumns() {
    const { doubleUnitFlag } = this.state;
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
        lock: 'left',
      },
      {
        name: 'erpSupplierCompanyNum',
        width: 150,
        lock: 'left',
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        lock: 'left',
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'itemCode',
        width: 120,
        lock: 'left',
      },
      {
        name: 'itemName',
        width: 150,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'netPrice',
        width: 150,
      },
      {
        name: 'taxPrice',
        width: 100,
      },
      {
        name: 'quotaionDetail',
        width: 150,
        renderer: ({ record }) => (
          <QuotationDetail rowData={record} sourceFrom="BID" uiType="c7n-pro" allowBuyerViewFlag />
        ),
      },
      {
        name: 'freightAmount',
        width: 100,
      },
      {
        name: 'suggestedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'allottedQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'bidQuantity',
        width: 150,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      // doubleUnitFlag
      //   ? {
      //       name: 'bidQuantity',
      //       width: 100,
      //       renderer: ({ value }) => numberSeparatorRender(value),
      //     }
      //   : null,
      {
        name: 'demandDate',
        width: 120,
      },
      {
        name: 'currentQuotationQuantity',
        width: 100,
      },
      // doubleUnitFlag
      //   ? {
      //       name: 'uomName',
      //       width: 150,
      //       renderer: ({ value }) => (
      //         <Popover content={value} placement="topLeft">
      //           {value}
      //         </Popover>
      //       ),
      //     }
      //   : null,
      {
        name: 'taxCode',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'exchangeRate',
        width: 100,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'specifications',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'bidLineItemNum',
        width: 100,
      },
      {
        name: 'sectionNum',
        width: 120,
      },
      {
        name: 'sectionName',
        width: 150,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'roundNumber',
        width: 100,
      },
      {
        name: 'bidNum',
        width: 200,
      },
      {
        name: 'bidTitle',
        width: 200,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'sourceMethodMeaning',
        width: 120,
      },
      {
        name: 'purOrganizationCode',
        width: 120,
      },
      {
        name: 'purOrganizationName',
        width: 150,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'ouName',
        width: 150,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'invOrganizationName',
        width: 150,
        renderer: ({ value }) => (
          <Popover content={value} placement="topLeft">
            {value}
          </Popover>
        ),
      },
      {
        name: 'createByName',
        width: 150,
      },
      {
        name: 'finishDate',
        width: 120,
      },
      {
        name: 'quotationExpiryDateFrom',
        width: 120,
      },
      {
        name: 'quotationExpiryDateTo',
        width: 120,
      },
    ].filter(Boolean);
    return columns;
  }

  render() {
    const { custLoading, customizeTable = () => {} } = this.props;

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.summaryQuery}`).d('供应商投标汇总查询')}
        >
          <Button icon="export" color="primary" onClick={this.handleExport}>
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        </Header>
        <Content>
          {customizeTable(
            {
              code: 'SSRC.SUPPLIER_BID_SUMMARY.QUERY',
            },
            <Table
              custLoading={custLoading}
              dataSet={this.lineDS}
              queryFieldsLimit={3}
              columns={this.getColumns()}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
