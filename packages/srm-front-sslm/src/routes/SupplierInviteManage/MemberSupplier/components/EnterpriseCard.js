/*
 * @Date: 2024-08-09 16:01:21
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { useDataSet } from 'choerodon-ui/pro';

import MoreButton from '@/routes/components/MoreButton';
import EnterpriseCardWrap from '@/routes/components/MemberSupplier/EnterpriseCardWrap';
import { getEnterpriseFormDS } from '../../stores/memberSupplierDS';

import { viewSupplierDetail } from '../utils';

const Card = observer(({ record, getButtons }) => {
  const lineData = record?.toData() || {};
  const enterpriseFormDs = useDataSet(() => getEnterpriseFormDS(), []);
  enterpriseFormDs.loadData([lineData]);
  const {
    logoUrl,
    companyId,
    companyName,
    labelObtainMethod = '',
    enterpriseLabel = '',
    zhimaLabels = [],
  } = lineData;

  const tagList = useMemo(
    () =>
      labelObtainMethod === 'ZHIMA_LABEL'
        ? zhimaLabels
        : enterpriseLabel
            ?.split(',')
            .filter(Boolean)
            .map(n => ({ labelName: n })),
    [enterpriseLabel, labelObtainMethod, JSON.stringify(zhimaLabels)]
  );

  // 企业状态
  const enterpriseStatus = useMemo(
    () =>
      [
        {
          value: lineData.operateStatus,
          meaning: lineData.operateStatusMeaning,
        },
        {
          value: lineData.riskLevel,
          meaning: lineData.riskLevelMeaning,
        },
      ].filter(n => n.value),
    [JSON.stringify(lineData)]
  );

  const displayNameRender = () => {
    return (
      <span className="member-supplier-name" onClick={() => viewSupplierDetail(record)}>
        {companyName}
      </span>
    );
  };

  const formFields = [
    {
      name: 'legalRepName',
    },
    {
      name: 'registeredCapital',
    },
    {
      name: 'currencyName',
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
    {
      name: 'riskScanDate',
    },
  ];

  return (
    <EnterpriseCardWrap
      tagList={tagList}
      imgSrc={logoUrl}
      key={companyId}
      sourceKey={companyId}
      formFields={formFields}
      dataSet={enterpriseFormDs}
      statusList={enterpriseStatus}
      displayNameRender={displayNameRender}
      labelObtainMethod={labelObtainMethod}
      extraRender={() => <MoreButton buttons={getButtons(record)} />}
    />
  );
});

export default Card;
