import { Button, Modal } from 'choerodon-ui/pro';
import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import ProductModal from './ProductModal';
import { addressDetailService } from './api';

function AddOtherProduct({ buttonProps, addressInfo, ...others }) {
  const [address, setAddress] = useState({});
  useEffect(() => {
    const { addressId, regionCodeList } = addressInfo || {};
    if (isEmpty(regionCodeList) && addressId) {
      const params = { addressIds: [addressId] };
      addressDetailService(params).then((res) => {
        if (res) {
          setAddress(res[0]);
        }
      });
    }
  }, [addressInfo]);

  function handleOpenModal() {
    Modal.open({
      title: intl.get('smpc.product.button.addOtherProduct').d('添加其他商品'),
      drawer: true,
      maskClosable: false,
      style: { width: 1090 },
      children: <ProductModal {...others} addressInfo={{ ...address, ...addressInfo }} />,
      okText: intl.get('smpc.product.button.addComparePrice').d('加入比价'),
    });
  }

  return (
    <Button funcType="flat" icon="add" {...buttonProps} onClick={() => handleOpenModal()}>
      {intl.get('smpc.product.button.addOtherProduct').d('添加其他商品')}
    </Button>
  );
}

export default formatterCollections({ code: ['smpc.product', 'sagm.common'] })(AddOtherProduct);
