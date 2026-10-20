import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import {
  getResponse,
  getCurrentRole,
  getCurrentUser,
  getCurrentTenant,
  getCurrentOrganizationId,
} from 'utils/utils';

import { biddingHallChatRoomAddMembers } from '@/services/biddingHallService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import {
  fetchSourcePurchaseHeader,
  fetchSourceSupplierHeader,
  chatRoomHasInit,
} from './chatRoomServices';

/**
 * 新增配置表【寻源模块启用聊天室（排除竞价大厅】，控制：
 * 1）询价单/招标书发布时，是否初始化生成聊天室；
 * 2）询价/招标相关功能页面是否正常展示【在线沟通】按钮。
 * 逻辑：在配置表内的租户，启用聊天室；不在配置表内的租户，不启用聊天室。
 */
const chatRoomConfigTableVisible = async (pageProps) => {
  const { businessCode = 'source-rfx' } = pageProps || {};
  let data = null;
  let configCode = '';

  if (businessCode === 'source-rfx') {
    configCode = 'ssrc_rfx_chat_enable';
  }

  // 没有匹配到配置表编码，默认显示
  if (!configCode) {
    return true;
  }

  try {
    data = await fetchConfigSheet({
      organizationId: getCurrentOrganizationId(),
      configCode,
      data: {
        tenantNum: getCurrentTenant().tenantNum,
      },
    });
    data = getResponse(data);

    if (isEmpty(data)) {
      return false;
    }

    return true;
  } catch (e) {
    throw e;
  }
};

// chat room has init
const currentChatRoomHasInit = async (header, pageProps) => {
  const { rfxNum, tenantId } = header || {};
  const { businessCode = 'source-rfx' } = pageProps || {};
  let data = null;

  // 没有匹配到配置表编码，默认显示
  if (!businessCode || !rfxNum || !tenantId) {
    return false;
  }

  const param = {
    businessNo: rfxNum,
    businessCode,
    purchaseTenantId: tenantId,
  };

  try {
    data = await chatRoomHasInit(param);
    data = getResponse(data);

    if (!data) {
      return false;
    }

    return !!data;
  } catch (e) {
    throw e;
  }
};

// chat room common params
const getChatRoomConfigs = (header) => {
  if (!header) {
    return {};
  }

  // const { sealedQuotationFlag } = header || {};

  const supNameHideForSup = 0;
  // const supNameHideForPurch = sealedQuotationFlag === 1 ? 0 : 1;

  // if (openRule === 'HIDE_IDENTITY_HIDE_QUOTE' || openRule === 'HIDE_IDENTITY_OPEN_QUOTE') {
  //   supNameHideForSup = 0;
  // }
  // if (openRule === 'OPEN_IDENTITY_HIDE_QUOTE' || openRule === 'OPEN_IDENTITY_OPEN_QUOTE') {
  //   supNameHideForSup = 1;
  // }

  return {
    supNameHideForSup,
    supMsgHideForSup: 0,
    supNameHideForPurch: 0,
    purchUserNameHideForSup: 1,
    supUserNameHideForPurch: 0,
    supUserNameHideForSup: 0,
  };
};

const getPurRoomParams = (headerInfo, pageProps) => {
  const { businessCode = 'source-rfx' } = pageProps || {};
  const { tenantId, companyId, companyName, rfxNum } = headerInfo || {};

  const { name } = getCurrentRole() || {};
  const { id, realName } = getCurrentUser() || {};

  const emptyRequiredFlag = !tenantId || !companyId || !id || !name;
  if (emptyRequiredFlag) {
    return;
  }

  const commonConfigs = getChatRoomConfigs(headerInfo) || {};

  const data = {
    businessNo: rfxNum,
    businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
    businessCode,
    // businessURL: '',
    purchaseTenantId: tenantId,
    ...commonConfigs,
    currentUser: {
      tenantId,
      companyId,
      userId: id,
    },
    purchase: {
      tenantId,
      companyId,
      companyName,
      members: [
        {
          userId: id,
          userName: realName,
          roleName: name,
        },
      ],
    },
  };

  return data;
};

const chatRoomAddMembersPur = async (headerInfo, pageProps) => {
  const { businessCode = 'source-rfx' } = pageProps || {};
  const { tenantId, companyId, companyName, rfxNum } = headerInfo || {};

  const { name } = getCurrentRole() || {};
  const { id, realName } = getCurrentUser() || {};

  const emptyRequiredFlag = !tenantId || !companyId;

  if (emptyRequiredFlag) {
    return;
  }

  const data = {
    businessNo: rfxNum,
    businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
    businessCode,
    purchaseTenantId: tenantId,
    tenants: [
      {
        tenantId,
        companyId,
        companyName,
        members: [
          {
            userId: id,
            userName: realName,
            roleName: name,
          },
        ],
      },
    ],
  };

  try {
    let result = await biddingHallChatRoomAddMembers(data);
    result = getResponse(result);
    if (!result) {
      return false;
    }

    return true;
  } catch (e) {
    throw e;
  }
};

