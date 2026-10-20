import { invert } from 'lodash';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON, FieldType, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { ListCustomizeCode } from '../utils/type';

export const payFundPlanListDS = (): DataSetProps => {
  const organizationId = getCurrentOrganizationId();
  return {
    pageSize: 20,
    autoQuery: false,
    selection: DataSetSelection.multiple,
    paging: 'server',
    childrenField: 'children',
    primaryKey: 'termHeaderId',
    dataToJSON: DataToJSON.selected,
    record: {
      dynamicProps: {
        selectable: (record) => record?.get('parentFlag') === 1,
      },
    },
    fields: [
      {
        name: 'termStatus',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        lookupCode: 'SBSM.TERM_HEADER_STATUS',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.operation').d('操作'),
      },
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermCode').d('付款条款编码'),
      },
      {
        name: 'termName',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermDesc').d('付款条款描述'),
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.version').d('版本'),
      },
      {
        name: 'termLineStageNums',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageCode').d('付款阶段编码'),
      },
      {
        name: 'dataSource',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermSource').d('付款条款来源'),
        lookupCode: 'SBSM.TERM_DATA_SOURCE',
      },
      {
        name: 'enableTermFlag',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.controlMode').d('启用资金计划'),
      },
      {
        name: 'priority',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.priority').d('优先级'),
      },
      {
        name: 'prepayStageFlag',
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.prePayExistFlag').d('存在预付'),
      },
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.enableFlag').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncStatus').d('同步状态'),
        lookupCode: 'SBSM.TERM_SYNC_STATUS',
      },
    ],
    queryParameter: {
      customizeUnitCode: Object.values(ListCustomizeCode).join(),
    },
    transport: {
      read: () => ({
        url: `/sbdm/v1/${organizationId}/term-headers/page`,
        method: 'GET',
        transformResponse: (response) => {
          let res: any = {};
          try {
            res = JSON.parse(response);
          } catch(e) {
            throw e;
          }
          if (!getResponse(res)) return;
          const { content = [] } = res || {};
          return {
            ...res,
            content: content.map((item) => {
              item.parentFlag = 1;
              // eslint-disable-next-line no-unused-expressions
              item?.children?.map((ele) => {
                ele.parentFlag = 0;
                return ele;
              });
              return item;
            }),
          };
        },
      }),
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        if (submitType === 'resync') {
          return {
            url: `/sbdm/v1/${organizationId}/term-headers/sync`,
            method: 'POST',
          };
        }
      },
    },
  };
};

export const resyncListDS = (termHeaderId): DataSetProps => {
  const organizationId = getCurrentOrganizationId();
  return {
    paging: false,
    autoQuery: true,
    selection: false,
    primaryKey: 'syncDetailId',
    fields: [
      {
        name: 'syncSystem',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncSystem').d('同步系统'),
        lookupCode: 'SBSM.TERM_HEADER_STATUS',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.operation').d('操作'),
      },
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncStatus').d('同步状态'),
        lookupCode: 'SBSM.TERM_SYNC_STATUS',
      },
      {
        name: 'syncResponseMsg',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncMsg').d('同步消息'),
      },
      {
        name: 'lastUpdateDate',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.operateTime').d('操作时间'),
      },
      {
        name: 'createdByName',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.operateUserName').d('操作人'),
      },
    ],
    queryParameter: {
      documentId: termHeaderId,
    },
    transport: {
      read: () => ({
        url: `/sbdm/v1/${organizationId}/term-sync-details/list`,
        method: 'GET',
      }),
    },
  };
};

export const permissionDS = (permissionCodeMap: Record<string, string>, ingoreKeyList: string[] = []): DataSetProps => {
  return {
    autoQuery: true,
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    data: [{}],
    fields: [],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/check-permissions`,
          method: 'POST',
          params: {},
          data: Object.values(permissionCodeMap),
          transformResponse: (res) => {
            try {
              const invertCodeMap = invert(permissionCodeMap);
              return Object.fromEntries(
                JSON.parse(res).map(({ code, approve }) => {
                  const permissionKey = invertCodeMap[code];
                  return [permissionKey, ingoreKeyList.includes(permissionKey) ? true : approve];
                })
              );
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};
