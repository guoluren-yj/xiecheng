/**
 * index.js - 发现采购方
 * @date: 2023-08-24
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isEmpty, compose, concat } from 'lodash';
import { DataSet, Modal, Spin } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState } from 'react';
import notification from 'utils/notification';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentUserId } from 'utils/utils';

import { checkBlackListSupplier } from '@/routes/components/utils/commonCheckUtils/blackListSupplier';
import { getAgreementModal } from '@/routes/components/PrivacyAgreement';
import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { companySearchInviteSupplier } from '@/services/searchPurchaserServices';
import {
  fetchPrivacyPolicy,
  fetchPrivacyPolicyText,
  fetchSinglePrivacyPolicyText,
  fetchShowSupplierCategory,
} from '@/services/commonService';

import { findPurchaserDS } from './stores/indexDS';
import { inviteDS, agreementDS } from './stores/inviteDS';
import PurchaserInfo from './components/PurchaserInfo';
import InviteModal from './components/InviteModal';

const currentUserId = getCurrentUserId();

const Index = ({ tableDs, customizeTable, customizeForm }) => {
  const [loading, setLoading] = useState(false);

  // 打开采购方信息弹窗
  const handlePurchaserInfoModal = useCallback(record => {
    const companyId = record.get('srmCompanyId');
    Modal.open({
      title: intl.get('sslm.searchPurchaser.model.purchaser.purchaserInfo').d('采购商信息'),
      drawer: true,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <PurchaserInfo companyId={companyId} />,
      style: { width: 1090 },
    });
  }, []);

  // 邀约
  const handleInviteModal = useCallback(record => {
    if (!isEmpty(record)) {
      // 查询一些配置项
      querySomeConfig(record).then(res => {
        if (!isEmpty(res)) {
          // 弹窗隐私协议
          getAgreementModal({
            record,
            showWelcomeMsg: false,
            onAgree: () => {
              openInviteModal({ record, configInfo: res });
            },
          });
        }
      });
    }
  }, []);

  // 邀约采购方弹窗
  const openInviteModal = useCallback((param = {}) => {
    if (!isEmpty(param)) {
      const { record = {}, configInfo = {} } = param;
      const {
        companyId: purchaserCompanyId,
        tenantId: purchaserTenantId,
        companyName: purchaserCompanyName,
      } = record.get(['companyId', 'tenantId', 'companyName']);
      const { supplierCategoryFlag, agreementList } = configInfo;

      const inviteModalDs = new DataSet(inviteDS({ supplierCategoryFlag }));
      // 隐私协议
      const agreementDs = new DataSet(agreementDS());
      inviteModalDs.setState('purchaserTenantId', purchaserTenantId);
      Modal.open({
        title: intl.get('sslm.common.model.common.initiateInvitation').d('发起邀约'),
        drawer: true,
        children: (
          <InviteModal
            dataSet={inviteModalDs}
            // listRecord={record}
            customizeForm={customizeForm}
            supplierCategoryFlag={supplierCategoryFlag}
            agreementList={agreementList}
            agreementDs={agreementDs}
            purchaserTenantId={purchaserTenantId}
            // proxyDsCreate={proxyDsCreate}
          />
        ),
        style: { width: 380 },
        onOk: async () => {
          const currentRecord = inviteModalDs.current;
          const validateFlag = await currentRecord.validate();
          let modalCloseFlag = false;
          if (validateFlag) {
            // 校验隐私协议
            const currentAgreementRecord = agreementDs.current;
            const agreementFlag = currentAgreementRecord
              ? currentAgreementRecord.get('agreementFlag')
              : 0;
            if (!agreementFlag) {
              notification.warning({
                message: intl
                  .get('sslm.searchPurchaser.view.message.cooperationTerms')
                  .d('请勾选合作条款。'),
              });
              return modalCloseFlag;
            }
            const currentData = currentRecord.toData();
            const { companyName, ...others } = currentData;
            const payload = {
              ...others,
              consentFormProcessor: currentUserId,
              inviteCompanyId: purchaserCompanyId,
              inviteTenantId: purchaserTenantId,
              levelTypeFlag: 1, // 后端不用，前端必传，后端有校验
              customizeUnitCode: 'SSLM.SEARCH_PURCHASER.LIST.INVITATION_INFO',
            };
            // 校验黑名单供应商
            const blackListParam = {
              supplierInfo: { ...currentData },
              effectiveType: 'supplierActiveInvite',
              weakCheckFlag: false,
              purchaserTenantId,
              purchaserCompanyName,
            };
            const blackListRes = await checkBlackListSupplier(blackListParam);
            if (!blackListRes) {
              return false;
            }
            const resp = await companySearchInviteSupplier(payload);
            if (getResponse(resp)) {
              notification.success({
                message: intl
                  .get('spfm.companySearch.view.message.invitatSuccessMsg')
                  .d('您好，您已向对方发起合作邀约，需等待被邀约企业处理，请耐心等待！'),
              });
              modalCloseFlag = true;
              // 刷新列表
              tableDs.query();
            }
            return modalCloseFlag;
          } else {
            notification.warning({
              message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
            });
            return modalCloseFlag;
          }
        },
      });
    }
  }, []);

  // 查询其他配置
  const querySomeConfig = useCallback(async record => {
    const { companyId, tenantId: purchaserTenantId } = record.get(['companyId', 'tenantId']);
    let supplierCategoryConfig = {};
    // 配置中心分类是否开启
    const supplierCategoryParams = {
      settingCode: '000113',
      tenantId: purchaserTenantId,
    };
    // 平台隐私协议
    const platformAgreements = [];
    const platformQueryParams = {
      partnerTenantId: 0,
      companyId: 0,
      textCode: 'SRM.SHARE.PERSONAL.INFORMATION',
    };
    // 租户隐私协议
    let tenantAgreements = [];
    const queryParams = {
      companyId,
      partnerTenantId: purchaserTenantId,
      textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
    };
    let result = {};
    try {
      setLoading(true);
      // 查询配置中心是否开启租户隐私协议
      const config = await fetchPrivacyPolicy({ tenantId: purchaserTenantId }).then(response => {
        return getResponse(response);
      });
      await Promise.all([
        config && config.settingValue === '1'
          ? fetchPrivacyPolicyText(queryParams)
          : Promise.resolve(false),
        fetchSinglePrivacyPolicyText(platformQueryParams),
        fetchShowSupplierCategory(supplierCategoryParams),
      ]).then(response => {
        const [tenantResp, platformResp, supplierCategoryResp] = response;
        if (getResponse(tenantResp)) {
          tenantAgreements = tenantResp;
        }
        if (getResponse(platformResp)) {
          platformAgreements.push(platformResp);
        }
        if (getResponse(supplierCategoryResp)) {
          supplierCategoryConfig = supplierCategoryResp;
        }
      });
      const finallyAgreements = concat(platformAgreements, tenantAgreements);
      const { settingValue } = supplierCategoryConfig;
      const supplierCategoryFlag = !!Number(settingValue);
      result = {
        supplierCategoryFlag,
        agreementList: finallyAgreements,
      };
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
    return result;
  }, []);

  const columns = [
    {
      name: 'companyName',
      width: 280,
      renderer: ({ value, record }) => (
        <a onClick={() => handlePurchaserInfoModal(record)}>{value}</a>
      ),
    },
    {
      name: 'action',
      renderer: ({ record }) => {
        return (
          <React.Fragment>
            <a
              onClick={() => {
                // 弹窗
                handleInviteModal(record);
              }}
              style={{
                marginRight: 8,
              }}
            >
              {intl.get('sslm.common.model.common.initiateInvitation').d('发起邀约')}
            </a>
          </React.Fragment>
        );
      },
    },
    {
      name: 'industries',
      width: 280,
    },
    {
      name: 'childrenIndustryNames',
    },
    {
      name: 'serviceAreaCodeNames',
    },
    {
      name: 'registeredCapital',
    },
    {
      name: 'currencyName',
    },
  ];

  const handleFieldProps = () => {
    const fieldProps = {
      childrenIndustryIdStrs: {
        computedProps: {
          lovPara: ({ record }) => {
            const industryIdStrs = record.get('industryIdStrs') || [];
            const industryIds = industryIdStrs.map(item => {
              return item.industryId;
            });
            return {
              industryIds: industryIds ? industryIds.join() : null,
            };
          },
        },
      },
      industrycategoryIdStrs: {
        computedProps: {
          lovPara: ({ record }) => {
            const childrenIndustryIdStrs = record.get('childrenIndustryIdStrs') || [];
            const childrenIndustryIds = childrenIndustryIdStrs.map(item => {
              return item.industryId;
            });
            return {
              industryIds: childrenIndustryIds ? childrenIndustryIds.join() : null,
            };
          },
        },
      },
    };
    return fieldProps;
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.companySearch.view.option.title.purchaser').d('发现采购商')} />
      <Content>
        <Spin spinning={loading}>
          <div style={{ height: tableHeight.fixedHeight }}>
            {customizeTable(
              {
                code: 'SSLM.SEARCH_PURCHASER.LIST.TABLE',
              },
              <SearchBarTable
                cacheState
                dataSet={tableDs}
                columns={columns}
                searchBarRef={() => {}}
                searchCode="SSLM.SEARCH_PURCHASER.LIST.SEARCH_BAR"
                style={{ maxHeight: tableMaxHeight.hasTab }}
                searchBarConfig={{
                  fieldProps: handleFieldProps(),
                }}
              />
            )}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'spfm.enterprise',
      'sslm.common',
      'entity.company',
      'spfm.disposeInvite',
      'spfm.supplierRegister',
      'spfm.contactPerson',
      'spfm.common',
      'sslm.searchPurchaser',
      'spfm.companySearch',
      'spfm.invitationRegister',
      'spfm.invitationList',
      'sslm.supplierInvite',
      'spfm.certificationApproval',
    ],
  }),
  withCustomize({
    unitCode: ['SSLM.SEARCH_PURCHASER.LIST.TABLE'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(findPurchaserDS());
      return { tableDs };
    },
    { cacheState: true }
  )
)(Index);
