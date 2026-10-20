import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import ReviewDetail from './ReviewDetail';

@observer
export default class ScoreInitialReviewTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  getDynamicColumns = () => {
    const { reviewExpertList, getCustomizeUnitCode } = this.props;
    const dynamicColumns = [];

    if (isEmpty(reviewExpertList)) {
      return dynamicColumns;
    }

    reviewExpertList.forEach((item) => {
      if (!item) {
        return;
      }

      dynamicColumns.push({
        name: item.name,
        width: 200,
        renderer: ({ record, name }) => {
          const expertData = record.get(name);
          const { reviewResult, reviewResultMeaning } = expertData || {};

          if (!reviewResult) {
            return '';
          }

          const resultColor = reviewResult === 'APPROVED' ? 'green' : 'red';

          const scoringDetailProps = {
            ...this.props,
            formUnitCode: getCustomizeUnitCode('reviewIndicateHeader'),
            tableUnitCode: getCustomizeUnitCode('reviewIndicateList'),
            name,
            recordData: record,
            fieldData: expertData,
            resultColor,
            text: reviewResultMeaning || '-',
            icon: '',
          };

          return <ReviewDetail {...scoringDetailProps} />;
        },
      });
    });

    const dynamicColumnGroup = [
      {
        name: 'reviewResultGroup',
        children: dynamicColumns,
      },
    ];

    return dynamicColumnGroup;
  };

  // table columns
  getColumns = () => {
    const experts = this.getDynamicColumns();
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 300,
      },
      {
        name: 'summaryReviewResult',
        width: 160,
        renderer: ({ record }) => {
          const { summaryReviewResult, summaryReviewResultMeaning } = record.get([
            'summaryReviewResult',
            'summaryReviewResultMeaning',
          ]);

          if (!summaryReviewResult) {
            return;
          }

          return (
            <span style={{ color: summaryReviewResult === 'APPROVED' ? 'green' : 'red' }}>
              {summaryReviewResultMeaning || '-'}
            </span>
          );
        },
      },
      ...experts,
    ];

    return columns.filter(Boolean);
  };

  render() {
    const { ds, getCustomizeUnitCode, customizeTable, custLoading } = this.props;

    return customizeTable(
      {
        code: getCustomizeUnitCode('reviewList'),
      },
      <Table
        border
        custLoading={custLoading}
        dataSet={ds}
        columns={this.getColumns()}
        style={{ maxHeight: 450 }}
      />
    );
  }
}
