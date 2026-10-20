/*
 * @Date: 2024-08-13 17:07:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useState, useEffect, useMemo } from 'react';
import { Spin } from 'choerodon-ui';
import { RichText } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { TopSection, SecondSection } from '_components/Section';

import Register from '@/routes/components/MemberSupplier/Register';
import Business from '@/routes/components/MemberSupplier/Business';
import Contact from '@/routes/components/MemberSupplier/Contact';
import { NoDataRender } from '@/routes/components/utils/render';
import EnterpriseCardWrap from '@/routes/components/MemberSupplier/EnterpriseCardWrap';
import PreviewProduct from '@/routes/MemberSupplierExpansion/components/PreviewProduct';
import {
  fetchCompanyInfo,
  fetchMemberSupplierDetail,
} from '@/services/supplierInviteManageServices';

const SupplierDetail = ({ record }) => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState({});
  const [companyData, setCompanyData] = useState({});

  const {
    logoUrl,
    companyName,
    labelObtainMethod,
    zhimaLabels,
    enterpriseLabel,
    operateStatus,
    operateStatusMeaning,
    riskLevel,
    riskLevelMeaning,
    memberContactList,
    memberMainProductList,
    memberCustomizeList,
  } = dataSource || {};
  const { companyId, memberInfoId } = record?.get(['companyId', 'memberInfoId']) || {};

  // 企业标签
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
          value: operateStatus,
          meaning: operateStatusMeaning,
        },
        {
          value: riskLevel,
          meaning: riskLevelMeaning,
        },
      ].filter(n => n.value),
    [operateStatus, operateStatusMeaning, riskLevel, riskLevelMeaning]
  );

  useEffect(() => {
    handleQuery();
  }, [memberInfoId]);

  const handleQuery = () => {
    setLoading(true);
    fetchMemberSupplierDetail({ memberInfoId })
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          await fetchCompanyInfo({ companyId }).then(comResponse => {
            const comRes = getResponse(comResponse);
            if (comRes) {
              setCompanyData(comRes);
            }
          });
          setDataSource(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const displayNameRender = () => {
    return <span style={{ fontSize: 16 }}>{companyName}</span>;
  };

  return (
    <Spin spinning={loading}>
      <TopSection className="member-supplier-detail">
        <SecondSection>
          <div style={{ marginBottom: 20 }}>
            <EnterpriseCardWrap
              tagList={tagList}
              key="supplier-detail"
              sourceKey="supplier-detail"
              imgSrc={logoUrl}
              statusList={enterpriseStatus}
              displayNameRender={displayNameRender}
              labelObtainMethod={labelObtainMethod}
            />
          </div>
        </SecondSection>
        <SecondSection title={intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息')}>
          <Register registerData={companyData.basic} />
        </SecondSection>
        <SecondSection title={intl.get('sslm.common.view.field.businessInfo').d('业务信息')}>
          <Business businessData={companyData.business} />
        </SecondSection>
        <SecondSection title={intl.get('sslm.common.view.title.contactInfo').d('联系人信息')}>
          <Contact isEdit={false} contactData={memberContactList} />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.common.view.field.productIntroduce').d('主要产品介绍')}
        >
          {/* div不可拿掉，会影响样式 */}
          <div>
            <PreviewProduct listType="GRID" productData={memberMainProductList} />
          </div>
        </SecondSection>
        {!isEmpty(memberCustomizeList) &&
          memberCustomizeList.map(customizeData => (
            <SecondSection
              key={customizeData.memberCustomizeId}
              title={customizeData.customizeTitle}
            >
              {customizeData.customizeContent ? (
                <RichText
                  mode="preview"
                  style={{ height: 200 }}
                  value={JSON.parse(customizeData.customizeContent)}
                />
              ) : (
                <NoDataRender />
              )}
            </SecondSection>
          ))}
      </TopSection>
    </Spin>
  );
};

export default SupplierDetail;
