/*
 * @Date: 2024-08-09 16:01:21
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { useDataSet } from 'choerodon-ui/pro';

import MoreButton from '@/routes/components/MoreButton';
import ProductCardWrap from '@/routes/components/MemberSupplier/ProductCardWrap';

import { viewSupplierDetail } from '../utils';
import { getProductFormDS } from '../../stores/memberSupplierDS';

const Card = ({ record, getButtons }) => {
  const lineData = record?.toData() || {};
  const productFormDs = useDataSet(() => getProductFormDS(), []);
  productFormDs.loadData([lineData]);

  const formFields = [
    {
      name: 'productIntro',
    },
    {
      name: 'companyName',
      renderer: ({ value }) => {
        return <a onClick={() => viewSupplierDetail(record)}>{value}</a>;
      },
    },
    {
      name: 'buildDate',
    },
    {
      name: 'industryNames',
    },
    {
      name: 'industryCategoryNames',
    },
  ];

  return (
    <ProductCardWrap
      key="id"
      formFields={formFields}
      dataSet={productFormDs}
      extraRender={() => <MoreButton buttons={getButtons(record)} />}
    />
  );
};

export default Card;
