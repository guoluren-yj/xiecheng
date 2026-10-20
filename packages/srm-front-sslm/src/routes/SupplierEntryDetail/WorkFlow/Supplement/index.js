/*
 * 信息补录
 * @Date: 2024-02-05 15:43:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TopSection, SecondSection } from '_components/Section';

import { getSupplementList } from '../utils';
import styles from '../index.less';

const Index = ({
  wfParams,
  custLoading,
  customizeForm,
  pageCode,
  stageCode,
  templateCode,
  templateVersion,
  queryTemplateConfig,
  supplementInvitDs,
  supplementOtherDs,
  purchaseSelectedRows,
}) => {
  const supplementList = getSupplementList();

  useEffect(() => {
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  const dataSetObj = {
    invitInfo: supplementInvitDs,
    otherInfo: supplementOtherDs,
  };
  const commonProps = {
    wfParams,
    custLoading,
    customizeForm,
    purchaseSelectedRows,
  };
  return (
    <TopSection className={styles['supplier-entry-approval-supplement']}>
      {supplementList.map((item, index) => (
        <SecondSection
          key={item.key}
          title={item.title}
          titleProps={{ style: { marginTop: index === 0 ? 0 : 32 } }}
        >
          <item.component
            {...commonProps}
            {...item.componentProps}
            dataSet={dataSetObj[item.key]}
          />
        </SecondSection>
      ))}
    </TopSection>
  );
};

export default withCustomize({ isTemplate: true })(Index);
