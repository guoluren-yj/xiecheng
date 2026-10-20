/*
 * @Date: 2023-06-12 13:58:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { Modal } from 'choerodon-ui/pro';
import { round, isEmpty, isFunction, isBoolean } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import {
  getResponse,
  getCurrentTenant,
  getCurrentLanguage,
  filterNullValueObject,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { checkPermission } from 'services/api';

import { fetchConfigTable, queryMenuPermissions, fetch360Config } from '@/services/commonService';
import {
  checkRiskEmbed,
  checkJoinedMointor,
  handleRiskEmbedPage,
  queryRiskMonitorType,
} from '@/services/supplierInviteManageServices';

const language = getCurrentLanguage();
const locale = language?.replace('_', '-');

// 获取供应商组件配置 - 是否使用新组件
export const getSupplierLovConfig = callback => {
  fetchConfigTable({
    configCode: 'source_supplier_lov_old_config',
    data: {
      tenantNum: getCurrentTenant().tenantNum,
    },
  }).then(res => {
    if (getResponse(res) && isFunction(callback)) {
      callback(!isEmpty(res));
    }
  });
};

// 表格自带的删除按钮，增加提示标题
export const dsDeleteData = ({ dataSet }) => {
  if (dataSet) {
    dataSet.delete(dataSet.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
    });
  }
};

// 计算英文环境下的金额
export const computeEnglistAmount = (value, precision) => {
  const computeValue =
    language === 'en_US' ? (value ? round(value / 100, precision) : value) : value;
  return (
    computeValue &&
    parseFloat(computeValue).toLocaleString(locale, { maximumFractionDigits: precision })
  );
};

// 菜单编码
export const menuCode = [
  'srm.partner.my-partner.supplier-inform-change-new', // 新供应商信息变更
  'srm.partner.purchaser-investigation-workbench', // 新调查表
  'srm.partner.purchaser.evaluation-workbench', // 采购方评估工作台
  'srm.partner.lifecycle.management', // 生命周期管理工作台
  'srm.mdm.firm-info-change-new', // 新企业信息变更
  'srm.partner.my-partner.firm-info-change-confirm-new', // 新企业信息变更审批
];

// 查询菜单权限
export const handleMenuPermissions = async () => {
  let menuPermissions = {};
  await queryMenuPermissions({
    code: menuCode.join(),
  }).then(response => {
    const res = getResponse(response);
    if (res) {
      menuPermissions = res;
    }
  });
  return menuPermissions;
};

// 根据菜单权限跳转新老菜单-只读页面
export const handleToDetail = async ({
  data,
  dispatch,
  documentType,
  menuPermission = {},
  openTabFlag = false,
}) => {
  if (data) {
    const {
      reqId,
      evalType,
      reqStatus,
      companyId,
      toStageId,
      evalStatus,
      changeReqId,
      evalHeaderId,
      lifeCycleUrl,
      requisitionId,
      changeConfirmId,
      type: portType,
      investgHeaderId,
      investigateTemplateId,
      isPurchaseFlag,
      evalGranularity,
      partnerTenantId,
      supplierCompanyId,
      domesticForeignRelation,
      documentType: newDocumentType,
    } = data;
    const type = documentType || portType; // 单据类型，接口返回或前端自己传
    // 是否分配【供应商信息变更】新菜单
    const supChangeFlag = menuPermission['srm.partner.my-partner.supplier-inform-change-new'];
    // 是否分配【调查表】新菜单
    const investigFlag = menuPermission['srm.partner.purchaser-investigation-workbench'];
    // 是否分配【生命周期】新菜单
    const lifecycleFlag = menuPermission['srm.partner.lifecycle.management'];
    // 是否分配【企业信息变更】新菜单
    const enterpriseFlag = menuPermission['srm.mdm.firm-info-change-new'];
    // 是否分配【企业信息变更审批】新菜单
    const enterpriseTenantFlag =
      menuPermission['srm.partner.my-partner.firm-info-change-confirm-new'];

    let pathname = '';
    let queryParams = {};
    switch (type) {
      // 调查表
      case 'INVESTIGATE':
      case 'INVESTG_APPROVE':
        pathname = investigFlag
          ? `/sslm/purchaser-investigation/all-investigation/detail/${investgHeaderId}/${investigateTemplateId}`
          : `/sslm/investigation-send/detail`;
        queryParams = investigFlag ? {} : { investgHeaderId, investigateTemplateId };
        break;
      // 供应商信息变更
      case 'SUP_CHANGE':
        pathname = supChangeFlag
          ? '/sslm/supplier-inform-change-new/detail/read'
          : `/sslm/supplier-inform-change/detail/${changeReqId}/${companyId}`;
        queryParams = supChangeFlag
          ? { changeReqId, investgHeaderId, investigateTemplateId }
          : { supplierCompanyId };
        break;
      // 企业信息变更
      case 'FIRM_CHANGE': // 租户级
        pathname = enterpriseTenantFlag
          ? `/sslm/enterprise-inform-tenant-approval-new/detail/${changeConfirmId}`
          : `/sslm/enterprise-inform-confirm/detail/${changeReqId}/${changeConfirmId}/${companyId}/${partnerTenantId}`;
        queryParams = enterpriseTenantFlag
          ? {
              changeReqId,
              partnerTenantId,
              pageType: 'approval',
              openMenuType: 'openTab',
            }
          : {};
        break;
      case 'PLATFORM_FIRM_CHANGE': // 平台级
        pathname = enterpriseFlag
          ? '/sslm/enterprise-inform-change-new/detail/view'
          : `/sslm/include/supplier-manager/enterprise-inform-change/detail/${changeReqId}`;
        queryParams = enterpriseFlag
          ? {
              changeReqId,
              partnerTenantId,
              tenantId: partnerTenantId,
              openMenuType: 'openTab',
            }
          : {
              companyId,
              domesticForeignRelation,
              partnerTenantId,
              tenantId: partnerTenantId,
            };
        break;
      // 现场考察
      case 'SITE_APPROVE':
        pathname = `/sslm/site-investigate-report/result/detail/${evalHeaderId}/${evalType}/${evalStatus}`;
        break;
      // 送样
      case 'SAMPLE_SEND_CONFIRM':
        pathname = `/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}`;
        queryParams = {
          isSupplier: isPurchaseFlag,
        };
        break;
      // 考评结果查询
      case 'KPI_APPROVE':
        pathname = `/sslm/evaluation-query/detail/${evalHeaderId}`;
        queryParams = {
          evalGranularity,
          evalHeaderId,
        };
        break;
      // 采购方评估
      case 'SITE_REPORT_APPROVE':
        pathname = `/sslm/purchaser-evaluation-workbench/details/view`;
        queryParams = {
          evalHeaderId,
        };
        break;
      // 生命周期
      case 'LIFE_CYCLE':
        // newDocumentType没值，跳转老的生命周期申请单
        pathname = lifecycleFlag && newDocumentType ? '/sslm/life-cycle-manage/read' : lifeCycleUrl;
        queryParams =
          lifecycleFlag && newDocumentType
            ? {
                requisitionId,
                documentType: newDocumentType,
              }
            : {
                requisitionId,
                toStageId,
              };
        break;
      default:
        break;
    }

    const search = querystring.stringify(filterNullValueObject(queryParams));

    // 平台级企业信息变更使用openTab打开新路由（采购方可能没有企业信息变更菜单）
    if (type === 'PLATFORM_FIRM_CHANGE' && openTabFlag) {
      openTab({
        key: pathname,
        search,
        title: intl.get('sslm.enterpriseInform.view.title.changeApplication').d('企业信息变更'),
      });
    } else if (pathname) {
      dispatch(
        routerRedux.push({
          pathname,
          search,
        })
      );
    }
  }
};

// 根据配置表配置，跳转新老360查询， 360二开的cuzFlag传true
export const handleSupplierDetail = (data = {}, cuzFlag = false) => {
  const oldPathName = cuzFlag
    ? '/sslm/supplier-manager/supplier-detail'
    : '/sslm/include/supplier-manager/supplier-detail';

  fetch360Config().then(response => {
    const res = getResponse(response);
    if (res) {
      const {
        tenantId,
        companyId,
        sourceType,
        supplierCompanyId,
        supplierTenantId: partnerTenantId,
        spfmCompanyId,
        spfmPartnerCompanyId,
        spfmSupplierCompanyId,
      } = data;
      const otherParams =
        cuzFlag && !res.isOpen
          ? {
              pageType: 'include',
              spfmCompanyId,
              spfmPartnerCompanyId,
              spfmSupplierCompanyId,
            }
          : {};
      const pathname = res.isOpen ? '/sslm/supplier-detail-new' : oldPathName;
      const search = querystring.stringify({
        tenantId,
        companyId,
        supplierCompanyId,
        partnerTenantId,
        ...otherParams,
      });
      // 判断是否为 relative 类型流程表单页面,外部系统iframe嵌入使用postMessage存在跨域问题
      if (window.top !== window && sourceType !== 'EXTERNAL_SYSTEMS') {
        window.parent.postMessage({
          type: 'openTab',
          data: JSON.stringify({
            closable: true,
            key: pathname,
            path: pathname,
            search,
            title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360度查询'),
          }),
        });
      } else {
        openTab({
          key: pathname,
          search,
          title: 'hzero.common.view.message.360QueryDetail',
        });
      }
    }
  });
};

// 日期范围的渲染
export const rangeDateRender = (dataForm, dataTo, rule) => {
  const render = rule === DEFAULT_DATE_FORMAT ? dateRender : dateTimeRender;
  const newDataForm = render(dataForm);
  const newDataTo = render(dataTo);

  if (newDataForm && !newDataTo) {
    return `${newDataForm} ~ -`;
  } else if (!newDataForm && newDataTo) {
    return `- ~ ${newDataTo}`;
  } else if (!newDataForm && !newDataTo) {
    return '-';
  } else {
    return `${newDataForm} ~ ${newDataTo}`;
  }
};

// 斯瑞德风险扫描内嵌页
const goToPage = async ({ companyId, companyName, documentId, documentType }) => {
  await handleRiskEmbedPage({
    companyId,
    documentId,
    documentType,
    enterpriseName: companyName,
  }).then(res => {
    const resp = getResponse(res);
    if (resp) {
      const { monitorUrl } = resp;
      if (monitorUrl) {
        window.open(monitorUrl);
      }
    }
  });
};

// 校验是否开启了风控服务
const checkRisk = async params => {
  await checkRiskEmbed().then(async response => {
    const res = getResponse(response);
    if (res) {
      notification.success();
      await goToPage(params);
    }
  });
};

// 风险扫描
export const handleJoinedMointor = ({
  companyId,
  companyName,
  documentId,
  documentType,
  setLoading,
  supplierCompanyId,
}) => {
  if (isFunction(setLoading)) {
    setLoading(true);
  }
  const params = {
    companyId,
    companyName,
    documentId,
    documentType,
  };
  // 查询当前租户风控类型
  queryRiskMonitorType()
    .then(async riskMonitorTypeRes => {
      const riskMonitorTypeResult = getResponse(riskMonitorTypeRes);
      if (riskMonitorTypeResult) {
        const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
        // 斯瑞德监控
        if (riskMonitorType === 'SRD') {
          if (supplierCompanyId) {
            // 查询企业是否加入风险监控
            await checkJoinedMointor({ companyId: supplierCompanyId }).then(async res => {
              // 返回布尔值，api没有报错
              if (isBoolean(res)) {
                if (res) {
                  await checkRisk(params);
                } else {
                  Modal.confirm({
                    children: intl
                      .get('sslm.common.view.message.joinMonitorMsg')
                      .d('该企业未加入监控，扫描将会扣除扫描额度，是否确认扫描？'),
                    onOk: () => {
                      return checkRisk(params);
                    },
                  });
                }
              } else {
                getResponse(res);
              }
            });
          }
        }
        // 企查查 风险监控
        if (riskMonitorType === 'ZHENYUN_PARTNER') {
          await goToPage(params);
        }
      }
    })
    .finally(() => {
      if (isFunction(setLoading)) {
        setLoading(false);
      }
    });
};

// 获取按钮权限
export const getPermissionList = (permissionMap = {}) => {
  const meaningList = {
    approva: '审批',
    revoke: '撤销审批',
  };
  const permissionObj = {};
  for (const key in permissionMap) {
    if (Object.hasOwnProperty.call(permissionMap, key)) {
      const obj = permissionMap[key];
      const { code, type } = obj;
      permissionObj[key] = [
        {
          code,
          type: 'button',
          meaning: meaningList[type] || '默认',
        },
      ];
    }
  }
  return permissionObj;
};

// 没有权限的按钮权限集 permissionList: [{code: ''}]
export const getNotPermissionBtns = async (permissionList = []) => {
  let noPermissionBtns = null;
  if (isEmpty(permissionList)) {
    return noPermissionBtns;
  }
  const codeList = permissionList.map(p => p.code);
  const response = await checkPermission(codeList);
  if (getResponse(response)) {
    noPermissionBtns = [];
    (response || []).forEach(i => {
      const { code, approve } = i;
      if (!approve) {
        const btnInfo = permissionList.find(p => p.code === code);
        if (btnInfo) {
          const { name } = btnInfo;
          noPermissionBtns.push(name);
        }
      }
    });
    return noPermissionBtns;
  }
  return noPermissionBtns;
};
