import React, { Component, Fragment } from 'react';
import { DataSet, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { queryDs, tableDs } from '../../../ProductAuthority/ds';
import AuthorityTable from '../../../ProductAuthority/AuthorityTable';
import styles from './index.less';

export default class Authority extends Component {
  tableDs = new DataSet(tableDs({ paging: false }));

  queryDs = new DataSet(queryDs(true));

  componentDidMount() {
    const { agreementType, agreementHeaderId } = this.props;
    this.tableDs.setQueryParameter('showFlag', 1);
    this.tableDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
    this.tableDs.setQueryParameter('agreementType', agreementType);
    if (agreementHeaderId) {
      this.tableDs.query();
    }
  }

  shouldComponentUpdate(nextProps) {
    const { agreementHeaderId } = nextProps;
    this.tableDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
    return true;
  }

  render() {
    const {
      readOnly,
      channel,
      controlRange,
      agreementType,
      agreementHeaderId,
      agreementHeaderNum,
      agreementHeaderType,
      viewSkuBackPath,
    } = this.props;
    if (agreementHeaderId) {
      this.tableDs.paging = true;
      this.tableDs.queryDataSet = this.queryDs;
    }

    return (
      <Fragment>
        <div className={styles['authority-alert']}>
          <Icon type="info" style={{ fontSize: '14px' }} />
          {intl
            .get('sagm.common.view.editAfterDelayMsg')
            .d('编辑权限后商品更新会存在一定延迟，可能会短暂影响搜索结果')}
        </div>
        <AuthorityTable
          channel={channel}
          tableDs={this.tableDs}
          readOnly={readOnly}
          controlRange={controlRange}
          agreementType={agreementType}
          viewSkuBackPath={viewSkuBackPath}
          agreementHeaderId={agreementHeaderId}
          agreementHeaderNum={agreementHeaderNum}
          agreementHeaderType={agreementHeaderType}
        />
      </Fragment>
    );
  }
}
