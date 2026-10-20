import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

import { rfStatusRender } from '../utils';

export default class WaitPublish extends Component {
  constructor(props) {
    super(props);
    const { onRef, tableDisplay, handleAggregationChange } = props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    this.state = {
      aggregation: true,
    };
    if (props.tableDisplay !== 'mid') {
      handleAggregationChange(tableDisplay === 'wide', true);
    }
  }

  @Bind()
  getColumns() {
    const { aggregation } = this.state;
    const { renderRFOperate, inquiryDetail } = this.props;
    const columns = [
      {
        name: 'displayRfStatusMeaning',
        width: 120,
        renderer: rfStatusRender,
      },
      {
        name: 'operat',
        width: 100,
        renderer: ({ record }) => renderRFOperate({ record }, aggregation),
      },
      {
        key: 'rfInfo',
        header: intl.get('ssrc.inquiryHall.view.inquiryHall.RFXInfo').d('询价单信息'),
        width: 230,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'rfNum',
            width: 156,
            renderer: ({ record }) => (
              <a onClick={() => inquiryDetail(record)}>{record.get('rfNum')}</a>
            ),
          },
          {
            name: 'rfTitle',
            width: 196,
          },
          {
            name: 'sourceProjectName',
            width: 116,
          },
          {
            name: 'sourceMethodMeaning',
            width: 116,
          },
        ],
      },
      // {
      //   name: 'implementation',
      //   minWidth: 200,
      //   renderer: ({ record }) =>
      //     record.get('headerWorkFlows')?.length > 0 ? onPopover(record) : QuotationInfo({ record }),
      // },
      {
        key: 'time',
        minWidth: 200,
        align: 'left',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'quotationStartDate',
            width: 176,
          },
          {
            name: 'quotationEndDate',
            width: 156,
          },
        ],
      },
      {
        key: 'organizationInfo',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.organizationInfo').d('组织信息'),
        width: 196,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'companyName',
            width: 166,
          },
          {
            name: 'purOrganizationName',
            width: 156,
          },
        ],
      },
      {
        key: 'createInfo',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.createInfo').d('创建信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'creationDate',
            width: 176,
          },
          {
            name: 'createdByName',
            width: 156,
          },
          {
            name: 'createdUnitName',
            width: 156,
          },
        ],
      },
    ].filter(Boolean);
    return columns;
  }

  statusMap = {
    RFI: intl.get('ssrc.inquiryHall.model.inquiryHall.RFI').d('信息征询书(RFI)'),
    RFP: intl.get('ssrc.inquiryHall.model.inquiryHall.rfp').d('方案征询书(RFP)'),
    RFQ: intl.get('ssrc.inquiryHall.model.inquiryHall.RFQ').d('报价邀请书(RFQ)'),
  };

  @Bind()
  // 切换视图
  handleAggregationChange = (aggregation, handleFlag) => {
    const { tableDisplay, cancelAggregationChange } = this.props;
    const current = aggregation ? 'wide' : 'flat';
    if (!handleFlag && tableDisplay && current !== tableDisplay) {
      cancelAggregationChange();
    }
    this.setState({ aggregation });
  };

  render() {
    let { aggregation } = this.state;
    const { waitPublishDS, changeTypeAggregation } = this.props;
    aggregation = changeTypeAggregation !== undefined ? changeTypeAggregation : aggregation;
    const { customizeTable, currentType } = this.props;
    return customizeTable(
      {
        code: `SSRC.INQUIRY_HALL.RF_LIST.${currentType}_UNRELEASED`,
      },
      <Table
        aggregation={aggregation}
        queryBar="none"
        onAggregationChange={this.handleAggregationChange}
        dataSet={waitPublishDS}
        columns={this.getColumns()}
        // style={{ maxHeight: `calc(100vh - 400px)` }}
        style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
      />
    );
  }
}
