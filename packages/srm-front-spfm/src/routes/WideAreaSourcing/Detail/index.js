/**
 * 供应商详情页面
 * @author: qingxiang.luo@going-light.com
 * @date: 2021-08-13
 */
import React, { useEffect, useState } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro'; // DataSet
import { Modal, Spin } from 'choerodon-ui';
import { fetchWideAreaDetail, fetchManageDetail, markInvite } from '@/services/wideAreaService';
import {
  querySupplierCategoryDate,
  queryInviterData,
  fetchShowSupplierCategory,
  companySearchOwn,
  companySearchInvitePurchaser,
} from '@/services/companySearchService';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

import CompanyDetail from './CompanyDetail';

import IndexTabs from './IndexTabs';
import Invitation from '../../Invitation/Invitation';
import './index.less';

const organizationId = getCurrentOrganizationId();

const WideAreaSourcingDetail = (props) => {
  const taxNo = props?.match?.params?.taxNo ?? '';
  const corpName = props?.match?.params?.corpName ?? '';
  const goodsName = props?.match?.params?.goodsName ?? '';

  const { supplierCategoryFlag = {}, dispatch } = props;

  // 详情信息
  const [detailMsg, setDetailMsg] = useState({});
  // 经营指数
  const [wideSourceEval, setWideSourceEval] = useState(null);
  // 风控指数页面 说明标签列表
  const [codeObj, setCodeObj] = useState({});

  const [invitationProps, setInvitationProps] = useState({ visible: false });

  const [supplierCategoryDate, setSupplierCategoryDate] = useState({}); // 供应商分类信息
  const [inviterData, setInviterData] = useState({}); // 邀请方信息
  const [isSupplier, setIsSupplier] = useState(false); // 是否是 发现采购页面, 如果不是发现采购页面，则是发现供应商
  const [company, setCompany] = useState({}); // 公司信息
  const [inviteFlag, setInviteFlag] = useState(0); // 是否允许发送邀请
  const [viewCount, setViewCount] = useState(0); // 浏览量
  const [loading, setLoading] = useState(false); // loading 效果
  const [searchParams, setSearchParams] = useState({}); // 详情页查询条件

  useEffect(() => {
    const params = {
      loginName: getCurrentUser()?.loginName ?? '',
      realName: getCurrentUser()?.realName ?? '',
      corpName,
      taxNo,
    };
    setSearchParams(params);
    setLoading(true);

    // 经营指数
    fetchManageDetail(params).then((res) => {
      setWideSourceEval(res?.wideSourceEval ?? null);
    });

    fetchWideAreaDetail(params).then((res) => {
      setLoading(false);
      if (getResponse(res)) {
        setDetailMsg(res);
        setCompany({
          companyId: res?.companyId ?? '',
          companyName: res?.companyName ?? '',
          tenantId: res?.tenantId ?? '',
        });
        setInviteFlag(res?.invite ?? 0);
        setViewCount(res?.viewCount ?? 0);
      }
    });

    setIsSupplier(true);

    // 查询值集列表
    const codeParam = {
      businessChangeList: 'SPFM.BUSINESS_CHANGE.LIST',
      businessRiskList: 'SPFM.BUSINESS_RISK.LIST',
      judicialRiskList: 'SPFM.JUDICIAL_RISK.LIST',
      financialRiskList: 'SPFM.FINANCIAL_RISK.LIST',
      pubOptionRiskList: 'SPFM.PUBLIC_OPINION_RISK.LIST',
      riskControlIndex: 'SPFM.RISK_CONTROL_INDEX.LIST',
      investigateType: 'SSLM.INVESTIGATE_TYPE',
      roleTypeSet: 'SPFM.PARTNER_INVITE_ROLE_TYPE',
    };
    queryMapIdpValue(codeParam).then((res) => {
      if (getResponse(res)) {
        setCodeObj(res);
      }
    });
  }, []);

  const queryOwnCompany = () => {
    return companySearchOwn().then((res) => {
      return res;
    });
  };

  /**
   * 发送邀请
   */
  const handleSendInvite = (params) => {
    if (isSupplier) {
      queryOwnCompany().then((res) => {
        if (res && !isEmpty(res)) {
          setInvitationProps({
            ...invitationProps,
            isSupplier: true,
            inviteCompanyName: params.companyName,
            inviteCompanyId: params.companyId,
            inviteTenantId: params.tenantId,
            visible: true,
            defaultCompanyId: res.companyId,
            defaultCompanyName: res.companyName,
          });
        } else {
          setInvitationProps({
            ...invitationProps,
            isSupplier: true,
            inviteCompanyName: params.companyName,
            inviteCompanyId: params.companyId,
            inviteTenantId: params.tenantId,
            visible: true,
          });
        }
      });
    } else {
      handleFetchShowSupplierCategory(params.tenantId).then(() => {
        setInvitationProps({
          ...invitationProps,
          isSupplier: false,
          inviteCompanyName: params.companyName,
          inviteCompanyId: params.companyId,
          inviteTenantId: params.tenantId,
          visible: true,
        });
      });
    }
  };

  const handleFetchShowSupplierCategory = (tenantId) => {
    return fetchShowSupplierCategory(tenantId).then((res) => {
      if (getResponse(res)) {
        return res;
      }
    });
  };

  // 经营指数
  const operatList = () => {
    const dataObj = wideSourceEval;
    return dataObj
      ? [
          {
            item: intl.get('spfm.wideArea.view.title.performanceAbility').d('履约能力'),
            value: dataObj?.score0 ?? 0,
          },
          {
            item: intl.get('spfm.wideArea.view.title.customerStability').d('客户稳定度'),
            value: dataObj?.score1 ?? 0,
          },
          {
            item: intl.get('spfm.wideArea.view.title.productQuality').d('商品质量'),
            value: dataObj?.score2 ?? 0,
          },
          {
            item: intl.get('spfm.wideArea.view.title.commodityStability').d('商品稳定度'),
            value: dataObj?.score3 ?? 0,
          },
          {
            item: intl.get('spfm.wideArea.view.title.historicalPerformance').d('历史绩效'),
            value: dataObj?.score4 ?? 0,
          },
        ]
      : [];
  };

  const hideModal = () => {
    setInvitationProps({
      ...invitationProps,
      visible: false,
    });
  };

  /**
   * 发送邀请
   */
  const invite = (values) => {
    companySearchInvitePurchaser({ ...values, organizationId }).then((res) => {
      let inviteSendStatus = 0;
      if (getResponse(res)) {
        notification.success({
          message: intl
            .get(`spfm.companySearch.view.message.invitatSuccessMsg`)
            .d('您好，您已向对方发起合作邀约，需等待被邀约企业处理，请耐心等待！'),
        });
        inviteSendStatus = 1;
        hideModal();
      }

      markInvite({
        ...company,
        userName: getCurrentUser()?.loginName ?? '',
        realName: getCurrentUser()?.realName ?? '',
        inviteSendStatus,
      });
    });
  };

  const handleQuerySupplierCategoryDate = (params) => {
    querySupplierCategoryDate(params).then((res) => {
      if (getResponse(res)) {
        setSupplierCategoryDate(res);
      }
    });
  };

  // 获取邀请方信息
  const handleQueryInviterData = (params) => {
    queryInviterData(params).then((res) => {
      if (getResponse(res)) {
        setInviterData(res);
      }
    });
  };

  return (
    <Spin spinning={loading}>
      <Header
        title={intl.get('spfm.wideArea.view.title.wideAreaDetail').d('供应商详情')}
        backPath={`/spfm/wide-area-sourcing/list?goodsName=${goodsName}`}
      >
        <Button
          disabled={inviteFlag !== 1}
          icon="group_add-o"
          color="primary"
          onClick={() => handleSendInvite(company)}
        >
          {inviteFlag === 2
            ? intl.get('spfm.wideArea.view.title.hasCooperated').d('已合作')
            : intl.get('spfm.wideArea.view.btn.inviteCooperation').d('邀请合作')}
        </Button>
      </Header>
      <Content className="base-content-top">
        <CompanyDetail
          companyDetail={detailMsg?.registerInfo ?? {}}
          corpName={corpName}
          viewCount={viewCount}
        />
        <Modal
          width={1100}
          destroyOnClose
          visible={invitationProps.visible}
          onCancel={hideModal}
          footer={null}
        >
          <Invitation
            {...invitationProps}
            supplierCategoryFlag={supplierCategoryFlag}
            dispatch={dispatch}
            hideModal={hideModal}
            invite={invite}
            onQuerySupplierCategoryDate={handleQuerySupplierCategoryDate}
            supplierCategoryDate={supplierCategoryDate}
            inviterData={inviterData}
            onQueryInviterData={handleQueryInviterData}
            organizationId={organizationId}
            investigateType={codeObj.investigateType || []}
            roleTypeSet={codeObj.roleTypeSet || []}
          />
        </Modal>
      </Content>

      <Content className="base-content-bottom">
        <IndexTabs
          finalScore={wideSourceEval?.finalScore ?? 0}
          operatList={operatList()}
          searchParams={searchParams}
          codeObj={codeObj}
        />
      </Content>
    </Spin>
  );
};

export default formatterCollections({
  code: [
    'spfm.wideArea',
    'spfm.companySearch',
    'spfm.disposeInvite',
    'spfm.invitationRegister',
    'entity.company',
    'spfm.common',
    'hpfm.enterprise',
  ],
})(WideAreaSourcingDetail);
