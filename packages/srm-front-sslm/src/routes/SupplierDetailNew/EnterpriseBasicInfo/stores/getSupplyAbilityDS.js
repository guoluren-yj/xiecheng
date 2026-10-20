/*
 * @Date: 2023-08-17 14:42:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { abilityTooltip } from '@/routes/components/utils/constants';

const organizationId = getCurrentOrganizationId();

export const getSupplyAbilityDS = () => {
  const tooltipTitle = abilityTooltip();
  return {
    selection: false,
    fields: [
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
        name: 'itemName',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
        name: 'itemCategoryCode',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.categoryName`).d('品类名称'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
        name: 'supplyFlag',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        name: 'adapterProducts',
      },
      {
        label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        name: 'countryIdMeaning',
      },
      {
        label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        name: 'regionIdMeaning',
      },
      {
        label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        name: 'cityIdMeaning',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
        name: 'dateFrom',
        type: 'date',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
        name: 'dateTo',
        type: 'date',
      },
      {
        name: 'supplyStatus',
        lookupCode: 'SSLM.SUPPLYING_STATUS',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.supplyStatus').d('可供状态'),
        help: tooltipTitle.supplyStatusTip,
      },
      {
        name: 'psaEvaluationLevel',
        lookupCode: 'SSLM.EVALUATION_LEVEL',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.psaEvaluationLevel').d('PSA评级'),
        help: tooltipTitle.psaTip,
      },
      {
        name: 'psaEvaluationScore',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.psaEvaluationScore').d('PSA评分'),
        help: tooltipTitle.psaScoreTip,
      },
      {
        name: 'psaFinishDate',
        type: 'date',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.psaFinishDate').d('PSA完成时间'),
        help: tooltipTitle.psaFinishDate,
      },
      {
        name: 'spaEvaluationLevel',
        lookupCode: 'SSLM.EVALUATION_LEVEL',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.spaLevel').d('SPA评级'),
        help: tooltipTitle.spaTip,
      },
      {
        name: 'spaEvaluationScore',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.spaScore').d('SPA评分'),
        help: tooltipTitle.spaScore,
      },
      {
        name: 'spaFinishDate',
        type: 'date',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.spaFinishDate').d('SPA完成时间'),
        help: tooltipTitle.spaFinishDate,
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`).d('评价信息'),
        name: 'evaluateRemark',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
        name: 'quotaRatio',
      },
      {
        label: intl
          .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
          .d('库存组织'),
        name: 'inventoryOrganizationId',
        lovCode: 'SSLM.INV_ORGANIZATION',
        multiple: true,
        transformResponse: (value, data) => {
          const { inventoryOrganizationIdListMeaning } = data;
          return inventoryOrganizationIdListMeaning || [];
        },
      },
      {
        label: intl.get('hzero.common.upload.modal.title').d('附件'),
        name: 'attachmentUuid',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.purchGroup`).d('采购组'),
        name: 'createUserDepartment',
      },
      {
        label: intl
          .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
          .d('采购组织'),
        name: 'purchaseOrganizationName',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
        name: 'manufacturer',
      },
      {
        label: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        name: 'lastUpdateUserName',
      },
      {
        label: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        name: 'lastUpdateDate',
        type: 'date',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const params = dataSet.getQueryParameter('params');
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/query`,
          method: 'GET',
          data: params,
        };
      },
    },
  };
};

export const getAttachmentModalDS = ({ abilityLineId }) => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      label: intl.get('sslm.common.view.attachment.name').d('附件名称'),
      name: 'attachmentDesc',
    },
    {
      label: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
      name: 'attachmentSize',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
      name: 'uploadUserName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
      name: 'attachmentType',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
      name: 'dueDate',
      type: 'dateTime',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`,
      method: 'GET',
      data: { supplyAbilityLineId: abilityLineId },
    },
  },
});
