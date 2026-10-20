/*
 * @Descripttion: 比价单
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-02 17:44:51
 */

import React, { useState } from 'react';
import intl from 'utils/intl';
import PriceListModal from '@/routes/components/PriceListModal';

const PriceList = function PriceList({ record }) {
  const [priceListModalVisible, setPriceListModalVisible] = useState(false);

  const [priceData, setPriceData] = useState([]);

  const openModal = () => {
    const data =
      record && record?.get('productCompareJson')
        ? JSON.parse(record && record?.get('productCompareJson'))
        : [];

    setPriceData(data);

    setPriceListModalVisible(true);
  };

  return (
    <>
      <a onClick={() => openModal()}>
        {intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单')}
      </a>
      {priceListModalVisible && (
        <PriceListModal
          visible={priceListModalVisible}
          onClose={() => {
            setPriceListModalVisible(false);
          }}
          data={priceData}
        />
      )}
    </>
  );
};

export default PriceList;
