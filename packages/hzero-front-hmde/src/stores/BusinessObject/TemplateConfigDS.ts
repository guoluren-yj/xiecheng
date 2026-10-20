import intl from 'srm-front-boot/lib/utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const TemplateConfigDS = id =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'objectVersionNumber',
        type: 'string',
      },
      {
        name: 'businessObjectImportTemplateSheetId',
        type: 'string',
      },
      {
        name: 'businessObjectImportTemplateId',
        type: 'string',
      },
      {
        name: 'orderSeq',
        type: 'string',
        label: intl.get('hmde.common.view.message.orderSeq').d('排序'),
      },
      {
        name: 'colField',
        type: 'string',
        label: intl.get('hzero.common.title.individuation.row').d('字段列'),
      },
      {
        name: 'businessObject',
        type: 'string',
        label: intl.get('hmde.bo.tab.title').d('业务对象'),
      },
      {
        name: 'sampleData',
        type: 'string',
        label: intl.get('hmde.common.view.message.example.data').d('示例数据'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hmde.common.label.remark').d('描述'),
      },
      {
        name: 'requiredFlag',
        type: 'number',
        label: intl.get('hzero.common.title.individuation.required').d('是否必输'),
      },
      {
        name: 'translatableFlag',
        type: 'number',
        label: intl.get('hmde.bo.importTemplate.view.message.translatableFlag').d('值集转换'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.importTemplate.label.enableFlag').d('当前Sheet页启用'),
      },
      {
        name: 'validatableFlag',
        type: 'number',
        label: intl.get('hmde.common.status.validate').d('是否校验'),
      },
      {
        name: 'sheetIndex',
        type: 'string',
      },
      {
        name: 'sheetName',
        type: 'intl',
        required: true,
        label: intl.get('hmde.bo.importTemplate.view.message.sheetName').d('sheetName'),
        validator: (value) => {
          if (value && value.length > 31) {
            return intl.get('hmde.bo.importTemplate.view.message.sheetName.tooLong').d('名称不多于31个字符');
          }
          if (value && /[:\\\/?*\[\]]/.test(value)) {
            return intl.get('hmde.bo.importTemplate.view.message.sheetName.invalidChart').d('名称不能包含以下字符：: \\ / ? * [ 或 ]');
          }
          if (value && (value[0] === '\'' || value[value.length - 1] === '\'')) {
            return intl.get('hmde.bo.importTemplate.view.message.sheetName.invalidDot').d('名称不能以单引号开头或结尾');
          }
        },
      },
      {
        name: 'trimFlag',
        type: 'boolean',
        label: intl
          .get('hmde.bo.importTemplate.view.message.formInputpsProTrim')
          .d('自动去除前后空格'),
        labelWidth: 150,
        textField: 'text',
        valueField: 'value',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                text: intl.get('hzero.common.status.yes').d('是'),
                value: true,
              },
              {
                text: intl.get('hzero.common.status.no').d('否'),
                value: false,
              },
            ],
          });
        })(),
      },
      {
        name: 'dataStartRow',
        type: 'number',
        label: intl.get('hmde.bo.importTemplate.view.message.dataStartRow').d('导入起始行'),
        min: 2,
      },
      {
        name: 'businessObjectImportTemplateCols',
        type: 'object',
      },
      {
        name: 'tenantId',
        type: 'number',
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-import-template-sheets/${id}/list`,
        method: 'get',
      },
    },
  } as DataSetProps);

export { TemplateConfigDS };
