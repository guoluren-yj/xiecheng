import React, { Fragment, useContext, useRef } from 'react';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { dataResult } from './utils';
import CommonTable from './CardTable';
import Bar from './Bar';
import { Store } from '../stores';

import styles from './index.less';

const { CheckableTag } = Tag;

const BillTable = (props) => {
  const { billDocType, searchCode, billDocumentType } = useContext(Store);
  const { activeKey, modal, loading, billData, handleChecked, billHeaderDs } = props;
  const { switchDocument, checked } = billDocumentType;
  // const searchBarFlag = !isEmpty(searchCode) && checked && !loading;
  const searchBarFlag = !isEmpty(searchCode) && checked;
  // console.log('searchBarFlag', searchBarFlag, searchCode, checked, loading);
  const heightRef = useRef();
  const { offsetHeight } = heightRef.current || {};
  return (
    <Fragment>
      {/* {!isEmpty(billData) ? ( */}
      <div
        className={styles['data-record']}
        style={{ display: !isEmpty(billData) ? 'flex' : 'none' }}
      >
        <div className={styles['data-record-field']}>
          <div ref={heightRef} className={styles['data-record-bill']}>
            <span
              className={styles['data-record-text']}
              style={{ position: 'relative', top: offsetHeight > 60 ? 0 : -5 }}
            >
              {intl.get('srm.common.view.common.pleaseSelectDocument').d('请选择任意单据')}
            </span>
            {!isEmpty(billDocType) && (
              <ul
                style={{ display: offsetHeight > 60 ? 'block' : 'inline-block' }}
                className={classNames(styles['data-record-type'], {
                  [styles['data-record-box']]: offsetHeight > 60,
                })}
              >
                {billDocType.map((item) => {
                  const totalCount = item.totalElements >= 10000 ? '10000+' : item.totalElements;
                  return (
                    <CheckableTag
                      className={classNames(styles['data-record-type-tag'], {
                        [styles['data-record-type-switch']]:
                          checked && switchDocument === item.docTypeCode,
                      })}
                      key={item.docTypeCode}
                      checked={checked}
                      onChange={(e) => handleChecked(e, item.docTypeCode, activeKey)}
                    >
                      {item.docTypeName}
                      <span>{totalCount}</span>
                    </CheckableTag>
                  );
                })}
              </ul>
            )}
          </div>

          {searchBarFlag && (
            <Bar
              dataSet={billHeaderDs}
              searchCode={searchCode}
              style={{ display: loading ? 'none' : 'block' }}
            />
          )}
        </div>
        <CommonTable modal={modal} dataSet={billHeaderDs} />
      </div>
      {/* ) : ( */}
      {isEmpty(billData) ? dataResult() : null}

      {/* )} */}
    </Fragment>
  );
};
export default observer(BillTable);
