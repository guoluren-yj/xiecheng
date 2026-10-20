import React, { PureComponent } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
// import { isFunction } from 'lodash';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

import { QuotationInfo, statusRender, dragIconRender } from './utils';
import ShowQuotationFeedbackTable from './ShowQuotationFeedbackTable';

export default class AllContainer extends PureComponent {
  constructor(props) {
    super(props);
    // if (isFunction(props.onRef)) {
    //   props.onRef(this);
    // }
    // this.props.ref = this;
    this.state = {
      aggregation: true,
    };
  }

  /**
   * 展示报价响应情况
   * @param {*} record 行数据
   */
  async showQuotationFeedback(record) {
    const { quotationName, customizeTable, sourceKey } = this.props;
    const showQuotationFeedbackTableProps = {
      rfxHeaderId: record.get('rfxHeaderId'),
      customizeTable,
      sourceKey,
    };

    Modal.open({
      drawer: true,
      key: Modal.key(),
      title: intl
        .get('ssrc.inquiryHall.view.inquiryHall.commonQuotationResponse', { quotationName })
        .d(`{quotationName}响应`),
      children: <ShowQuotationFeedbackTable {...showQuotationFeedbackTableProps} />,
      closable: true,
      style: { width: '742px' },
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      footer: (_, cancelBtn) => <div>{cancelBtn}</div>,
    });
  }

  getColumns() {
    let { aggregation } = this.state;
    const {
      renderOperate,
      inquiryDetail,
      viewDetail,
      changeTypeAggregation,
      documentTypeName,
      renderSourceCategoryMeaning,
      remote,
      sourceKey,
      // biddingHallFlag,
      allDS,
      bidOpeningNewFlag,
      checkPermissionObject,
      customizeTable,
      roundQuotationExecuteFlag,
    } = this.props;
    aggregation = changeTypeAggregation ?? aggregation;
    const columns = [
      {
        name: 'dragIcon',
        width: 50,
        renderer: ({ record }) => dragIconRender({ record }),
      },
      {
        name: 'rfxStatusMeaning',
        tooltip: 'none',
        width: 120,
        renderer: ({ record }) => statusRender({ record }, aggregation),
      },
      {
        name: 'operat',
        width: aggregation ? 120 : 220,
        renderer: ({ record }) => renderOperate({ record }, aggregation),
        tooltip: 'none',
      },
      !aggregation && {
        name: 'viewDetail',
        width: 200,
        renderer: viewDetail,
        tooltip: 'none',
      },
      !aggregation && {
        // 拒绝理由
        name: 'approvalMessage',
        width: 200,
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
            renderer: ({ record }) => (
              <a onClick={() => inquiryDetail(record)}>{record.get('rfxNum')}</a>
            ),
          },
          {
            name: 'rfxTitle',
            width: 160,
          },
          {
            name: 'templateName',
            width: 156,
          },
          {
            name: 'sourceProjectName',
            width: 156,
            hiddenInAggregation: (record) => {
              return !record.get('sourceProjectName');
            },
          },
          {
            name: 'sectionName',
            width: 156,
            hiddenInAggregation: (record) => {
              return !record.get('sectionName');
            },
          },
          {
            name: 'sourceCategoryMeaning',
            width: 116,
            renderer: renderSourceCategoryMeaning,
          },
          {
            name: 'sourceMethodMeaning',
            width: 136,
          },
          sourceKey === 'INQUIRY' && {
            name: 'offlineWholeFlagMeaning',
            width: 136,
          },
        ].filter(Boolean),
        renderer: ({ aggregationTree }) => {
          return <div style={{ marginTop: '5px' }}>{aggregationTree}</div>;
        },
      },
      aggregation && {
        name: 'viewDetail',
        minWidth: 200,
        renderer: (recordProps) =>
          QuotationInfo(recordProps, {
            remote,
            bidOpeningNewFlag,
            customizeTable,
            sourceKey,
            roundQuotationExecuteFlag,
          }),
        tooltip: 'none',
      },
      {
        key: 'time',
        align: 'left',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'prequalEndDate',
            width: 160,
            hiddenInAggregation: (record) => {
              return !record.get('prequalEndDate');
            },
          },
          {
            name: 'quotationStartDate',
            width: 160,
          },
          {
            name: 'quotationEndDate',
            width: 160,
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
            width: 200,
          },
          {
            name: 'purOrganizationName',
            width: 160,
          },
        ],
      },
      aggregation && {
        key: 'quotationRules',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationRules').d('报价规则'),
        width: 160,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'quotationTypeMeaning',
          },
          {
            name: 'sealedQuotationFlag',
            renderer: ({ record }) => yesOrNoRender(record.get('sealedQuotationFlag')),
          },
          {
            name: 'currencyCode',
          },
          {
            name: 'auctionDirectionMeaning',
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
            name: 'sourceCreationDate',
            width: 176,
          },
          {
            name: 'creationDate',
            width: 176,
          },
          {
            name: 'createdByName',
            width: 100,
          },
          {
            name: 'createdUnitName',
            width: 156,
          },
        ],
      },
      !aggregation && {
        name: 'quotationFeedBack',
        width: 80,
        renderer: ({ value, record }) => (
          <a onClick={() => this.showQuotationFeedback(record)}> {value} </a>
        ),
      },
      {
        name: 'brAcceptNoticeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'brAcceptNoticeRuleFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ALL_CONTAINER_COLUMNS', columns, {
          allDS,
          aggregation,
          sourceKey,
          checkPermissionObject,
          that: this,
        })
      : columns;
  }

  // 切换视图
  handleAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ aggregation });
  };

  getTableProps = () => {
    const { remote } = this.props;

    let tableProps = {};
    tableProps = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ALL_COMMON_TABLE_PROPS', tableProps, {
          that: this,
        })
      : tableProps;

    tableProps = tableProps || {};

    return tableProps;
  };

  render() {
    let { aggregation } = this.state;
    const { allDS, customizeTable, changeTypeAggregation, sourceKey } = this.props;
    aggregation = changeTypeAggregation ?? aggregation;

    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_LIST.ALL`,
      },
      <Table
        customizable
        queryBar="none"
        dataSet={allDS}
        aggregation={aggregation}
        columns={this.getColumns()}
        onAggregationChange={(props) => this.handleAggregationChange(props, true)}
        // style={{ maxHeight: `calc(100vh - 400px)` }}
        style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
        {...this.getTableProps()}
      />
    );
  }
}
