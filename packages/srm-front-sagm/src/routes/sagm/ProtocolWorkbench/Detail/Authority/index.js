import React, { Component, Fragment } from 'react';
// import { DataSet } from 'choerodon-ui/pro';

// import intl from 'utils/intl';

// import { authorityDs } from '../ds';
// import AuthorityTable from './AuthorityTable';
import AuthorityTable from '@/routes/sagm/ProductAuthorityNew/AuthorityTable';
// import styles from './index.less';

const searchBarCode = 'SAGM.WORKBENCH.AUTHORITY.SEARCH_BAR';

export default class Authority extends Component {
  componentDidMount() {
    const { agreementType, agreementHeaderId, dataSet } = this.props;
    dataSet.setQueryParameter('showFlag', 1);
    dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
    dataSet.setQueryParameter('agreementType', agreementType);
    dataSet.setQueryParameter('customizeUnitCode', searchBarCode);
  }

  shouldComponentUpdate(nextProps) {
    const { agreementHeaderId, deleteFlag } = nextProps;
    const { dataSet } = this.props;
    dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
    dataSet.setQueryParameter('deleteFlag', deleteFlag);
    return true;
  }

  render() {
    const {
      readOnly,
      // channel,
      agreementType,
      agreementHeaderId,
      agreementHeaderNum,
      viewSkuBackPath,
      dataSet,
      // isWorkFlow,
      deleteFlag,
    } = this.props;
    if (agreementHeaderId) {
      // dataSet.paging = true;
      // dataSet.queryDataSet = this.queryDs;
    }

    return (
      <Fragment>
        {/* <div className={styles['authority-alert']}>
          <Icon type="info" style={{ fontSize: '14px' }} />
          {intl
            .get('sagm.common.view.editAfterDelayMsg')
            .d('编辑权限后商品更新会存在一定延迟，可能会短暂影响搜索结果')}
        </div> */}
        <AuthorityTable
          // channel={channel}
          searchBarTable
          tableDs={dataSet}
          deleteFlag={deleteFlag}
          readOnly={readOnly}
          agreementType={agreementType}
          viewSkuBackPath={viewSkuBackPath}
          agreementHeaderId={agreementHeaderId}
          agreementHeaderNum={agreementHeaderNum}
          searchBarCode={searchBarCode}
          path=""
          customizedCode="SAGM.WORKBENCH.AUTHORITY.LIST"
          // optionsFilter={isWorkFlow ? ['view'] : []}
          style={{ maxHeight: 450 }}
        />
      </Fragment>
    );
  }
}
