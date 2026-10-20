/*
 * @Date: 2023-08-16 11:49:01
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Spin } from 'choerodon-ui/pro';
import { compose, isEmpty, camelCase, map } from 'lodash';
import React, { Fragment, useEffect, useState } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { useSetState } from '@/routes/components/utils';
import {
  fetchDefaultSupplierCompany,
  fetchPartnerCompanyInfo,
  fetchEnterpriseInfo,
} from '@/services/supplierMasterDataService';
import { fetchQuestionnaireTmpl } from '@/services/supplierDetailService';

import NoPermission from './components/NoPermission';
import { Context } from './Context';
import HeaderBtns from './HeaderBtns';
import EnterpriseHeader from './EnterpriseHeader'; // 主数据头信息
import SupplierMasterDataDetail from './MasterDataDetail'; // 供应商主数据信息

import styles from './styles.less';

const tableMaxHeight = 430;
// 查询接口所需的个性化单元
// const customizeUnitCode = [];

const Index = ({ remote, customizeForm, customizeTable, customizeTabPane }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useSetState({
    enterpriseBasicInfo: {}, // 企业信息
    configList: [], // 调查表配置
    supplierCompanyInfo: {},
    purchaserCompanyInfo: {},
    platformCoincideConfigList: [], // 平台重合调查表页签
  });

  const { supplierCompanyInfo = {}, purchaserCompanyInfo = {} } = state;

  useEffect(() => {
    handleQuery();
  }, []);

  // 初始查询
  const handleQuery = async () => {
    try {
      setLoading(true);
      // 第一次进入页面，查询当前用户子账户权限中与当前租户有合作伙伴的供应商公司信息
      const supplierResp = await fetchDefaultSupplierCompany();
      if (getResponse(supplierResp)) {
        await fetchInitInfo(supplierResp);
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化查询
  const fetchInitInfo = async (supplierCompany = {}) => {
    const { supplierCompanyId, supplierTenantId } = supplierCompany;
    // 查询和当前供应商有合作伙伴的采购方公司信息
    const purchaserInfo = await fetchPurchaserCompanyInfo(supplierCompanyId);
    const { companyId, tenantId } = purchaserInfo || {};
    // 查询主数据信息
    const masterData = await handleQueryEnterpriseInfoBasicInfo({
      companyId,
      tenantId,
      supplierCompanyId,
      supplierTenantId,
    });
    const { enterpriseBasicInfo = {}, investigationConfig = {} } = masterData || {};
    const { investigationConfigList = [], platformCoincideConfigList = [] } =
      investigationConfig || {};
    const result = {
      supplierCompanyInfo: supplierCompany,
      purchaserCompanyInfo: purchaserInfo,
      enterpriseBasicInfo,
      configList: investigationConfigList,
      platformCoincideConfigList,
    };
    setState(result);
  };

  // 查询企业主数据信息
  const handleQueryEnterpriseInfoBasicInfo = async (params = {}) => {
    const { companyId, tenantId, supplierCompanyId, supplierTenantId } = params;
    let enterpriseBasicInfo = {};
    let investigationConfig = {};
    if (!companyId || !supplierCompanyId || !tenantId || !supplierTenantId) {
      return { enterpriseBasicInfo, investigationConfig };
    }
    // 查询企业信息
    const enterpriseInfo = await fetchEnterpriseInfo({ supplierCompanyId, companyId });
    if (getResponse(enterpriseInfo)) {
      enterpriseBasicInfo = enterpriseInfo;
      const { basic = {} } = enterpriseInfo;
      // 查询调查表模版
      const templateParmas = remote.process('SSLM_SUPPLIER_MASTER_DATA_TEMPLATE_PARMAS', {
        tenantId,
        companyId,
        partnerTenantId: supplierTenantId,
        supplierBasicId: (basic || {}).supplierBasicId,
        partnerCompanyId: supplierCompanyId,
      });
      const templateResult = await fetchQuestionnaireTmpl(templateParmas);
      if (getResponse(templateResult)) {
        investigationConfig = handleConfig(templateResult);
      }
    }
    return { enterpriseBasicInfo, investigationConfig };
  };

  // 查询和当前供应商有合作伙伴的采购方公司信息
  const fetchPurchaserCompanyInfo = async (supplierCompanyId) => {
    let purchaserInfo = {};
    if (!supplierCompanyId) {
      return purchaserInfo;
    }
    const purchaserResp = await fetchPartnerCompanyInfo({ supplierCompanyId });
    if (getResponse(purchaserResp)) {
      const { content = [] } = purchaserResp;
      if (!isEmpty(content)) {
        // eslint-disable-next-line prefer-destructuring
        purchaserInfo = content[0];
      }
    }
    return purchaserInfo;
  };

  // 处理调查表配置
  const handleConfig = (investigationConfig) => {
    const investigationTempt = map(investigationConfig, (config) => {
      const { configName, investigateConfigLines, ...others } = config;
      // 处理成调查表组件所需的格式
      return {
        ...others,
        configName: camelCase(configName),
        lines: map(investigateConfigLines, (line) => {
          const { fieldCode, investigateConfigComponents, ...rest } = line;
          return {
            ...rest,
            fieldCode: camelCase(fieldCode),
            props: investigateConfigComponents,
          };
        }),
      };
    });
    const investigationConfigList = investigationTempt.filter(
      (n) =>
        ![
          'sslmInvestgContact',
          'sslmInvestgAddress',
          'sslmInvestgBankAccount',
          'sslmInvestgAttachment',
          'sslmInvestgFin',
        ].includes(n.configName)
    );
    const platformCoincideConfigList = investigationTempt.filter((n) =>
      [
        'sslmInvestgContact',
        'sslmInvestgAddress',
        'sslmInvestgBankAccount',
        'sslmInvestgAttachment',
        'sslmInvestgFin',
      ].includes(n.configName)
    );
    return { investigationConfigList, platformCoincideConfigList };
  };

  // 处理采购方公司切换
  const handlePurchaserCompanyChange = async (companyInfo = {}) => {
    try {
      setLoading(true);
      const { companyId, tenantId } = companyInfo;
      const { supplierCompanyId, supplierTenantId } = supplierCompanyInfo;
      // 查询主数据信息
      const masterData = await handleQueryEnterpriseInfoBasicInfo({
        companyId,
        tenantId,
        supplierCompanyId,
        supplierTenantId,
      });
      const { enterpriseBasicInfo = {}, investigationConfig = {} } = masterData || {};
      const { investigationConfigList = [], platformCoincideConfigList = [] } =
        investigationConfig || {};
      const result = {
        purchaserCompanyInfo: { ...companyInfo },
        enterpriseBasicInfo,
        configList: investigationConfigList,
        platformCoincideConfigList,
      };
      setState(result);
    } finally {
      setLoading(false);
    }
  };

  // 处理供应商公司切换
  const handleSupplierCompanyChange = async (supplierCompany = {}) => {
    try {
      setLoading(true);
      await fetchInitInfo(supplierCompany);
    } finally {
      setLoading(false);
    }
  };

  const commonProps = {
    ...state,
    customizeForm,
    customizeTable,
    tableMaxHeight,
    customizeTabPane,
  };

  const headerBtnProps = {
    ...state,
    handleSupplierCompanyChange,
  };

  const noPermissionFlag =
    !loading && (isEmpty(supplierCompanyInfo) || isEmpty(purchaserCompanyInfo));

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.supplierMasterData.view.title.partnerInfo').d('合作伙伴及企业信息')}
      >
        <HeaderBtns {...headerBtnProps} />
      </Header>
      <Content wrapperClassName={styles['supplier-master-data-wrap']}>
        <Context.Provider value={commonProps}>
          <Spin spinning={loading}>
            {noPermissionFlag ? (
              <NoPermission />
            ) : (
              <Fragment>
                <EnterpriseHeader handlePurchaserCompanyChange={handlePurchaserCompanyChange} />
                <SupplierMasterDataDetail />
              </Fragment>
            )}
          </Spin>
        </Context.Provider>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.supplierMasterData',
      'sslm.common',
      'sslm.supplierDetail',
      'sslm.enterpriseInform',
      'spfm.contactPerson',
      'spfm.importErp',
      'sslm.supplierInform',
      'sslm.supplyAbility',
      'sslm.commonApplication',
      'spfm.supplier',
      'spfm.common',
      'spfm.bank',
    ],
  }),
  withCustomize({
    unitCode: [
      'SUPPLIER_MASTER_DATA.ENTERPRISE_TABS', // 企业基础信息标签页
      'SUPPLIER_MASTER_DATA.ENTERPRISE_OTHERS', // 其他信息
    ],
  }),
  remotes({
    code: 'SSLM_SUPPLIER_MASTER_DATA',
    name: 'remote',
  })
)(Index);