const chatRoomAddMembersSup = async (headerInfo, pageProps) => {
  const { businessCode = 'source-rfx', skipAddMemberFlag = 0, } = pageProps || {};
  const { rfxNum, tenantId, supplierTenantId, supplierCompanyId, supplierCompanyName } =
    headerInfo || {};

  const { name } = getCurrentRole() || {};
  const { id, realName } = getCurrentUser() || {};

  // 如果页面传了 skipAddMemberFlag，且值为 1，则不执行加人接口，直接返回 true
  // 针对主页面已手动加人，避免重复调用加人接口导致的性能问题
  if (skipAddMemberFlag) {
    return true;
  }

  const emptyRequiredFlag = !tenantId || !supplierTenantId;
  if (emptyRequiredFlag) {
    return;
  }

  const currentUserName = realName;

  const data = {
    businessNo: rfxNum,
    businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
    businessCode,
    purchaseTenantId: tenantId,
    tenants: [
      {
        tenantId: supplierTenantId,
        companyId: supplierCompanyId,
        companyName: supplierCompanyName,
        members: [
          {
            userId: id,
            userName: currentUserName,
            roleName: name,
          },
        ],
      },
    ],
  };

  try {
    let result = await biddingHallChatRoomAddMembers(data);
    result = getResponse(result);
    if (!result) {
      return false;
    }

    return true;
  } catch (e) {
    throw e;
  }
};

// supplier chat room params
const getSupRoomParams = async (headerInfo, pageProps) => {
  const { rfxNum, tenantId, supplierTenantId, supplierCompanyId, supplierCompanyName } =
    headerInfo || {};
  const { businessCode = 'source-rfx' } = pageProps || {};

  const { name } = getCurrentRole() || {};
  const { id, realName } = getCurrentUser() || {};

  const emptyRequiredFlag = !tenantId || !supplierTenantId || !supplierCompanyId || !id || !name;
  if (emptyRequiredFlag) {
    return;
  }

  const commonConfigs = getChatRoomConfigs(headerInfo) || {};

  const data = {
    businessNo: rfxNum,
    businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
    businessCode,
    purchaseTenantId: tenantId,
    // businessURL: '',
    ...commonConfigs,
    currentUser: {
      tenantId: supplierTenantId,
      companyId: supplierCompanyId,
      userId: id,
    },
    suppliers: [
      {
        tenantId: supplierTenantId,
        companyId: supplierCompanyId,
        companyName: supplierCompanyName,
        members: [
          {
            userId: id,
            userName: realName,
            roleName: name,
          },
        ],
      },
    ],
  };

  return data;
};

/**
 * purchase
 */
const handlePur = async (data = {}) => {
  const { rfxHeaderId, organizationId, pageProps = {} } = data || {};

  idValidation(rfxHeaderId);

  let header = null;
  let roomParams = null;
  let visible = false;
  try {
    // 配置表，控制聊天室是否显示
    const chatRoomVisible = await chatRoomConfigTableVisible(pageProps);
    if (!chatRoomVisible) {
      return;
    }

    header = await fetchSourcePurchaseHeader({
      rfxHeaderId,
      organizationId,
    });
    header = getResponse(header);
    if (!header) {
      return;
    }

    const chatRoomInt = await currentChatRoomHasInit(header, pageProps);
    if (!chatRoomInt) {
      return;
    }

    // 加人
    const addMemberResult = await chatRoomAddMembersPur(header, pageProps);
    if (!addMemberResult) {
      return;
    }

    // 获取聊天室参数
    roomParams = await getPurRoomParams(header, pageProps);
    visible = true;
  } catch (e) {
    throw e;
  }

  return {
    header,
    roomParams,
    visible,
  };
};

/**
 * supplier
 */
const handleSup = async (data = {}) => {
  const { quotationHeaderId, organizationId, pageProps = {} } = data || {};

  idValidation(quotationHeaderId);

  let header = null;
  let roomParams = null;
  let visible = false;
  try {
    // 配置表，控制聊天室是否显示
    const chatRoomVisible = await chatRoomConfigTableVisible(pageProps);
    if (!chatRoomVisible) {
      return;
    }

    header = await fetchSourceSupplierHeader({
      quotationHeaderId,
      organizationId,
    });
    header = getResponse(header);
    if (!header) {
      return;
    }

    const chatRoomInt = await currentChatRoomHasInit(header, pageProps);
    if (!chatRoomInt) {
      return;
    }

    // 加人
    const addMemberResult = await chatRoomAddMembersSup(header, pageProps);
    if (!addMemberResult) {
      return;
    }

    // 获取聊天室参数
    roomParams = await getSupRoomParams(header, pageProps);
    visible = true;
  } catch (e) {
    throw e;
  }

  return {
    header,
    roomParams,
    visible,
  };
};

const initCommonChat = async (data) => {
  const { roleCategory = 'PURCHASE' } = data || {};

  let result = null;
  if (roleCategory === 'PURCHASE') {
    result = await handlePur(data);
  }

  if (roleCategory === 'SUPPLIER') {
    result = await handleSup(data);
  }

  return result;
};

export { handlePur, handleSup, initCommonChat };
