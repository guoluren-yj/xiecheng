import React, { PureComponent } from 'react';
import { Rate, Icon } from 'choerodon-ui';
import { Table } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
// import { isFunction, isEqual } from 'lodash';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

import { statusRender, dragIconRender } from './utils';
import styles from './index.less';

export default class ToBeReleasedContainere extends PureComponent {
  constructor(props) {
    super(props);
    // if (isFunction(props.onRef)) {
    //   props.onRef(this);
    // }
    // debugger;
    // this.props.ref = this;
    this.state = {
      aggregation: true,
    };
  }

  getColumns() {
    const { aggregation } = this.state;
    const {
      renderOperate,
      inquiryDetail,
      documentTypeName,
      renderSourceCategoryMeaning,
      sourceKey,
      remote,
    } = this.props;
    let columns = [
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
        width: aggregation ? 100 : 100,
        renderer: ({ record }) => renderOperate({ record }, aggregation),
      },
      {
        key: 'rfxInfo',
        header: intl
          .get('ssrc.inquiryHall.view.inquiryHall.commonRFXInfo', { documentTypeName })
          .d(`{sourceCategoryName}信息`),
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
      {
        name: 'finishingRate',
        width: 180,
        renderer: ({ value }) => {
          return (
            <Rate
              disabled
              style={{ color: '#47B881' }}
              count={6}
              value={value}
              character={<Icon type="star_border" />}
              className={styles['rate-container']}
            />
          );
        },
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

    columns = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_TO_BE_RELEASED_TABLE_COLUMNS', columns, {
          that: this,
        })
      : columns;

    return columns || [];
  }

  // 切换视图
  handleAggregationChange = (aggregation, handleChangeFlag) => {
    if (handleChangeFlag) {
      const { cancelAggregationChange } = this.props;
      cancelAggregationChange();
    }
    this.setState({ aggregation });
  };

  render() {
    let { aggregation } = this.state;
    const { toBeReleasedDS, customizeTable, changeTypeAggregation, sourceKey } = this.props;
    aggregation = changeTypeAggregation !== undefined ? changeTypeAggregation : aggregation;
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_LIST.WAIT_RELEASED`,
      },
      <Table
        customizable
        queryBar="none"
        // customizedCode="SSRC.INQUIRY_HALL.NEW_LIST.WAIT_RELEASED"
        dataSet={toBeReleasedDS}
        aggregation={aggregation}
        columns={this.getColumns()}
        onAggregationChange={(props) => this.handleAggregationChange(props, true)}
        // custLoading={custLoading}
        // style={{ maxHeight: `calc(100vh - 400px)` }}
        style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
      />
    );
  }
}
