/*
 * EnterpriseHeader 头信息
 * @Date: 2023-08-21 16:44:28
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { useDataSet, Form, Output, Lov } from 'choerodon-ui/pro';
import React, { useContext, useEffect } from 'react';

import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getAttachmentUrl, getCurrentLanguage } from 'utils/utils';

import defaultLogo from '@/assets/360Query/logo.svg';
import { Context } from '@/routes/SupplierMasterData/Context';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { getHeaderDS, getPurchaserCompanyDS } from './stores/getHeaderDS';

const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

const EnterpriseHeader = ({ handlePurchaserCompanyChange = () => {} }) => {
  const context = useContext(Context);
  const sourceKey = 'SUPPLIER_MASTER';

  const { supplierCompanyInfo = {}, purchaserCompanyInfo = {}, enterpriseBasicInfo = {} } = context;
  const { basic: oldbasic = {}, business = {} } = enterpriseBasicInfo;
  const basic = oldbasic || {};
  const { supplierCompanyId } = supplierCompanyInfo;
  const { companyId, companyName } = purchaserCompanyInfo;

  const companyDs = useDataSet(() => getHeaderDS({}), []);
  const purchaserCompanyDs = useDataSet(() => getPurchaserCompanyDS({ supplierCompanyId }), [
    supplierCompanyId,
  ]);

  useEffect(() => {
    init();
  }, [supplierCompanyId, companyId]);

  const init = () => {
    // 供应商公司头信息
    companyDs.loadData([basic]);
    // 初始化默认带出一个采购方公司信息
    const purchaserInfo = {
      companyId: {
        companyId,
        companyName,
      },
    };
    purchaserCompanyDs.loadData([purchaserInfo]);
  };

  const handleCompanyChange = value => {
    handlePurchaserCompanyChange(value);
  };

  const url = business && business.logoUrl;
  const newUrl = getAttachmentUrl(url, PRIVATE_BUCKET, getCurrentOrganizationId());

  return (
    <div className="company-container">
      <div className="company-head">
        <div className="company-head-left">
          <img className="logo-img" src={url ? newUrl : defaultLogo} alt="logo" />
        </div>
        <div className="company-head-right">
          <div className="company-title">
            {basic && basic.companyName}
            {isChinese && (
              <div style={{ marginTop: 8 }}>
                <EnterpriseTags
                  key={sourceKey}
                  tagList={basic.zhimaLabels}
                  parentId="sslmSupplierMasterData"
                  tagClassName="sslm-supplier-master-data"
                />
              </div>
            )}
          </div>
          <Form
            columns={3}
            useWidthPercent
            dataSet={companyDs}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="companyNum" />
            <Output name="creationDate" />
          </Form>
        </div>
      </div>
      <div className="company-footer">
        <Form
          columns={2}
          dataSet={purchaserCompanyDs}
          labelLayout="float"
          style={{ marginTop: 24, marginBottom: 20 }}
        >
          <Lov
            name="companyId"
            style={{ width: 280 }}
            clearButton={false}
            searchable={false}
            onChange={handleCompanyChange}
            colSpan={2}
          />
        </Form>
      </div>
    </div>
  );
};

export default EnterpriseHeader;
