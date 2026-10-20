/* 供应商主数据信息
 * @Date: 2023-08-16 11:49:01
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head, isEmpty } from 'lodash';
import React, { useContext } from 'react';

import { Context } from '../Context';
import SupplierEnterpriseInfo from './SupplierEnterpriseInfo';
import InvestigaInfo from './InvestigaInfo';

const SupplierMasterDataInfo = () => {
  const context = useContext(Context);

  const {
    purchaserCompanyInfo: { tenantId } = {},
    enterpriseBasicInfo = {},
    tableMaxHeight,
    configList,
  } = context;

  const { basic: { supplierBasicId } = {} } = enterpriseBasicInfo;

  const investigaProps = {
    tenantId,
    configList,
    tableMaxHeight,
    supplierBasicId,
    firstActiveKey: (head(configList) || {}).configName,
  };

  return (
    <div>
      <SupplierEnterpriseInfo />
      {!isEmpty(configList) && <InvestigaInfo {...investigaProps} />}
    </div>
  );
};

export default SupplierMasterDataInfo;
