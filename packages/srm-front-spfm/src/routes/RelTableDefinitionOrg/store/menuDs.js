import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';

export const _SITE = isTenantRoleLevel() ? '' : 'site/';

function getMenuDs() {
  return {
    fields: [
      {
        name: 'menuName',
        type: 'intl',
        required: true,
        label: intl.get('spfm.relTableDefinition.model.relTableDefinition.menuName').d('菜单名称'),
      },
      {
        name: 'parentObject',
        type: 'object',
        required: true,
        lovCode: 'SADA.REL.FUNCTION.SELECT',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.parentObject')
          .d('所属目录'),
        lovDefineAxiosConfig: (lovCode) => {
          const lovConfig = lovDefineAxiosConfig(lovCode);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  dataSetProps: {
                    paging: false,
                    childrenField: 'childFunctions',
                    parentField: 'parentCode',
                    idField: 'code',
                  },
                };
              },
            ],
          };
        },
        ignore: 'always',
      },
      {
        name: 'parentMenuCode',
        type: 'string',
        bind: 'parentObject.code',
        required: true,
      },
      {
        name: 'parentMenuId',
        type: 'string',
        bind: 'parentObject.id',
        required: true,
      },
    ],
  };
}

export default getMenuDs;
