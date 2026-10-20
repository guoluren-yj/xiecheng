import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const asnDetailNumDs = ({ unitLineCode }) => ({
  dataToJSON: 'all',
  pageSize: 20,
  selection: false,
  primaryKey: 'asnItemLineId',
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemLineNum').d('行号'),
      name: 'itemLineNum',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
      name: 'itemCode',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.displayUom').d('单位'),
      name: 'displayUom',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.poQuantityTotal').d('订单总数'),
      name: 'poQuantityTotal',
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.canCreateQuantityTotal').d('可创建总数'),
      name: 'canCreateQuantityTotal',
      type: 'number',
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.actualQuantityTotalNumber')
        .d('单据数量'),
      name: 'actualQuantityTotal',
      type: 'number',
      help: intl
        .get('slod.deliveryWorkbench.model.common.actualQuantityTotalHehp')
        .d('不含未接收已关闭的行数量'),
    },
  ],
  transport: {
    read: ({ data, params: _p }) => {
      const { nodeTemplateCode, nodeConfigId, headerId, ...other } = data.params || {};
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } =
        data.tplInfo || {};
      let params;
      if (unitLineCode) {
        params = {
          ..._p,
          customizeUnitCode: unitLineCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/asn/${nodeConfigId}/detail/item/line/${headerId}?campKey=p`,
        method: 'GET',
        params,
        data: other,
      };
    },
  },
});

export default asnDetailNumDs;
