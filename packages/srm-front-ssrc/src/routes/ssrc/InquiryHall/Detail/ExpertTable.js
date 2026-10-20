// 评分明细表table

import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

import { phoneRender } from '@/utils/renderer';
import ExtractExpertsView from '@/routes/ssrc/ExpertWorkBench/ExtractExperts/Detail/index';

export default class ExpertTable extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  // table columns
  getColumns = () => {
    const { rfxInfoDS } = this.props;
    const { current } = rfxInfoDS || {};
    const bidRuleType = current ? current?.get('expertExtractFlag') : null;

    const columns = [
      {
        name: 'loginName',
        width: 120,
      },
      {
        name: 'expertName',
      },
      {
        name: 'evaluateLeaderFlagMeaning',
        width: 150,
      },
      bidRuleType !== 'NONE'
        ? {
            name: 'teamMeaning',
            width: 150,
          }
        : null,
      {
        name: 'expertCategoryMeaning',
        width: 150,
        renderer: ({ record }) => {
          const expertTypeMeaning = record.get('expertTypeMeaning');

          return expertTypeMeaning || null;
        },
      },
      {
        name: 'expertFromMeaning',
        width: 130,
      },
      {
        name: 'phone',
        width: 200,
        renderer: ({ record }) => {
          return phoneRender(record.get('internationalTelCodeMeaning'), record.get('phone'));
        },
      },
      {
        name: 'email',
        width: 180,
      },
    ].filter(Boolean);

    return columns;
  };

  renderTableButtons() {
    const { sourceHeaderId, rfxInfoDS } = this.props;

    const TableButtons = [
      rfxInfoDS?.current?.get('expertExtractFlag') ? (
        <ExtractExpertsView sourceFrom="RFX" sourceFromId={sourceHeaderId} />
      ) : null,
    ].filter(Boolean);
    return TableButtons;
  }

  render() {
    const { ds = {}, customizeTable, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    return (
      <React.Fragment>
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.EXPERT` },
          <Table
            bordered
            pagination={false}
            dataSet={ds}
            rowKey="evaluateExpertId"
            columns={this.getColumns()}
            buttons={this.renderTableButtons()}
            style={{ maxHeight: 450 }}
          />
        )}
      </React.Fragment>
    );
  }
}
