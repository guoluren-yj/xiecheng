/**
 * EditModelTableDataSet
 * @date: 2021-05-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { isTenantRoleLevel } from 'utils/utils';

export default function EditModelTableDataSet(
  selectedTenantId: number | undefined,
  code: string | number | null
) {
  return {
    paging: false,
    fields: [
      {
        name: 'targetLogicModel',
        type: 'object',
        label: '模型',
        lovCode: isTenantRoleLevel() ? 'HMDE.LOGIC_MODEL.CODE' : 'HMDE.LOGIC_MODEL.CODE.SITE',
        ignore: 'always',
        dynamicProps: {
          lovPara: () => {
            // TODO: 确认是否需要固定参数 dataSourceType = TABLE
            return selectedTenantId === 0 || selectedTenantId === undefined
              ? { excludeLogicModelCode: code }
              : { tenantId: selectedTenantId, excludeLogicModelCode: code };
          },
        },
      },
      {
        name: 'logicModelCode',
        type: 'string',
        bind: 'targetLogicModel.code',
      },
      {
        name: 'modelObjectName',
        type: 'string',
        bind: 'targetLogicModel.name',
      },
      {
        name: 'targetModelField',
        type: 'object',
        label: '预留字段',
        lovCode: isTenantRoleLevel() ? 'HMDE.LOGIC_MODEL.FIELD' : 'HMDE.LOGIC_MODEL.FIELD.SITE',
        ignore: 'always',
        // textField: 'modelFieldDisplayName',
        cascadeMap: { logicModelCode: 'logicModelCode' },
        dynamicProps: {
          lovPara: () => {
            return selectedTenantId === 0 || selectedTenantId === undefined
              ? {}
              : { tenantId: selectedTenantId };
          },
        },
      },
      {
        name: 'modelFieldCode',
        type: 'string',
        bind: 'targetModelField.code',
      },
      {
        name: 'modelFieldDisplayName',
        type: 'string',
        bind: 'targetModelField.displayName',
      },
    ],
  };
}
