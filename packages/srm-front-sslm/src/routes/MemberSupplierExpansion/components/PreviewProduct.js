/*
 * PreviewProduct - 主要产品预览
 * @Date: 2024-08-23 15:21:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import classnames from 'classnames';
import { forEach, isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import { NoDataRender } from '@/routes/components/utils/render';
import ProductCardWrap from '@/routes/components/MemberSupplier/ProductCardWrap';
import { productIntroduceFormDS } from '../stores/getProductIntroduceDS';
import styles from '../styles.less';

const PreviewProduct = ({ listType, productData = [], ...rest }) => {
  const [dsList, setDsList] = useState({});

  const formFields = [
    {
      name: 'productIntro',
    },
    {
      name: 'companyName',
      hiddren: listType !== 'LIST',
    },
    {
      name: 'buildDate',
      hiddren: listType !== 'LIST',
    },
    {
      name: 'industryNames',
      hiddren: listType !== 'LIST',
    },
    {
      name: 'industryCategoryNames',
      hiddren: listType !== 'LIST',
    },
  ].filter(field => !field.hiddren);

  useEffect(() => {
    const newList = {};
    forEach(productData, data => {
      newList[data.memberMainProductId] = new DataSet(productIntroduceFormDS());
      newList[data.memberMainProductId].loadData([data]);
    });
    setDsList(newList);
  }, [JSON.stringify(productData)]);

  return !isEmpty(productData) ? (
    <div className={classnames({ [styles['preview-product-wrap']]: listType !== 'LIST' })}>
      {!isEmpty(dsList)
        ? productData.map(data => (
          <div
            key={data.memberMainProductId}
            className={classnames(styles['preview-product'], {
                'preview-product-grid': listType !== 'LIST',
              })}
          >
            <ProductCardWrap
              key={data.memberMainProductId}
              dataSet={dsList[data.memberMainProductId]}
              formFields={formFields}
              {...rest}
            />
          </div>
          ))
        : null}
    </div>
  ) : (
    <NoDataRender />
  );
};

export default PreviewProduct;
