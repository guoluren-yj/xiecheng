/*
 * @Date: 2024-08-14 16:19:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { downLoadUuidFile } from '@/routes/components/utils/file';
import PreviewProduct from '@/routes/MemberSupplierExpansion/components/PreviewProduct';
import { Context } from '../Context';

const Index = () => {
  const { loading, setLoading, memberMainProductList } = useContext(Context);
  const operateRender = record => {
    const uuid = record?.get('authAttachmentUuid');
    return (
      <Button
        funcType="link"
        loading={loading}
        onClick={() => downLoadUuidFile({ uuid, setLoading })}
      >
        {intl.get('sslm.common.model.common.aptitudeDocDownload').d('资质文件下载')}
      </Button>
    );
  };

  return (
    <div className="supplier-detail-content" id="productIntroduce">
      <div style={{ padding: '16px 20px 20px' }}>
        <PreviewProduct
          listType="GRID"
          productData={memberMainProductList}
          operateRender={operateRender}
        />
      </div>
    </div>
  );
};

export default Index;
