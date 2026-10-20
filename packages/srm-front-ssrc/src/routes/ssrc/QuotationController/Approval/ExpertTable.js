// 评分明细表table

import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

import { phoneRender } from '@/utils/renderer';
import { renderCompareSymbol } from '../NewDetail/utils';

export default class ExpertTable extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  // table columns
  getColumns() {
    const { currentMode = null, header = {} } = this.props;
    const { bidRuleType = null } = header;

    const columns = [
      {
        name: 'loginName',
        width: 120,
        renderer: (props) => renderCompareSymbol(props, currentMode),
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
    ];

    return columns.filter(Boolean);
  }

  getUnitCode = () => {
    const { currentMode = null, type = null, custKey } = this.props;
    let code = '';
    if (type === 'NONE') {
      code =
        !currentMode || currentMode === 'current'
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_READ`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_HIS`;
    } else {
      code =
        !currentMode || currentMode === `current`
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_READ`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_HIS`;
    }

    return code;
  };

  render() {
    const { ds = {}, customizeTable, custLoading } = this.props;
    const code = this.getUnitCode();

    return (
      <React.Fragment>
        {customizeTable(
          { code },
          <Table
            bordered
            pagination={false}
            dataSet={ds}
            rowKey="evaluateExpertAdjustId"
            custLoading={custLoading}
            columns={this.getColumns()}
          />
        )}
      </React.Fragment>
    );
  }
}
