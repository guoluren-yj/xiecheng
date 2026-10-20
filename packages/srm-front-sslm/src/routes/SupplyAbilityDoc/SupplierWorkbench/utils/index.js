import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
// tab页
export const getTabs = () => {
  const tabs = [
    {
      key: 'wholeOrder',
      groupTab: intl.get('sslm.common.view.message.wholeOrder').d('整单'),
      tabPane: [
        {
          key: 'toBeSubmitted',
          tab: intl.get('sslm.common.view.message.waitSubmit').d('待提交'),
          searchBarCode: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.TO_SUBMIT_SEARCH',
          tableCode: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.TO_SUBMIT_LIST',
        },
        {
          key: 'wholeOrderAll',
          tab: intl.get('sslm.common.view.message.all').d('全部'),
          searchBarCode: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.ALL_SEARCH',
          tableCode: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.ALL_LIST',
        },
      ],
    },
    {
      key: 'lineDetail',
      groupTab: intl.get('sslm.common.view.message.detail').d('明细'),
      tabPane: [
        {
          key: 'lineDetailAll',
          tab: intl.get('sslm.common.view.message.all').d('全部'),
          searchBarCode: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL_LIST.ALL_SEARCH',
          tableCode: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL_LIST.ALL_LIST',
        },
      ],
    },
  ];
  return tabs;
};

export const getExportConfig = (isWholeOrderAll = true) => {
  let config = {};
  if (isWholeOrderAll) {
    config = {
      requestUrl: `${SRM_SSLM}/v1/${tenantId}/supply-ability-change-reqs/sup/all-export`,
      templateCode: 'SRM_C_SUPPLY_ABILITY_CHANGE_REQ_EXPORT_SUP',
    };
  } else {
    config = {
      requestUrl: `${SRM_SSLM}/v1/${tenantId}/supply-ability-change-lines/sup/all-export`,
      templateCode: 'SRM_C_SUPPLY_ABILITY_CHANGE_REQ_LINE_EXPORT_SUP',
      method: 'POST',
      allBody: true,
    };
  }
  return config;
};
