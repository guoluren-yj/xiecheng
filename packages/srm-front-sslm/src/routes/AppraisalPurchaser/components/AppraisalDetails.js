/*
 * @Date: 2023-12-18 16:05:48
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { TopSection, SecondSection } from '_components/Section';
import { getDetailsList } from '../Detail/utils';
import styles from '../styles.less';

const AppraisalDetails = ({
  basicDs,
  sourceKey,
  custLoading,
  wfParams = {},
  readOnlyFlag,
  workflowFlag,
  evalHeaderId,
  customizeTable,
  evalGranularity,
  participSupplierDs,
  appraisalIndicatorDs,
  appraisalPersonDs,
}) => {
  const panelList = getDetailsList({ workflowFlag });
  const componentProps = {
    basicDs,
    sourceKey,
    wfParams,
    custLoading,
    readOnlyFlag,
    isEdit: false,
    evalHeaderId,
    customizeTable,
    evalGranularity,
  };

  const dataSetObj = {
    participSupplier: participSupplierDs,
    appraisalIndicator: appraisalIndicatorDs,
    appraisalPerson: appraisalPersonDs,
  };
  return (
    <TopSection className={styles['no-top-section']}>
      {panelList.map(item => (
        <SecondSection key={item.key} title={item.header}>
          <div className={styles['section-wrap']}>
            <item.component
              {...item.componentProps}
              {...componentProps}
              dataSet={dataSetObj[item.key]}
            />
          </div>
        </SecondSection>
      ))}
    </TopSection>
  );
};

export default AppraisalDetails;
