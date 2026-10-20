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

const SupplierTable = (props) => {
  const { supplierDs, supplierDocType, searchCode, supplierDocumentType } = useContext(Store);
  const { activeKey, modal, loading, supplierData, handleChecked } = props;
  const { switchDocument, checked } = supplierDocumentType;
  const searchBarFlag = !isEmpty(searchCode) && checked;
  const heightRef = useRef();
  const { offsetHeight } = heightRef.current || {};
  return (
    <Fragment>
      {!isEmpty(supplierData) ? (
        <div className={styles['data-record']}>
          <div className={styles['data-record-field']}>
            <div ref={heightRef} className={styles['data-record-bill']}>
              <span
                className={styles['data-record-text']}
                style={{ position: 'relative', top: offsetHeight > 60 ? 0 : -5 }}
              >
                {intl.get('srm.common.view.common.pleaseSelectDocument').d('请选择任意单据')}
              </span>
              {!isEmpty(supplierDocType) && (
                <ul
                  style={{ display: offsetHeight > 60 ? 'block' : 'inline-block' }}
                  className={classNames(styles['data-record-type'], {
                    [styles['data-record-box']]: offsetHeight > 60,
                  })}
                >
                  {supplierDocType.map((item) => {
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
                dataSet={supplierDs}
                searchCode={searchCode}
                style={{ display: loading ? 'none' : 'block' }}
              />
            )}
          </div>
          <CommonTable modal={modal} dataSet={supplierDs} />
        </div>
      ) : (
        dataResult()
      )}
    </Fragment>
  );
};
export default observer(SupplierTable);
