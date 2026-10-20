import React from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { runInAction } from "mobx";
import { FieldType, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { Alert } from 'choerodon-ui';

export default class RelatedConfig extends React.Component<{
  relatedParams?: any;
  readOnly?: boolean;
  fieldLovMaps: any[];
  lovViewCode: string;
  mode?: string;
}, any> {
  ds: DataSet;

  unitList: any[] = [];

  mapFieldList: any = {};

  constructor(props) {
    super(props);
    const { fieldLovMaps = [], lovViewCode, readOnly, mode, relatedParams } = props;
    this.ds = new DataSet({
      data: fieldLovMaps,
      paging: false,
      fields: [
        {
          name: "sourceFieldCode",
          label: intl.get('hpfm.individual.model.config.sourceGridField').d('Lov表字段'),
          type: FieldType.object,
          lovCode: "HPFM.CUST.RELATE.FIELD.LIST",
          lovPara: { viewCode: lovViewCode },
          disabled: readOnly,
          required: true,
          transformRequest: (value) => {
            return value && value.fieldCode;
          },
          transformResponse: (_, obj) => {
            return {
              fieldCode: obj.sourceFieldCode,
              fieldName: obj.sourceFieldName,
            };
          },
          optionsProps: {
            paging: false,
          },
        },
        {
          name: "sourceFieldName",
          type: FieldType.string,
          bind: "sourceFieldCode.fieldName",
        },
        {
          name: "sourceFieldAlias",
          label: intl.get('hpfm.individual.model.config.sourceFieldAlias').d('Lov表字段别名'),
          disabled: readOnly,
          type: FieldType.string,
          required: true,
        },
        {
          name: "targetFieldId",
          label: intl.get('hpfm.individual.model.config.targetField').d('映射字段编码'),
          type: FieldType.object,
          disabled: readOnly,
          lovCode: mode === "tpl" ? "HPFM.CUST.TPL.CONFIG_FIELD_LIST" : "HPFM.CUST.CONFIG_FIELD_VIEW",
          lovPara: relatedParams,
          textField: "fieldName",
          valueField: 'bizKey',
          optionsProps: {
            paging: false,
          },
          required: true,
          transformRequest: (value) => {
            return value && value.fieldId;
          },
          transformResponse: (_, obj) => {
            return {
              // 因为前后端不用bizKey交互，在次只要保证有值且等于fieldId即可
              bizKey: obj.fieldId,
              fieldName: obj.targetFieldName,
            };
          },
        },
        {
          name: "targetFieldCode",
          type: FieldType.string,
          bind: "targetFieldId.fieldCode",
        },
        {
          name: "targetFieldName",
          type: FieldType.string,
          bind: "targetFieldId.fieldName",
        },
        {
          name: "targetModelCode",
          type: FieldType.string,
          bind: "targetFieldId.modelCode",
        },
        {
          name: "sourceDisplayField",
          type: FieldType.object,
          label: intl.get('hpfm.individual.model.config.sourceDisplayField').d('翻译字段'),
          lovCode: "HPFM.CUST.RELATE.FIELD.LIST",
          lovPara: { viewCode: lovViewCode },
          optionsProps: {
            paging: false,
          },
          disabled: readOnly,
          dynamicProps: {
            required: ({ record }) => record.get("targetFieldWidget") === "LOV",
          },
          transformRequest: (value) => {
            return value && value.fieldCode;
          },
          transformResponse: (_, obj) => {
            return {
              fieldCode: obj.sourceDisplayField,
              fieldName: obj.sourceDisplayFieldName,
            };
          },
        },
      ],
      events: {
        update: ({ value, name, record }) => {
          runInAction(() => {
            switch (name) {
              case "sourceFieldCode": record.set("sourceFieldAlias", value && value.fieldCode); break;
              case "targetFieldId":
                record.set("targetModelFieldCode", value && value.fieldCode);
                record.set("targetFieldWidget", value && value.fieldWidget);
                record.set("sourceDisplayField", undefined);
                break;
              case "sourceDisplayField":
                record.set("sourceDisplayFieldName", value && value.fieldName);
                break;
              default: ;
            }
          });
        },
      },
    });

    // eslint-disable-next-line no-param-reassign
    this.ds.records.forEach(record => { record.status = RecordStatus.add; });
  }

  columns: ColumnProps[] = [
    { name: "sourceFieldCode", editor: !this.props.readOnly, width: 180 },
    { name: "sourceFieldAlias", editor: !this.props.readOnly, width: 180 },
    { name: "targetFieldId", editor: !this.props.readOnly },
    { name: "sourceDisplayField", editor: this.props.readOnly ? false : (record) => record.get("targetFieldWidget") === "LOV" },
  ];

  buttons = [TableButtonType.add, TableButtonType.remove]

  render() {

    return (
      <>
        <Alert
          type="info"
          showIcon
          style={{ display: 'block', marginLeft: this.props.readOnly ? 0 : '18px', marginBottom: '8px' }}
          message={
            <>
              {intl.get('hpfm.individual.view.setRelatedField.tip1').d('请在左侧选择')}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={`${window.location.origin}${window.$$env.BASE_PATH ? window.$$env.BASE_PATH : ''
                  }hpfm/lov-view/lov-view-list?viewCode=${this.props.lovViewCode}`}
              >
                {intl.get('hpfm.individual.view.message.lovView').d('值集视图')}
              </a>
              {intl
                .get('hpfm.individual.view.setRelatedField.tip2')
                .d('已有字段（可选范围包括非表格列非查询列字段），将值带至右侧选择的个性化字段中')}
              <br />
              {intl
                .get('hpfm.individual.model.config.sourceDisplayFieldHelp')
                .d('若映射字段选择值集类型的字段，应额外选择目标值集的显示字段')}
            </>
          }
        />
        <Table
          style={{ height: "300px" }}
          dataSet={this.ds}
          columns={this.columns}
          selectionMode={this.props.readOnly ? SelectionMode.none : SelectionMode.rowbox}
          buttons={this.props.readOnly ? [] : this.buttons}
        />
      </>
    );
  }
}
