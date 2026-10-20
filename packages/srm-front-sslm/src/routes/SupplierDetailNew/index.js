/*
 * @Date: 2023-08-16 11:49:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { Spin } from 'choerodon-ui/pro';
import { compose, isEmpty, camelCase, map, head } from 'lodash';
import React, { Fragment, useMemo, useEffect, useState, createRef } from 'react';

import intl from 'utils/intl';
import { queryUnifyIdpValue } from 'services/api';
import { Header, Content } from 'components/Page';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { TopSection, SecondSection } from '_components/Section';

import { useSetState } from '@/routes/components/utils';
import { checkMemberSupplierEnabled, enterpriseTagsConfig } from '@/services/commonService';
import { fetchCompanyInfo, fetchQuestionnaireTmpl } from '@/services/supplierDetailService';

import styles from './styles.less';
import { Context } from './Context';
import HeaderBtns from './HeaderBtns';
import CompanyInfo from './CompanyInfo'; // 公司信息
import SupplierLifeCycle from './SupplierLifeCycle'; // 供应商生命周期
import EnterpriseBasicInfo from './EnterpriseBasicInfo'; // 企业基础信息
import SupplementaryInfo from './SupplementaryInfo'; // 补充信息
import RiskProfile from './RiskProfile'; // 风险档案
import MainProducts from './MainProducts'; // 主要产品介绍
import { getPositionList, renderPositionLink } from './utils';

const enterpriseRef = createRef(null); // 企业基础信息ref
const supplementRef = createRef(null); // 补充信息ref
const tableMaxHeight = 430;
// suppliers查询接口所需的个性化单元
const customizeUnitCode = [
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_DOMESTIC',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_OVERSEAS',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_PERSONAL',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.BUSINESS',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.INVOICE',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.FINANCE',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.ATTACHMENT',
  'SSLM.SUPPLIER_360_PAGE_COLLECT.SUPPLIER_BASIC',
  'SSLM.SUPPLIER_360_PAGE_COLLECT.PURCHASE_COMPANY',
];

const Index = ({
  location,
  dispatch,
  custConfig,
  customizeForm,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  supplierDetailNewRemote,
  history,
  getHocInstance,
}) => {
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [defaultCompany, setDefaultCompany] = useState({});
  const [memberEnabled, setMemberEnabled] = useState(false);
  // 调查表配置接口是否查询完标识，查询完后再渲染定位栏，优化界面体验
  const [investigQueryFlag, setInvestigQueryFlag] = useState(false);
  const [state, setState] = useSetState({
    basic: {}, // 登记信息
    configList: [], // 调查表配置
  });
  const [anchorRef, setAnchorRef] = useState(null);
  const [showTagFlag, setShowTagFlag] = useState(true);

  // 【企业基础信息】模型表配置
  const modelTableConfig = enterpriseRef.current?.modelTableConfig || [];
  const routerParam = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const {
    tenantId,
    supplierCompanyId,
    partnerTenantId,
    companyId: routerCompanyId, // 路径上的公司id
  } = routerParam;

  const { basic, configList } = state;

  useEffect(() => {
    // 仅当路径变化时调用
    handleCompanyName();
    return () => {
      // 当前组件卸载时,将companyId置为nul,从而达到所有查询只需依赖companyId即可
      // 解决当companyId相同时，不重新触发查询问题
      setCompanyId(null);
      // 卸载时将investigQueryFlag置为false,解决数据源变化时，定位轴数据未同步变化问题
      setInvestigQueryFlag(false);
    };
  }, [routerParam]);

  useEffect(() => {
    handleQuery();
  }, [companyId]);

  // 查询当前租户是否开启会员供应商拓展功能
  const handleMemberEnabled = () => {
    checkMemberSupplierEnabled().then(response => {
      const res = getResponse(response);
      if (res) {
        setMemberEnabled(res.featureEnabledFlag === 1);
      }
    });
  };

  // 查询当前功能是否开启企业标签功能
  const handleEnterpriseTags = () => {
    enterpriseTagsConfig({ menuNum: '4' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        setShowTagFlag(false);
      }
    });
  };

  useEffect(() => {
    handleMemberEnabled();
    handleEnterpriseTags();
  }, []);

  // 无论路径上是否有companyId,companyId都从值集中取
  const handleCompanyName = async () => {
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const result = await supplierDetailNewRemote.event.fireEvent('cuxHandleCompanyId', {
      setCompanyId,
      setDefaultCompany,
    });
    if (!result) {
      return;
    }
    const payload = filterNullValueObject({
      tenantId,
      companyId: routerCompanyId,
      partnerCompanyId: supplierCompanyId,
    });
    queryUnifyIdpValue('SSLM.NO_USER_AUTH.COMPANY', payload).then(response => {
      const res = getResponse(response);
      if (res) {
        const firstCompany = head(res) || {};
        setDefaultCompany(firstCompany);
        setCompanyId(firstCompany.companyId);
      }
    });
  };

  // 初始查询
  const handleQuery = () => {
    if (companyId && supplierCompanyId) {
      setLoading(true);
      fetchCompanyInfo({
        companyId,
        supplierCompanyId,
        customizeTenantId: tenantId,
        customizeUnitCode: customizeUnitCode.join(),
        isNewMenu: 1,
      })
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            const { basic: newBasic } = res;
            // 查询调查表数据
            await fetchQuestionnaireTmpl({
              tenantId,
              companyId,
              partnerTenantId,
              supplierBasicId: (newBasic || {}).supplierBasicId,
              partnerCompanyId: supplierCompanyId,
            })
              .then(investigationResponse => {
                const investigationConfig = getResponse(investigationResponse);
                if (investigationConfig) {
                  const config = handleConfig(investigationConfig);
                  setState({ configList: config });
                }
              })
              .finally(() => setInvestigQueryFlag(true));
            setState(res);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  // 处理调查表配置
  const handleConfig = investigationConfig => {
    return map(investigationConfig, config => {
      const { configName, investigateConfigLines, ...others } = config;
      // 处理成调查表组件所需的格式
      return {
        ...others,
        configName: camelCase(configName),
        lines: map(investigateConfigLines, line => {
          const { fieldCode, investigateConfigComponents, ...rest } = line;
          return {
            ...rest,
            fieldCode: camelCase(fieldCode),
            props: investigateConfigComponents,
          };
        }),
      };
    }).filter(
      n =>
        ![
          'sslmInvestgContact',
          'sslmInvestgAddress',
          'sslmInvestgBankAccount',
          'sslmInvestgAttachment',
          'sslmInvestgFin',
          'sslmInvestgSupplierCate',
        ].includes(n.configName)
    );
  };

  // 定位条点击回调
  const handleAnchorClick = (e, link) => {
    const key = link.href.substr(1);
    const { enterpriseList } = getPositionList({ custConfig, configList, modelTableConfig });
    // 企业基础信息key
    const enterpriseKeys = enterpriseList.map(field => field.href);
    // 补充信息key
    const investigKeys = map(configList, config => config.configName);

    if (enterpriseRef.current && enterpriseKeys.includes(key)) {
      enterpriseRef.current.onTabsChange(key);
    } else if (supplementRef.current && investigKeys.includes(key)) {
      supplementRef.current.onTabsChange(key);
    }
  };

  const detailProps = {
    ...state,
    ...routerParam,
    loading,
    setLoading,
    routerParam,
    dispatch,
    companyId,
    setCompanyId,
    defaultCompany,
    customizeForm,
    customizeTable,
    tableMaxHeight,
    customizeTabPane,
    supplierDetailNewRemote,
  };

  // 定位轴props
  const positionProps = {
    custConfig,
    configList,
    modelTableConfig,
    onAnchorClick: handleAnchorClick,
    setAnchorRef,
  };

  return (
    <Fragment>
      <Header title={intl.get('sslm.supplierDetail.view.message.title.main').d('供应商360度查询')}>
        <HeaderBtns
          loading={loading}
          companyId={companyId}
          setLoading={setLoading}
          partnerId={basic.partnerId}
          customizeBtnGroup={customizeBtnGroup}
          supplierCompanyId={supplierCompanyId}
          basic={basic}
          supplierTenantId={basic.supplierTenantId}
        />
      </Header>
      <Content wrapperClassName={styles['supplier-detail-wrap']}>
        <Context.Provider value={detailProps}>
          <Spin spinning={loading} id="supplierDetailWrap">
            <TopSection
              code="SSLM.SUPPLIER_360_PAGE_COLLECT.CARDS"
              getHocInstance={getHocInstance}
              getPositionAnchor={() => {
                return anchorRef;
              }}
            >
              {supplierDetailNewRemote.process('SSLM_SUPPLIER_DETAIL_NEW_DETAIL_SECTION', null, {
                basic,
                companyId,
              })}
              {/* 公司信息 */}
              <SecondSection code="companyInfo">
                <CompanyInfo
                  customizeForm={customizeForm}
                  showTagFlag={showTagFlag}
                  remote={supplierDetailNewRemote}
                />
              </SecondSection>
              {/* 风险监控 */}
              <SecondSection code="riskProfile">
                <RiskProfile basic={basic} history={history} />
              </SecondSection>
              {/* 供应商生命周期历程 */}
              <SecondSection
                code="lifeCycle"
                title={intl.get('sslm.common.view.title.lifeCycleCourse').d('供应商生命周期历程')}
              >
                <SupplierLifeCycle />
              </SecondSection>
              {/* 主要产品介绍 */}
              {memberEnabled && (
                <SecondSection
                  code="mainProducts"
                  title={intl.get('sslm.common.view.field.productIntroduce').d('主要产品介绍')}
                >
                  <MainProducts />
                </SecondSection>
              )}
              {/* 企业基础信息 */}
              <SecondSection
                code="enterpriseBasicInfo"
                titleProps={{ style: { paddingBottom: 16, borderBottom: 'solid 1px #e5e7ec' } }}
                title={intl
                  .get('sslm.supplierDetail.view.title.enterpriseBasicInfo')
                  .d('企业基础信息')}
              >
                <EnterpriseBasicInfo ref={enterpriseRef} />
              </SecondSection>
              {/* 补充信息 */}
              {!isEmpty(configList) && (
                <SecondSection
                  code="supplementaryInfo"
                  titleProps={{ style: { paddingBottom: 16, borderBottom: 'solid 1px #e5e7ec' } }}
                  title={
                    <Fragment>
                      <div>
                        {intl.get('sslm.supplierDetail.view.title.supplementaryInfo').d('补充信息')}
                      </div>
                      <div className="second-section-title-help">
                        {intl
                          .get('sslm.supplierDetail.view.title.supplementaryInfoMsg')
                          .d('通过调查表补充收集的供应商主数据信息')}
                      </div>
                    </Fragment>
                  }
                >
                  <SupplementaryInfo
                    tenantId={tenantId}
                    ref={supplementRef}
                    configList={configList}
                    tableMaxHeight={tableMaxHeight}
                    supplierBasicId={basic.supplierBasicId}
                    firstActiveKey={(head(configList) || {}).configName}
                  />
                </SecondSection>
              )}
            </TopSection>
          </Spin>
        </Context.Provider>
      </Content>
      {investigQueryFlag && renderPositionLink(positionProps)}
    </Fragment>
  );
};

