import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const AssignItemBomDS = (formulaId, basicDS, customizeUnitCode) => ({
  primaryKey: 'relId',
  cacheSelection: true,
  cacheModified: true,
  fields: [
    {
      name: 'formulaId',
      defaultValue: formulaId,
    },
    {
      name: 'bomViewId',
      type: 'object',
      required: true,
      lovCode: 'SPC.PRICE_BOM_VIEW_LOV',
      label: intl.get(`spc.formulaManage.model.bomViewId`).d('物料BOM名称'),
      transformResponse: (value, record) => {
        const { bomViewName, bomViewId, bomViewCode } = record;
        return value
          ? {
              bomViewName,
              bomViewId,
              bomViewCode,
            }
          : null;
      },
      transformRequest: (value) => value?.bomViewId,
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const { bomTemplateId, bomTemplateCode } = basicDS?.current?.get('bomStructureId') || {};
          const deleteLineRelIds =
            dataSet?.getState('deleteLines')?.map((rec) => ({ relId: rec.get('relId') })) || [];
          const list = deleteLineRelIds?.concat(dataSet?.toJSONData() || []);
          const shieldBomViewCodes = list
            ?.filter((item) => item.bomViewCode)
            .map((item) => item.bomViewCode)
            .toString();
          const relIds = list
            ?.filter((item) => item.relId)
            .map((item) => item.relId)
            .toString();
          const shieldLineIds = dataSet.getQueryParameter('shieldLineIds');
          return {
            formulaId,
            bomTemplateId,
            bomTemplateCode,
            shieldBomViewCodes,
            relIds,
            shieldLineIds,
          };
        },
      },
    },
    {
      name: 'bomViewCode',
      bind: 'bomViewId.bomViewCode',
      label: intl.get(`spc.formulaManage.model.bomViewCode`).d('物料BOM编码'),
    },
    {
      name: 'mainItemName',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.mainItemId`).d('主物料'),
    },
    {
      name: 'mainItemCode',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.mainItemCode`).d('主物料编码'),
    },
    {
      name: 'creationRealName',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
  ],
  queryFields: [
    {
      name: 'mainItemName',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.mainItemId`).d('主物料'),
      merge: true,
    },
    {
      name: 'bomViewName',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.bomViewId`).d('物料BOM名称'),
      display: true,
    },
    {
      name: 'bomViewCode',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.bomViewCode`).d('物料BOM编码'),
      display: true,
    },
    {
      name: 'mainItemCode',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.mainItemCode`).d('主物料编码'),
      display: true,
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'bomViewId') {
        const { bomViewItemId, bomViewItemName } = value || {};
        record.set({
          mainItemId: bomViewItemId,
          mainItemName: bomViewItemName,
        });
      }
    },
  },
  transport: {
    read({ data, params }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-bom-rels/list`,
        method: 'POST',
        data,
        params: {
          ...params,
          customizeUnitCode,
        },
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-bom-rels`,
        method: 'POST',
        data,
        params: {
          ...params,
          customizeUnitCode,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-bom-rels`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { AssignItemBomDS };
