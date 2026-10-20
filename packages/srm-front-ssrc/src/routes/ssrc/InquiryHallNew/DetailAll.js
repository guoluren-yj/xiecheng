// 明细-全部

import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import { statusRender, dragIconRender } from './utils';

@observer
export default class DetailAll extends PureComponent {
  constructor(props) {
    super(props);
    // if (isFunction(props.onRef)) {
    //   props.onRef(this);
    // }
    // this.props.ref = this;

    this.state = {
      detailAllAggregation: true,
    };
  }

  getColumns() {
    const { detailAllAggregation } = this.state;
    const {
      doubleUnitFlag,
      inquiryDetail,
      documentTypeName,
      renderSourceCategoryMeaning,
      changeTypeAggregation,
      sourceKey,
      remote,
    } = this.props;
    const aggregation = changeTypeAggregation ?? detailAllAggregation;

    let columns = [
      {
        name: 'dragIcon',
        width: 50,
        renderer: ({ record }) => dragIconRender({ record }),
      },
      {
        header: intl.get('ssrc.inquiryHall.view.status').d('状态'),
        name: 'rfxStatusMeaning',
        width: 140,
        renderer: ({ record }) => statusRender({ record }, aggregation),
        tooltip: 'none',
      },
      {
        header: intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息') + 1,
        key: 'itemOne',
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'itemCode',
            width: 160,
          },
          {
            name: 'itemName',
            width: 160,
          },
          {
            name: 'rfxLineItemNum',
            width: 160,
          },
          {
            name: 'itemCategoryName',
            width: 160,
          },
          {
            name: 'ouName',
            width: 160,
          },
          {
            name: 'invOrganizationName',
            width: 160,
          },
          {
            name: 'demandDate',
            width: 120,
          },
        ],
      },
      {
        header: intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息') + 2,
        key: 'itemTwo',
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          doubleUnitFlag
            ? {
                name: 'secondaryQuantity',
                width: 140,
              }
            : null,
          doubleUnitFlag
            ? {
                name: 'secondaryUomName',
                width: 140,
                renderer: ({ value }) => numberSeparatorRender(value),
              }
            : null,
          {
            name: 'rfxQuantity',
            width: 140,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
          {
            name: 'uomName',
            width: 140,
          },
          {
            name: 'specs',
            width: 160,
          },
          {
            name: 'batchPrice',
            width: 160,
            align: 'right',
          },
          {
            name: 'taxIncludedFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'taxRate',
            width: 100,
            align: 'right',
          },
        ],
      },
      {
        key: 'rfxInfo',
        header: intl
          .get('ssrc.inquiryHall.view.inquiryHall.commonRFXInfo', { documentTypeName })
          .d(`{documentTypeName}信息`),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'rfxNum',
            width: 150,
            renderer: ({ value, record }) => (
              <a onClick={() => inquiryDetail(record, 'detailAll')}>{value || ''}</a>
            ),
          },
          {
            name: 'rfxTitle',
            width: 196,
          },
          {
            name: 'templateName',
            width: 156,
          },
          {
            name: 'sourceCategoryMeaning',
            width: 116,
            renderer: renderSourceCategoryMeaning,
          },
          {
            name: 'sourceMethodMeaning',
            width: 116,
          },
          sourceKey === 'INQUIRY' && {
            name: 'offlineWholeFlagMeaning',
            width: 116,
          },
        ].filter(Boolean),
      },
      {
        key: 'dateTime',
        header: intl.get('ssrc.common.view.time').d('时间'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'quotationStartDate',
            width: 186,
          },
          {
            name: 'quotationEndDate',
            width: 186,
          },
        ],
      },
      {
        key: 'organizationInfo',
        header: intl.get(`ssrc.inquiryHall.view.orgInfos`).d('组织信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'companyName',
            width: 196,
          },
          {
            name: 'purOrganizationName',
            width: 156,
          },
        ],
      },
      {
        key: 'quotationRule',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationRules').d('报价规则'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'quotationTypeMeaning',
            width: 120,
          },
          {
            name: 'sealedQuotationFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'currencyCode',
            width: 120,
          },
          {
            name: 'auctionDirectionMeaning',
            width: 160,
          },
        ],
      },
      {
        key: 'creationInfo',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.createInfo').d('创建信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'createdByName',
            width: 140,
          },
          {
            name: 'createdUnitName',
            width: 140,
          },
          {
            name: 'sourceCreationDate',
            width: 140,
          },
          {
            name: 'creationDate',
            width: 140,
          },
        ],
      },
    ];

    columns = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_DETAIL_ALL_TABLE_COLUMNS', columns, {
          that: this,
        })
      : columns;

    return columns || [];
  }

  // 改变所有子表格聚合或平铺
  handleAllAggregationChange = (aggregation) => {
    this.handleInquiryAggregationChange(aggregation);
  };

  // 询价成功切换视图
  handleInquiryAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ detailAllAggregation: aggregation });
  };

  render() {
    const {
      sourceKey,
      detailAllDS,
      custLoading,
      customizeTable,
      changeTypeAggregation,
    } = this.props;
    let { detailAllAggregation } = this.state;

    detailAllAggregation = changeTypeAggregation ?? detailAllAggregation;

    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_LIST.DETAIL_ALL`,
      },
      <Table
        customizable
        queryBar="none"
        dataSet={detailAllDS}
        aggregation={detailAllAggregation}
        columns={this.getColumns()}
        custLoading={custLoading}
        style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
      />
    );
  }
}
