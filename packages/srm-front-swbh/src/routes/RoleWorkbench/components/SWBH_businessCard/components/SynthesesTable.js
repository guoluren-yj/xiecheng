import React, { Fragment } from 'react';
import { Result } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import CommonTable from '../components/CommonTable';
import Bar from './Bar';

import styles from './index.less';

const SynthesesTable = (props) => {
  /**
   * 综合table
   *
   */
  const { searchHeaderDs, total, currentData, openModal, modalRef, modal, customizerCode, changePagination } = props;
  return (
    <Fragment>
      <div style={{ backgroundColor: '#F9F9F9' }}>
        <div className={styles['search-history-content']}>
          {!isEmpty(currentData) && (
            <div className={styles['access-history']}>
              {!isEmpty(customizerCode) && <Bar dataSet={searchHeaderDs} customizerCode={customizerCode} />}
              <CommonTable
                modal={modal}
                total={total}
                openModal={openModal}
                modalRef={modalRef}
                dataSet={searchHeaderDs}
                showOperation={false}
                customizerCode={customizerCode}
                changePagination={changePagination}
              />
            </div>
          )}
        </div>
        {isEmpty(currentData) && (
          <div className={styles['data-record-wrapper']}>
            <Result status="500" title={intl.get(`srm.common.view.common.noDataResults`).d('暂无数据')} />
          </div>
        )}
      </div>
    </Fragment>
  );
};
export default observer(SynthesesTable);
