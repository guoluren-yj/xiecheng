// 完成tab

import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { descriptionRender, statusRender, QuotationInfo, dragIconRender } from './utils';

import styles from './index.less';

const { Panel } = Collapse;

export default class FinishedContainer extends PureComponent {
  constructor(props) {
    super(props);
    // if (isFunction(props.onRef)) {
    //   props.onRef(this);
    // }
    // this.props.ref = this;
    this.state = {
      inquiryAggregation: true,
      otherAggregation: true,
    };
  }

  getFinishedCommonColumns(fromWhere) {
    const { inquiryAggregation, otherAggregation } = this.state;
    const {
      renderOperate,
      inquiryDetail,
      documentTypeName,
      renderSourceCategoryMeaning,
      changeTypeAggregation,
      sourceKey,
      // biddingHallFlag,
      remote,
      finishOthersDS,
      finishInquirySuccessDS,
      checkPermissionObject,
    } = this.props;
    let aggregation = true;
    switch (fromWhere) {
      case 'inquirySuccess':
        aggregation = changeTypeAggregation ?? inquiryAggregation;
        break;
      case 'other':
        aggregation = changeTypeAggregation ?? otherAggregation;
        break;
      default:
        break;
    }

    const columns = [
      {
        name: 'dragIcon',
        width: 50,
        renderer: ({ record }) => dragIconRender({ record }),
      },
      {
        name: 'rfxStatusMeaning',
        width: 100,
        renderer: ({ record }) => statusRender({ record }, aggregation),
        tooltip: 'none',
      },
      {
        name: 'operat',
        width: aggregation ? 100 : 150,
        renderer: ({ record }) => renderOperate({ record }, aggregation, fromWhere),
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
            width: 196,
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
    ];

    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_FINISHED_COMMON_COLUMNS', columns, {
          sourceKey,
          aggregation,
          currentTab: fromWhere,
          finishInquirySuccessDS,
          finishOthersDS,
          checkPermissionObject,
          that: this,
        })
      : columns;
  }

  getColumns() {
    const { inquiryAggregation } = this.state;
    const { viewDetail } = this.props;
    const commonColumns = this.getFinishedCommonColumns('inquirySuccess');

    const columns = [
      ...commonColumns,
      !inquiryAggregation && {
        key: 'time',
        width: 200,
        align: 'left',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'prequalEndDate',
            width: 176,
            hiddenInAggregation: (record) => {
              return !record.get('prequalEndDate');
            },
          },
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
      !inquiryAggregation && {
        name: 'viewSuggestedSuppliers',
        width: 200,
        renderer: viewDetail,
      },
      inquiryAggregation && {
        name: 'viewSuggestedSuppliers',
        width: 200,
        renderer: QuotationInfo,
        tooltip: 'none',
      },
      inquiryAggregation && {
        key: 'finishedTime',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'checkFinishedDate',
          },
          {
            name: 'checkFinishedDate2',
            hiddenInAggregation: (record) => {
              return !record.get('checkFinishedDate2');
            },
          },
          {
            name: 'checkFinishedDate3',
            hiddenInAggregation: (record) => {
              return !record.get('checkFinishedDate3');
            },
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
            width: 156,
          },
        ],
      },
      inquiryAggregation && {
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
            width: 156,
          },
          {
            name: 'createdUnitName',
            width: 156,
          },
        ],
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
    return columns;
  }

  // others columns
  getOthersColumns() {
    const { otherAggregation } = this.state;
    const commonColumns = this.getFinishedCommonColumns('other');
    const columns = [
      ...commonColumns,
      {
        key: 'description',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.descriptions').d('说明'),
        aggregation: true,
        align: 'left',
        aggregationLimit: 4,
        width: 196,
        children: [
          {
            name: 'descriptionObject',
            renderer: descriptionRender,
          },
          otherAggregation && {
            name: 'descriptionObject2',
            hiddenInAggregation: (record) => {
              return !record.get('descriptionObject2');
            },
            renderer: descriptionRender,
          },
          otherAggregation && {
            name: 'descriptionObject3',
            hiddenInAggregation: (record) => {
              return !record.get('descriptionObject3');
            },
            renderer: descriptionRender,
          },
        ],
      },
      otherAggregation && {
        key: 'finishedTime',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'checkFinishedDate',
          },
          {
            name: 'checkFinishedDate2',
            hiddenInAggregation: (record) => {
              return !record.get('checkFinishedDate2');
            },
          },
          {
            name: 'checkFinishedDate3',
            hiddenInAggregation: (record) => {
              return !record.get('checkFinishedDate3');
            },
          },
        ],
      },
      !otherAggregation && {
        key: 'time',
        width: 200,
        align: 'left',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'prequalEndDate',
            width: 176,
            hiddenInAggregation: (record) => {
              return !record.get('prequalEndDate');
            },
          },
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
            width: 200,
          },
          {
            name: 'purOrganizationName',
            width: 156,
          },
        ],
      },
      otherAggregation && {
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

  // 改变所有子表格聚合或平铺
  handleAllAggregationChange = (aggregation) => {
    this.handleInquiryAggregationChange(aggregation);
    this.handleOtherAggregationChange(aggregation);
  };

  // 询价成功切换视图
  handleInquiryAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ inquiryAggregation: aggregation });
  };

  // 其他切换视图
  handleOtherAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ otherAggregation: aggregation });
  };

  render() {
    let { inquiryAggregation, otherAggregation } = this.state;
    const {
      sourceKey,
      finishOthersDS,
      finishInquirySuccessDS,
      custLoading,
      customizeTable,
      changeTypeAggregation,
      sourceCategoryName,
      finishCollapseKey = [],
      changeFinishCollapseKey = noop,
    } = this.props;
    inquiryAggregation = changeTypeAggregation ?? inquiryAggregation;
    otherAggregation = changeTypeAggregation ?? otherAggregation;

    return (
      <React.Fragment>
        <Collapse
          defaultActiveKey={finishCollapseKey}
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          onChange={changeFinishCollapseKey}
        >
          <Panel
            header={
              <div className="statusHeader">
                <div className="needDeal" />
                <div>
                  {intl
                    .get('ssrc.inquiryHall.view.inquiryHall.commonInquiryingSuccess', {
                      sourceCategoryName,
                    })
                    .d(`{sourceCategoryName}成功`)}
                </div>
              </div>
            }
            key="finished"
            forceRender
            className={styles['ssrc-collapse-panel-wrap']}
          >
            {customizeTable(
              {
                code: `SSRC.${sourceKey}_HALL.NEW_LIST.FINISHED`,
              },
              <Table
                customizable
                queryBar="none"
                customizedCode={`SSRC.${sourceKey}_HALL.NEW_LIST.FINISHED`}
                dataSet={finishInquirySuccessDS}
                aggregation={inquiryAggregation}
                columns={this.getColumns()}
                onAggregationChange={(props) => this.handleInquiryAggregationChange(props, true)}
                custLoading={custLoading}
                style={{ maxHeight: 450 }}
              />
            )}
          </Panel>
          <Panel
            header={
              <div className="statusHeaderAdd">
                <div className="needDeal" />
                <div>{intl.get('ssrc.common.others').d('其它')}</div>
              </div>
            }
            key="others"
            forceRender
            className={styles['ssrc-collapse-panel-wrap']}
          >
            {customizeTable(
              {
                code: `SSRC.${sourceKey}_HALL.NEW_LIST.OTHERS`,
              },
              <Table
                customizable
                queryBar="none"
                dataSet={finishOthersDS}
                aggregation={otherAggregation}
                columns={this.getOthersColumns()}
                onAggregationChange={(props) => this.handleOtherAggregationChange(props, true)}
                custLoading={custLoading}
                style={{ maxHeight: 450 }}
              />
            )}
          </Panel>
        </Collapse>
      </React.Fragment>
    );
  }
}
