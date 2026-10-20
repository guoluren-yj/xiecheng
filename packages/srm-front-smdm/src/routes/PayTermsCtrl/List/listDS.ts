/*
 * @Description: 付款条款列表页DataSet
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-13 14:14:15
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { invert } from 'lodash';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { ListCustomizeCode } from '../utils/type';

export const payTermsCtrlListDS = (): DataSetProps => {
  const organizationId = getCurrentOrganizationId();
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    paging: 'server',
    childrenField: 'children',
    primaryKey: 'termHeaderId',
    fields: [
      {
        name: 'displayStatus',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        lookupCode: 'SPRP.TERM_HEADER_STATUS',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.operation').d('操作'),
      },
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermCode').d('付款条款编码'),
      },
      {
        name: 'termName',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermDesc').d('付款条款描述'),
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.version').d('版本'),
      },
      {
        name: 'termLineStageNums',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentStageCode').d('付款阶段编码'),
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermSource').d('付款条款来源'),
        lookupCode: 'SPRP.TERM_SOURCE_CODE',
      },
      {
        name: 'enableTermFlag',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.controlMode').d('管控模式'),
        lookupCode: 'SPRP.TERM_CONTROL_MODE',
        defaultValue: '1',
        required: true,
      },
      {
        name: 'priority',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.priority').d('优先级'),
      },
      {
        name: 'prepayFlag',
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.prePayExistFlag').d('存在预付'),
      },
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.enableFlag').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
    ],
    queryParameter: {
      customizeUnitCode: Object.values(ListCustomizeCode).join(),
    },
    transport: {
      read: () => ({
        url: `${SRM_SSTA}/v1/${organizationId}/term-headers/page`,
        method: 'GET',
      }),
      submit: ({ data }) => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/term-headers/enable`,
          method: 'PUT',
          data: data[0],
        };
      },
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