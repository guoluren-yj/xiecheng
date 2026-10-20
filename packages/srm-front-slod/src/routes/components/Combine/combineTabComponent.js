import React, { Fragment, useCallback } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil } from 'lodash';

import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import styles from './index.less';

// import data from './data';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

const CombineTabComponent = (props) => {
  const {
    data = [],
    typeId,
    showName,
    nodeTitle = '',
    receiptsCod,
    instantlyId,
    queryChangeBack = (e) => e,
  } = props;

  const _text =
    organizationId === tenantId
      ? intl.get('slod.deliveryWorkbench.model.receipt.supplierCompanyId').d('供应商')
      : intl.get('slod.deliveryWorkbench.model.receipt.purchase').d('采购方');

  const onChangeTree = (ele) => {
    queryChangeBack(ele[typeId]);
  };

  const firstToUpper = useCallback(
    (ele = {}, str = null) => {
      const code = str?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
      const text = `display${code}Num`;
      return ele[text];
    },
    [receiptsCod]
  );

  const showNames = (i, tip = null) => {
    if (organizationId === tenantId) {
      if (isNil(tip)) {
        return `${i[showName.supplierName]}`;
      }
      if (!isNil(tip)) {
        return `${tip}:${i[showName.supplierName]}`;
      }
    } else {
      if (isNil(tip)) {
        return `${i[showName.companyName]}`;
      }
      if (!isNil(tip)) {
        return `${tip}:${i[showName.companyName]}`;
      }
    }
  };

  return (
    <Fragment>
      <div
        className={styles['det-tree']}
        // style={{minHeight: _height || 550}}
      >
        <div>
          <div className={styles['tree-up']}>
            <div className={styles['tree-up-left']}>
              <div className={styles['tree-title']}>
                <div className={styles['tree-title-up']}>
                  <span className={styles['tree-title-up-text']}>
                    <Tooltip
                      title={`${nodeTitle}${intl
                        .get('slod.deliveryWorkbench.view.title.ddsubmit')
                        .d('多单提交')}`}
                    >
                      {`${nodeTitle}${intl
                        .get('slod.deliveryWorkbench.view.title.ddsubmit')
                        .d('多单提交')}`}
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['tree-title-down']}>
                  <span className={styles['tree-title-down-text']}>
                    <Tooltip
                      title={intl
                        .get('slod.deliveryWorkbench.model.receipt.dianjiqiehuan')
                        .d('点击单号快速切换')}
                    >
                      {intl
                        .get('slod.deliveryWorkbench.model.receipt.dianjiqiehuan')
                        .d('点击单号快速切换')}
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div className={styles['tree-list']}>
                <ul>
                  {data.map((i) => {
                    return (
                      <li
                        id={i[typeId]}
                        style={{
                          backgroundColor: instantlyId === i[typeId] ? 'rgb(0,184,204,0.08)' : '',
                          // borderRight: instantlyId === i[typeId] ? '1px solid #29BECE' : 'none',
                        }}
                        onClick={() => onChangeTree(i)}
                      >
                        <Tooltip title={showNames(i, _text)}>
                          <div>
                            <a
                              style={{
                                color: instantlyId === i[typeId] ? '#29bece' : '#000',
                              }}
                              className={styles['tree-up-list-a']}
                            >
                              {firstToUpper(i, receiptsCod)}
                            </a>
                          </div>
                          <div className={styles['tree-up-list-text']}>
                            <span className={styles['tree-list-cg']}>
                              {organizationId === tenantId
                                ? intl.get('slod.deliveryWorkbench.model.receipt.gong').d('供')
                                : intl.get('slod.deliveryWorkbench.model.receipt.cai').d('采')}
                            </span>
                            <span>{showNames(i)}</span>
                          </div>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CombineTabComponent;
