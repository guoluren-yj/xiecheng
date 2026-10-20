/*
 * @Date: 2025-08-27 14:59:13
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import classnames from 'classnames';
import React, { useEffect } from 'react';

import { Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import styles from '../../../index.less';
import CategoryMaterial from './CategoryMaterial';
import AttachmentInfo from '../../../components/AttachmentInfo';

const Index = ({
  stageCode,
  pageCode,
  headerInfo,
  custLoading,
  templateCode,
  customizeTable,
  templateVersion,
  supplementBasicDs,
  queryTemplateConfig,
  supplementCategoryMaterialDs,
}) => {
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

  return (
    <Content
      wrapperClassName={classnames(
        styles['supply-ability-doc-detail-content'],
        styles['supplement-wrap']
      )}
    >
      <div className="card-content-wrap ">
        <CategoryMaterial
          headerInfo={headerInfo}
          custLoading={custLoading}
          customizeTable={customizeTable}
          dataSet={supplementCategoryMaterialDs}
          customizeUnitCode="SUPPLY_ABILITY_DOC.PURCHASER_CUSTOM_SUPPLEMENT.CATEGORYS_LIST"
        />
        <AttachmentInfo isEdit dataSet={supplementBasicDs} />
      </div>
    </Content>
  );
};

export default withCustomize({ isTemplate: true })(Index);
