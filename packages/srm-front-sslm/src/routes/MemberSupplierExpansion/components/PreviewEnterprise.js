/*
 * PreviewEnterprise - 预览-供应商详情-企业信息
 * @Date: 2024-07-30 14:58:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext } from 'react';

import EnterpriseCardWrap from '@/routes/components/MemberSupplier/EnterpriseCardWrap';
import { Store } from '../stores';

const PreviewEnterprise = () => {
  const { tagList, dataSource, enterpriseStatus } = useContext(Store);

  const displayNameRender = () => {
    return (
      <span
        style={{
          fontSize: '20px',
          fontWeight: 600,
          lineHeight: 'inherit',
        }}
      >
        {dataSource.companyName}
      </span>
    );
  };

  return (
    <EnterpriseCardWrap
      imgWidth={64}
      imgHeight={64}
      tagList={tagList}
      imgSrc={dataSource.logoUrl}
      statusList={enterpriseStatus}
      key="previewEnterprise"
      sourceKey="previewEnterprise"
      displayNameRender={displayNameRender}
      labelObtainMethod={dataSource.labelObtainMethod}
    />
  );
};

export default PreviewEnterprise;
