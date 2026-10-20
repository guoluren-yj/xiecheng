/*
 * @Date: 2024-08-02 09:07:36
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useMemo } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';

import { PRIVATE_BUCKET } from '_utils/config';
import { Store } from '../stores';

const ProductIntroduce = () => {
  const { isEdit, productIntroduceDs } = useContext(Store);

  const buttons = useMemo(() => (isEdit ? ['add', 'delete'] : []), [isEdit]);

  const columns = useMemo(
    () =>
      [
        {
          name: 'productName',
        },
        {
          name: 'productPictureUuid',
          editor: isEdit && (
            <Attachment
              max={1}
              funcType="link"
              viewMode="popup"
              name="productPictureUuid"
              bucketName={PRIVATE_BUCKET}
              accept={['image/jpeg', 'image/jpg', 'image/png', 'image/bmp']}
            />
          ),
        },
        {
          name: 'price',
        },
        {
          name: 'productIntro',
        },
        {
          name: 'authAttachmentUuid',
        },
        {
          name: 'displayPage',
        },
      ].map(n => ({ editor: isEdit, ...n })),
    [isEdit]
  );

  return (
    <Table
      columns={columns}
      buttons={buttons}
      dataSet={productIntroduceDs}
      style={{ maxHeight: 600 }}
      selectionMode={isEdit ? 'rowbox' : 'none'}
      customizedCode="sslm.member-supplier.product-introduce"
    />
  );
};

export default ProductIntroduce;
