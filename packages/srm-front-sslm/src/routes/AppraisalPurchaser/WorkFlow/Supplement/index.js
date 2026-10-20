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

import styles from '../../styles.less';
import { getSupplementList } from './utils';

const Index = ({
  wfParams,
  custLoading,
  customizeForm,
  pageCode,
  stageCode,
  templateCode,
  customizeTable,
  supplementBasicDs,
  templateVersion,
  queryTemplateConfig,
  supplementCombineTableDs,
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
    basicInfo: supplementBasicDs,
    scoreResult: supplementCombineTableDs,
  };
  const commonProps = {
    wfParams,
    custLoading,
    customizeForm,
    customizeTable,
    supplementBasicDs,
  };
  return (
    <TopSection className={styles['supplement-wrap']}>
      {supplementList.map(item => (
        <SecondSection key={item.key} title={item.title}>
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
