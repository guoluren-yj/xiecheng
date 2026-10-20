import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import styles from './index.less';

export default class SupplierList extends Component{
  constructor(props){
    super(props);
  }
  render() {
    const { currentId = '', quotationHeaderId = '', supplierCompanyName = '', supplierCompanyNum = '', fetchTabList = () => {}, offQuotationDetailImportFlag = 0 } = this.props;
    return (
      <div
        onClick={() => fetchTabList(quotationHeaderId)}
        className={styles['supplier-item']}
      >
        <Tooltip title={supplierCompanyName}><div style={{ display: 'flex' }}><div className={styles['supplier-name']} style={{ color: currentId === quotationHeaderId && '#00B8CC' }}>{supplierCompanyName}</div>{offQuotationDetailImportFlag === 0 && <Badge dot />}</div></Tooltip>
        <Tooltip title={supplierCompanyNum}><div className={styles['supplier-code']}>{supplierCompanyNum}</div></Tooltip>
        {currentId === quotationHeaderId && <div className={styles['supplier-check-flag']} />}
      </div>
    );
  }
}