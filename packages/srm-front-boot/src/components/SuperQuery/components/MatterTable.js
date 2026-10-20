import React, { Fragment, useContext } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { dataResult } from './utils';
import CommonTable from './CardTable';
import { Store } from '../stores';
import styles from './index.less';

const MatterTable = (props) => {
  const { matterDs, useMatter } = useContext(Store);
  const { modal } = props;
  const { matterData, matterTotal } = useMatter;
  const totalCount = matterTotal >= 10000 ? '10000+' : matterTotal;
  return (
    <Fragment>
      {!isEmpty(matterData) ? (
        <div className={styles['data-record']}>
          <div style={{ position: 'relative', bottom: 5 }}>
            <div style={{ display: 'inline-block' }} className={styles['data-record-bill']}>
              <span className={styles['data-record-text']}>
                {intl.get('srm.common.view.common.queryTo').d('查询到')}
                <span style={{ margin: '0 3px 0 3px' }}>{totalCount}</span>
                {intl.get('srm.common.view.common.relatedItems').d('个相关物料')}
              </span>
            </div>
          </div>
          <CommonTable modal={modal} dataSet={matterDs} />
        </div>
      ) : (
        dataResult()
      )}
    </Fragment>
  );
};
export default observer(MatterTable);
