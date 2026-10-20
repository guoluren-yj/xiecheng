import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { Record } from 'choerodon-ui/dataset';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import intl from 'utils/intl';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { fetchEnterpriceRiskControlConfig } from '@/services/commonService';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import { supplierRelationMapNew } from '@/services/inquiryHallService';
import { isText, getSupplierRelationUrl } from '@/utils/utils';

export default formatterCollections({
  code: ['ssrc.common'],
})(function SupplierRelatedGraph(props) {
  const { supplierDataList, sourceProjectId, projectNum, ...buttonProps } = props;
  const [enterPriceRiskConfig, setEnterPriceRiskConfig] = useState({});

  useEffect(() => {
    fetchEnterPriceRiskConfig();
  }, []);
  /** 查询企业是否开通 [ 风险扫描，关系图谱，找关系, ..., ]等服务
   *  RELATION_MINING：关系图谱（关系挖掘）
   *  RISK_SCAN：风险扫描
   *  QCC_FIND_RELATION_VARIOUS_V1
   */
  const fetchEnterPriceRiskConfig = async () => {
    let result = null;

    const params = {
      organizationId: getCurrentOrganizationId(),
      applicationCode: 'AP_CREDIT',
      serviceCode: 'RELATION_MINING',
      // serviceCode: 'RELATION_MINING,RISK_SCAN,QCC_FIND_RELATION_VARIOUS_V1', // 找关系，关系图谱（关系挖掘），风险扫描,
    };

    try {
      result = await fetchEnterpriceRiskControlConfig(params);
      result = getResponse(result || isEmpty(result));
      if (!result) {
        return;
      }
      setEnterPriceRiskConfig(result);
    } catch (e) {
      throw e;
    }
  };

  // 展示供应商图谱
  const handleSupplierRelationMap = () => {
    const supplierList = [];

    if (!supplierDataList || !projectNum) return;

    // 校验头id
    idValidation(sourceProjectId);

    supplierDataList.forEach((record = {}) => {
      const { supplierCompanyName, supplierCompanyId, supplierId, supplierCompanyNum } =
        record instanceof Record
          ? record.get([
              'supplierCompanyName',
              'supplierCompanyId',
              'supplierId',
              'supplierCompanyNum',
            ]) || {}
          : record || {};
      if (!supplierId && !supplierCompanyId) {
        return;
      }
      supplierList.push({
        supplierCompanyNum,
        supplierCompanyName,
        supplierCompanyId,
        supplierId,
        sourceProjectId,
        projectNum,
      });
    });

    supplierRelationMapNew({
      organizationId: getCurrentOrganizationId(),
      data: {
        sourceProjectId,
        projectLineSupplierList: supplierList,
        businessType: 'SOURCE_PROJECT',
        projectNum,
      },
    }).then((res) => {
      if (isText(res)) {
        const url = getSupplierRelationUrl(res);
        window.open(url);
      }
    });
  };

  return enterPriceRiskConfig.RELATION_MINING ? (
    <TooltipButtonPro
      onClick={handleSupplierRelationMap}
      icon="supervisor_account-o"
      {...(buttonProps || {})}
    >
      {intl.get(`ssrc.common.button.RelationMap`).d('供应商关系图谱')}
    </TooltipButtonPro>
  ) : null;
});