export default compose(
  remote(
    {
      code: 'SSLM_SUPPLIER_DETAIL_NEW',
      name: 'supplierDetailNewRemote',
    },
    {
      events: {
        cuxHandleCompanyId() {}, // 二开采购方公司默认值
      },
    }
  ),
  formatterCollections({
    code: [
      'sslm.common',
      'spfm.importErp',
      'sslm.supplierInform',
      'sslm.supplierDetail',
      'sslm.supplyAbility',
      'sslm.historyVersion',
      'sslm.enterpriseInform',
      'sslm.commonApplication',
      'spfm.supplier',
      'spfm.common',
      'spfm.bank',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_360_PAGE_COLLECT.HEADER_BTNS', // 头按钮
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_DOMESTIC', // 登记信息（境内）
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_OVERSEAS', // 登记信息（境外）
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_PERSONAL', // 登记信息（个人）
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.BUSINESS', // 基础业务信息
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.CONTACTS', // 联系人
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.ADDRESS', // 地址
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.BANK', // 银行账号
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.INVOICE', // 开票信息
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.FINANCE', // 财务状况
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.ATTACHMENT', // 附件信息
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.CLASSIFY', // 供应商分类
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.ABILITY', // 供货能力清单
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.PURCHASE_HEADER', // 采购财务头
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.PURCHASE_LINE', // 采购财务行
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.OTHERS', // 其他信息
      'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.TABS', // 企业基础信息标签页
      'SSLM.SUPPLIER_360_PAGE_COLLECT.SUPPLIER_BASIC',
      'SSLM.SUPPLIER_360_PAGE_COLLECT.PURCHASE_COMPANY', // 选择采购方公司
      'SSLM.SUPPLIER_360_PAGE_COLLECT.CARDS', // 卡片
    ],
  })
)(Index);
