import React from 'react';
import { DataSet } from 'choerodon-ui/pro';

// import intl from 'utils/intl';

import AuthorityTable from '@/routes/sagm/ProductAuthorityNew/AuthorityTable';
import { tableDs } from '@/routes/sagm/ProductAuthorityNew/ds';

// import styles from './index.less';

export default class AuthorityHoc extends React.Component {
  tableDs = new DataSet(tableDs());

  componentDidMount() {
    const { agreementType, agreementHeaderId } = this.props;
    // this.tableDs.setQueryParameter('showFlag', 1);
    this.tableDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
    this.tableDs.setQueryParameter('agreementType', agreementType);
    // if (agreementHeaderId) {
    //   this.tableDs.query();
    // }
  }

  shouldComponentUpdate(nextProps) {
    const { agreementHeaderId } = nextProps;
    this.tableDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
    return true;
  }

  render() {
    return (
      <>
        {/* <div className={styles['authority-alert']}>
          <Icon type="info" style={{ fontSize: '14px' }} />
          {intl
            .get('sagm.common.view.editAfterDelayMsg')
            .d('编辑权限后商品更新会存在一定延迟，可能会短暂影响搜索结果')}
        </div> */}
        <AuthorityTable
          {...this.props}
          tableDs={this.tableDs}
          searchBarTable
          searchBarCode="SAGM.WORKBENCH.AUTHORITY.SEARCH_BAR"
          customizedCode="SMALL.AGREEMENT.LIST"
        />
      </>
    );
  }
}
