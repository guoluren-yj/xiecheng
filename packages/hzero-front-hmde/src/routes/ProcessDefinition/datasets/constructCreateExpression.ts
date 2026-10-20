import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'srm-front-boot/lib/utils/intl';

export function constructCreateExpression(/* props: { store: IStore } */) {
  const material: DataSetProps = {
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'source',
        label: intl.get('hiam.processDefinition.model.source').d('字段来源'),
        type: FieldType.string,
        options: new DataSet({
          data: [
            // {
            //   value: 'fixedValue',
            //   meaning: '固定值',
            // },
            {
              value: 'inputParameter',
              meaning: '入参',
            },
            // {
            //   value: 'customVariable',
            //   meaning: '自定义变量',
            // },
            {
              value: 'nodeOutputParameter',
              meaning: '节点出参',
            },
            // {
            //   value: 'expression',
            //   meaning: '表达式',
            // },
            // {
            //   value: 'fieldRef',
            //   meaning: '字段引用',
            // },
          ],
        }),
      },
      {
        name: 'fieldSelection',
        label: intl.get('hiam.processDefinition.model.fieldSelection').d('字段选择'),
        type: FieldType.object,
        textField: 'businessObjectName',
        valueField: 'businessObjectCode',
      },
      {
        name: 'associatedFieldSelection',
        label: intl.get('hiam.processDefinition.model.associatedFieldSelection').d('关联字段选择'),
        type: FieldType.string,
        textField: 'businessObjectFieldName',
        valueField: 'businessObjectFieldCode',
      },
      {
        name: 'variableSelection',
        label: intl.get('hiam.processDefinition.model.variableSelection').d('变量选择'),
        type: FieldType.string,
        textField: 'code',
        valueField: 'code',
      },
      {
        name: 'point',
        label: intl.get('hiam.processDefinition.model.point').d('节点'),
        type: FieldType.string,
        // textField: 'nodeName',
        // valueField: 'nodeCode',
      },
      {
        name: 'outParams',
        label: intl.get('hzero.processDefinition.model.outParams').d('出参'),
        type: FieldType.string,
      },
      {
        name: 'content',
        label: intl.get('hzero.processDefinition.model.content').d('代码域'),
        type: FieldType.string,
      },
    ],
  };

  return new DataSet(material);
}

export function constructExpressionCodeArea(initContent?: string) {
  const material: DataSetProps = {
    autoCreate: true,
    fields: [
      {
        name: 'content',
        type: FieldType.string,
        defaultValue: initContent,
        required: true,
      },
    ],
  };

  return new DataSet(material);
}
