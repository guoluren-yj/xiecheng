/*
 * @Date: 2025-08-20 09:41:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import { isNil } from 'lodash';
// import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
// import { HZERO_PLATFORM } from 'utils/config';
import { PRIVATE_BUCKET, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { bucketDirectory } from '@/routes/utils/utils';

const organizationId = getCurrentOrganizationId();

// const optionDs = () =>
//   new DataSet({
//     autoQuery: true,
//     childrenField: 'children',
//     transport: {
//       read: {
//         url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/tree`,
//         method: 'GET',
//         params: {
//           tenantId: organizationId,
//           'SPFM.EXT_SOURCE_ITEM.MAIN_PROCESS': 1,
//           'SPFM.EXT_SOURCE_ITEM.SUB_PROCESS': 2,
//         },
//       },
//     },
//   });

export const itemDS = ({ extSourceReqId }) => ({
  forceValidate: true,
  cacheSelection: true,
  autoCreate: isNil(extSourceReqId),
  primaryKey: 'extSourceItemId',
  fields: [
    {
      name: 'itemName',
      required: true,
      label: intl.get('sslm.common.item.itemName').d('物料名称'),
    },
    {
      type: 'number',
      required: true,
      name: 'quotaQuantity',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaQuantity').d('报价数量'),
    },
    {
      name: 'quotaUom',
      required: true,
      lookupCode: 'SPFM.EXT_SOURCE_ITEM.QUOTA_UOM',
      label: intl.get('sslm.outsideProjectSetup.modal.itemName').d('单位'),
    },
    {
      type: 'number',
      name: 'targetPrice',
      required: true,
      label: intl.get('sslm.outsideProjectSetup.modal.targetPrice').d('目标采购单价'),
    },
    {
      type: 'boolean',
      name: 'pricePublicFlag',
      label: intl.get('sslm.outsideProjectSetup.modal.pricePublicFlag').d('目标采购单价对外公开'),
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'itemDesc',
      label: intl.get('sslm.outsideProjectSetup.modal.itemDesc').d('物料描述'),
    },
    // {
    //   name: 'craft',
    //   label: intl.get('sslm.outsideProjectSetup.modal.item.craft').d('工艺'),
    //   options: optionDs(),
    //   textField: 'meaning',
    //   valueField: 'value',
    //   transformResponse: (value, record) => {
    //     const { mainProcess, subProcess } = record;
    //     if (mainProcess && subProcess) {
    //       return [mainProcess, subProcess];
    //     } else if (subProcess) {
    //       return [subProcess];
    //     } else {
    //       return value;
    //     }
    //   },
    // },
    // {
    //   name: 'materialGrade',
    //   lookupCode: 'SPFM.EXT_SOURCE_ITEM.MATERIAL_GRADE',
    //   label: intl.get('sslm.outsideProjectSetup.modal.item.material').d('材料'),
    // },
    {
      type: 'attachment',
      name: 'pictureUuid',
      required: true,
      viewMode: 'popup',
      funcType: 'link',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.outsideProject,
      label: intl.get('sslm.outsideProjectSetup.modal.pictureUuid').d('图纸'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-items/${extSourceReqId}`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-items/batch-delete`,
      method: 'DELETE',
    },
  },
});
