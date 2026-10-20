import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { isFunction, noop } from 'lodash';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

import { QuotationInfoRF, rfStatusRender } from '../utils';

export default class Finish extends Component {
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
    const { renderRFOperate, inquiryDetail, viewDetailRF = noop } = this.props;
    const columns = [
      {
        name: 'displayRfStatusMeaning',
        width: 100,
        renderer: rfStatusRender,
      },
      {
        name: 'operat',
        width: aggregation ? 100 : 160,
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
      {
        name: 'implementation',
        minWidth: 200,
        tooltip: 'none',
        renderer: ({ record }) =>
          aggregation ? QuotationInfoRF({ record }) : viewDetailRF({ record }),
      },
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
    ];
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
    const { aggregation } = this.state;
    const { finishDS } = this.props;
    const { customizeTable, currentType } = this.props;
    return customizeTable(
      {
        code: `SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FINISHED`,
      },
      <Table
        aggregation={aggregation}
        queryBar="none"
        onAggregationChange={this.handleAggregationChange}
        dataSet={finishDS}
        columns={this.getColumns()}
        // style={{ maxHeight: `calc(100vh - 400px)` }}
        style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
      />
    );
  }
}
