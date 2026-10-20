import React, { Component, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';

import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

@withRouter
export default class ApproveRecord extends Component {
  renderColumns() {
    const columns = [
      {
        name: 'approveSequenceCodeMeaning',
        width: 120,
      },
      {
        name: 'processNodeName',
        width: 120,
      },
      {
        name: 'processName',
        width: 120,
      },
      {
        name: 'processActionMeaning',
        width: 120,
      },
      {
        name: 'processDate',
        width: 120,
      },
      {
        name: 'processRemark',
        width: 120,
        tooltip: 'overflow',
      },
    ];
    return columns;
  }

  render() {
    const { isShowExport = false, pcHeaderId, approveRecordDs } = this.props;
    const baseExportBtnProps = {
      icon: 'export',
    };
    const exportRequestUrl = `${SRM_SPCM}/v1/${organizationId}/pc-approval-records/approvel-records/export`;
    const queryParams = {
      pcHeaderId,
    };
    return (
      <Fragment>
        {isShowExport && (
          <div className={styles['btn-wrapper']}>
            <ExcelExport
              buttonText={intl.get(`hzero.common.button.export`).d('导出')}
              otherButtonProps={baseExportBtnProps}
              requestUrl={exportRequestUrl}
              queryParams={queryParams}
            />
          </div>
        )}
        <Table dataSet={approveRecordDs} columns={this.renderColumns()} />
      </Fragment>
    );
  }
}
