import React, { PureComponent } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { QuotationInfo, statusRender, dragIconRender } from './utils';
import ShowQuotationFeedbackTable from './ShowQuotationFeedbackTable';

import styles from './index.less';

const { Panel } = Collapse;

export default class OnGoingContainer extends PureComponent {
  constructor(props) {
    super(props);
    // if (isFunction(props.onRef)) {
    //   props.onRef(this);
    // }
    // this.props.ref = this;
    this.state = {
      processingAggregation: true,
      attentionAggregation: true,
      approvingAggregation: true,
    };
  }

  /**
   * 展示报价响应情况
   * @param {*} record 行数据
   */
  async showQuotationFeedback(record) {
    const { quotationName, customizeTable, sourceKey } = this.props;
    // const res = getResponse(await quotationFeedBack({organizationId, rfxHeaderId: record.get('rfxHeaderId')}));

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

  getColumns(currentTable) {
    const { processingAggregation, attentionAggregation, approvingAggregation } = this.state;
    let aggregation = true;
    const {
      renderProcessOperate,
      renderApprovalOperate,
      renderAttentionOperate,
      inquiryDetail,
      viewDetail,
      documentTypeName,
      renderSourceCategoryMeaning,
      changeTypeAggregation,
      bidOpeningNewFlag,
      remote,
      sourceKey,
      // biddingHallFlag,
      bidFlag = false,
      onGoingDealDS,
      attentionDS,
      checkPermissionObject,
      customizeTable,
      roundQuotationExecuteFlag = 0,
    } = this.props;

    let currentOperate;
    switch (currentTable) {
      case 'processing':
        currentOperate = ({ record }) =>
          renderProcessOperate(
            { record },
            'processing',
            changeTypeAggregation ?? processingAggregation
          );
        aggregation = changeTypeAggregation ?? processingAggregation;
        break;
      case 'approving':
        currentOperate = ({ record }) =>
          renderApprovalOperate(record, 'approving', changeTypeAggregation ?? attentionAggregation);
        aggregation = changeTypeAggregation ?? approvingAggregation;
        break;
      case 'attention':
        currentOperate = ({ record }) =>
          renderAttentionOperate(
            { record },
            'attention',
            changeTypeAggregation ?? attentionAggregation
          );
        aggregation = changeTypeAggregation ?? attentionAggregation;
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
        width: 120,
        renderer: ({ record }) => statusRender({ record }, aggregation),
        tooltip: 'none',
      },
      {
        name: 'operat',
        width: aggregation ? 120 : currentTable !== 'approving' ? 180 : 150,
        renderer: ({ record }) => currentOperate({ record }, aggregation),
        tooltip: 'none',
      },
      // {
      //   name: 'viewDetail',
      //   width: aggregation ? 200: 80,
      //   minWidth: aggregation ? 200: 80,
      //   renderer: aggregation ? QuotationInfo : viewDetail,
      // },
      !aggregation && {
        name: 'viewDetail',
        width: 150,
        renderer: ({ record }) => viewDetail({ record }),
        tooltip: 'none',
      },
      !aggregation &&
        currentTable !== 'attention' && {
          name: 'quotationFeedBack',
          width: 146,
          renderer: ({ value, record }) => (
            <a onClick={() => this.showQuotationFeedback(record)}> {value} </a>
          ),
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
      aggregation && {
        name: 'viewDetail',
        width: 200,
        renderer: (recordProps) =>
          QuotationInfo(recordProps, {
            remote,
            currentTable,
            bidOpeningNewFlag,
            customizeTable,
            sourceKey,
            roundQuotationExecuteFlag,
          }),
        tooltip: 'none',
      },
      !aggregation && {
        // 拒绝理由
        name: 'approvalMessage',
        width: 200,
      },
      {
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
            width: 156,
          },
          {
            name: 'createdUnitName',
            width: 156,
          },
        ],
      },
    ];
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_GOING_COLUMNS', columns, {
          bidFlag,
          currentTable,
          onGoingDealDS,
          attentionDS,
          checkPermissionObject,
          that: this,
        })
      : columns;
  }

  // 改变所有子表格聚合或平铺
  handleAllAggregationChange = (aggregation) => {
    this.handleProcessAggregationChange(aggregation);
    this.handleAttentionAggregationChange(aggregation);
    this.handleApprovingAggregationChange(aggregation);
  };

  // 切换需要处理视图
  handleProcessAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ processingAggregation: aggregation });
  };

  // 切换需要关注视图
  handleAttentionAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ attentionAggregation: aggregation });
  };

  // 切换审批中视图
  handleApprovingAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ approvingAggregation: aggregation });
  };

  getTableProps = (options = {}) => {
    const { remote } = this.props;
    const { key } = options || {};

    let tableProps = {};
    tableProps = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_GOING_COMMON_TABLE_PROPS', tableProps, {
          that: this,
          key,
        })
      : tableProps;

    tableProps = tableProps || {};

    return tableProps;
  };

  render() {
    let { processingAggregation, attentionAggregation, approvingAggregation } = this.state;
    const {
      remote,
      sourceKey,
      attentionDS,
      onGoingDealDS,
      approvalDS,
      custLoading,
      customizeTable,
      changeTypeAggregation,
      onGoingCollapseKey = [],
      changeOnGoingCollapseKey = noop,
    } = this.props;
    processingAggregation = changeTypeAggregation ?? processingAggregation;
    attentionAggregation = changeTypeAggregation ?? attentionAggregation;
    approvingAggregation = changeTypeAggregation ?? approvingAggregation;

    const onGoings = {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.needDeal').d('需要处理'),
      titleWrap: (
        <div className="statusHeader">
          <div className="needDeal" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.needDeal').d('需要处理')}
        </div>
      ),
      content: customizeTable(
        {
          code: `SSRC.${sourceKey}_HALL.NEW_LIST.ONGOING`,
        },
        <Table
          customizable
          // customizedCode="SSRC.INQUIRY_HALL.NEW_LIST.ONGOING"
          queryBar="none"
          dataSet={onGoingDealDS}
          aggregation={processingAggregation}
          columns={this.getColumns('processing')}
          onAggregationChange={(props) => this.handleProcessAggregationChange(props, true)}
          custLoading={custLoading}
          style={{ maxHeight: 450 }}
          {...this.getTableProps({ key: 'processing' })}
        />
      ),
      key: 'going',
    };

    const attention = {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.needAttention').d('需要关注'),
      titleWrap: (
        <div className="statusHeaderAdd">
          <div className="needfocus" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.needAttention').d('需要关注')}
        </div>
      ),
      content: customizeTable(
        {
          code: `SSRC.${sourceKey}_HALL.NEW_LIST.NEEDATTENTION`,
        },
        <Table
          customizable
          queryBar="none"
          // customizedCode="SSRC.INQUIRY_HALL.NEW_LIST.NEEDATTENTION"
          dataSet={attentionDS}
          aggregation={attentionAggregation}
          columns={this.getColumns('attention')}
          onAggregationChange={(props) => this.handleAttentionAggregationChange(props, true)}
          custLoading={custLoading}
          style={{ maxHeight: 450 }}
          {...this.getTableProps({ key: 'attention' })}
        />
      ),
      key: 'attention',
    };

    const approval = {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.approvaling').d('审批中'),
      titleWrap: (
        <div className="statusHeaderAdd">
          <div className="approval" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.approvaling').d('审批中')}
        </div>
      ),
      content: customizeTable(
        {
          code: `SSRC.${sourceKey}_HALL.NEW_LIST.APPROVAL`,
        },
        <Table
          queryBar="none"
          customizable
          // customizedCode="SSRC.INQUIRY_HALL.NEW_LIST.APPROVAL"
          dataSet={approvalDS}
          aggregation={approvingAggregation}
          columns={this.getColumns('approving')}
          onAggregationChange={(props) => this.handleApprovingAggregationChange(props, true)}
          custLoading={custLoading}
          style={{ maxHeight: 450 }}
          {...this.getTableProps({ key: 'approving' })}
        />
      ),
      key: 'approval',
    };

    let onGoingTabContainer = (
      <Collapse
        defaultActiveKey={onGoingCollapseKey}
        ghost
        trigger="icon"
        expandIconPosition="text-right"
        onChange={changeOnGoingCollapseKey}
      >
        <Panel
          header={onGoings.titleWrap}
          key={onGoings.key}
          forceRender
          className={styles['ssrc-collapse-panel-wrap']}
        >
          {onGoings.content}
        </Panel>
        <Panel
          header={attention.titleWrap}
          key={attention.key}
          forceRender
          className={styles['ssrc-collapse-panel-wrap']}
        >
          {attention.content}
        </Panel>
        <Panel
          header={approval.titleWrap}
          key={approval.key}
          forceRender
          className={styles['ssrc-collapse-panel-wrap']}
        >
          {approval.content}
        </Panel>
      </Collapse>
    );

    onGoingTabContainer = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_GOING_CONTAINER', onGoingTabContainer, {
          that: this,
          onGoings,
          attention,
          approval,
        })
      : onGoingTabContainer;

    return <React.Fragment>{onGoingTabContainer}</React.Fragment>;
  }
}
