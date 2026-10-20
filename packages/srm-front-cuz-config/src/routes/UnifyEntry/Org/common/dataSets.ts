/* eslint-disable eqeqeq */
import DataSet, { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldProps } from 'choerodon-ui/dataset/data-set/Field';
import { DataSetSelection, FieldTrim } from 'choerodon-ui/dataset/data-set/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isNil, isArray } from 'lodash';
import { runInAction } from "mobx";
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { HZERO_HMDE, HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import notification from 'hzero-front/lib/utils/notification';
import { NOT_CHINA_PHONE } from 'hzero-front/lib/utils/regExp';
import { transfromTreeSelectKey } from '../../../../utils/util';
import {
  getWidgetAlias,
  isCreate,
  isUpdate,
  SEARCHBAR_RANGE_COMPONENT,
  getSingleTenantValueCode,
  getFieldCodeAlias,
  getFieldNameAlias,
  getDefaultActiveAlias,
  SPECIAL_TABLE_MAX_PAGE_SIZE,
} from '../../../../utils/constConfig.js';
import { getParams } from '../../../../utils';
import { Record } from 'choerodon-ui/dataset';

export function templateDsFields(intl, dsStatus = 0): FieldProps[] {
  const updateMode = dsStatus & isUpdate;
  return [
    {
      name: 'templateCode',
      label: intl.get('hpfm.doc.common.templateCode').d('模板编码'),
      disabled: true,
    },
    {
      name: 'templateName',
      label: intl.get('hpfm.doc.common.templateName').d('模板名称'),
      type: FieldType.intl,
      required: !!updateMode,
      disabled: !updateMode,
    },
    {
      name: 'docName',
      label: intl.get('hpfm.doc.common.docName').d('单据名称'),
      type: FieldType.intl,
      required: !updateMode,
    },
    {
      name: 'enabledFlag',
      label: intl.get('hpfm.doc.common.enabledFlag').d('启用状态'),
      disabled: !updateMode,
      lookupCode: 'HPFM.ENABLED_FLAG',
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'templateVersion',
      label: intl.get('hpfm.customize.common.currentVersion').d('当前版本'),
      disabled: true,
    },
    {
      name: 'publishStatus',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'HPFM.CUSZ.PUBLISH_STATUS',
      disabled: true,
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.model.remark'),
      type: FieldType.string,
    },
  ];
}

export function unitFieldsDs(
  intl,
  { dsStatus = 0, unitInfoFun = (): any => undefined, mode, initUnitType, tableDs = undefined, menuCode = '' },
  context?
): DataSetProps {
  const isList = !!context;
  const batchFlag = isList ? context.batchFlag : {};
  const isSeachBarType = initUnitType === 'SEARCHBAR';
  const isGrid = initUnitType === "GRID";
  const createMode = dsStatus & isCreate;
  const updateMode = dsStatus & isUpdate;
  const noModelUnit = ['SECTION', 'COLLAPSE', 'TABPANE', 'BTNGROUP'].includes(initUnitType);
  const onlyVirtualField = initUnitType === 'WORKFLOW';
  const aggregationGroup = tableDs
    ? ((tableDs as unknown) as DataSet)
      .filter((r) => {
        if (r.get('aggregationFlag')) return true;
        return false;
      })
      .map((r) => r.toData())
    : [];
  return {
    paging: false,
    queryFields: [
      {
        label: intl.get('hpfm.customize.common.fieldCode').d('字段编码'),
        name: 'fieldCode',
        merge: true,
      },
      {
        label: intl.get('hpfm.customize.common.fieldName').d('字段名称'),
        name: 'fieldName',
        merge: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldType').d('字段类型'),
        name: 'custType',
        lookupCode: 'HPFM.CUST.FIELD_CUST_TYPE',
        display: true,
      },
      {
        label: getWidgetAlias(initUnitType),
        name: 'widget',
        display: true,
        optionsProps: (props) => {
          props.data = [
            ...(props.data || []),
            { value: 'NULL', meaning: intl.get('hpfm.customize.common.not_exists').d('为空') },
          ];
          return props;
        },
        lookupCode: initUnitType === 'BTNGROUP' ? 'HPFM.CUST.TABLE_BTN_TYPE' : 'HPFM.CUST.FIELD_COMPONENT',
      },
    ] as any[],
    fields: ([
      !noModelUnit &&
      dsStatus & isCreate && {
        label: intl.get('hpfm.customize.common.modelSelect').d('模型选择'),
        name: 'modelSelect',
        type: FieldType.string,
        // required: createMode,
        disabled: !updateMode || onlyVirtualField,
        defaultValue: onlyVirtualField ? undefined : unitInfoFun().modelCode,
        options: onlyVirtualField ? undefined : new DataSet({
          paging: false,
          autoQuery: true,
          childrenField: 'children',
          idField: 'value',
          transport: {
            read: () => ({
              method: 'GET',
              url: `${HZERO_HMDE}/v1/${getCurrentOrganizationId()}/business-object-relations/tree`,
              params: {
                businessObjectCode: unitInfoFun().combineCode,
                tenantId: getCurrentOrganizationId(),
              },
              transformResponse: (data) => {
                try {
                  const jsonData = JSON.parse(data);
                  if (jsonData.failed) return [];
                  const boRangeStr = unitInfoFun().businessObjectRange;
                  return transfromTreeSelectKey(
                    [jsonData],
                    'businessObjectRelationList',
                    'relBusinessObjectName',
                    'businessObjectRelationId',
                    boRangeStr ? boRangeStr.split(",") : []
                  );
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error(e);
                  return [];
                }
              },
            }),
          },
        }),
        textField: 'title',
        valueField: 'value',
      },
      !noModelUnit &&
      dsStatus & isCreate && {
        label: intl.get('hpfm.customize.common.fieldSelect').d('字段选择'),
        name: 'fieldSelect',
        ignore: 'always',
        type: FieldType.object,
        // required: createMode,
        disabled: !updateMode,
        lovCode:
          mode === 'tpl'
            ? 'HPFM.CUST.TPL.UNIT_FIELD.NOT_CONFIG.ORG'
            : 'HPFM.CUST.FIELD.NOT_CONFIG',
        dynamicProps: {
          required: ({ record }) => createMode && record.get('modelSelect'),
          lovPara: ({ record }) => {
            const { id, config = {} } = unitInfoFun();
            return {
              unitId: id,
              configId: config.id,
              lovCode: undefined,
              modelCode: record.get('modelCode'),
            };
          },
        },
        optionsProps: {
          paging: false,
        },
      },
      !noModelUnit && {
        label: intl.get('hpfm.customize.common.modelCode').d('模型编码'),
        name: 'modelCode',
        bind: 'modelSelect',
        disabled: true,
      },
      {
        label: getFieldCodeAlias(initUnitType),
        name: 'fieldCode',
        bind: 'fieldSelect.fieldCode',
        validator: (val, name, record) => {
          // 工作流仅支持新增attribute字段
          if (createMode && record && (record as Record).get('modelSelect') && ['hzero.wp.setup.process-define', 'hzero.wp.self.approval-workbenck'].includes(menuCode) && val && !val.toLowerCase().startsWith('attribute')) {
            return intl.get("hpfm.customize.common.validate.fieldCodeAlias.attributeField").d("仅支持attribute开头的字段");
          }
          if (record && !isNil((record as Record).get("configFieldId")) || /^[a-zA-Z][a-zA-Z0-9_\-.]*$/.test(val || '')) {
            return true;
          }
          return intl.get("hpfm.customize.common.validate.fieldCodeAlias.rule1").d("格式错误，请输入数字、字母、下划线");
        },
        dynamicProps: {
          required: ({ record }) => !record.get('modelSelect'),
          disabled: ({ record }) => record.get('modelSelect') || !createMode,
        },
      },
      {
        label: getFieldNameAlias(initUnitType),
        name: 'fieldName',
        bind: 'fieldSelect.fieldName',
        required: true,
        /** ui存在bug type如果包含intl在作为dynamicProps且不给初始值时无法正确回填数据 待修复 */
        type: FieldType.intl,
        dynamicProps: {
          disabled: ({ record }) => record.get('fieldNameType') !== 'CUSTOMIZE' || !updateMode,
          type: ({ record }) =>
            record.get('fieldNameType') !== 'CUSTOMIZE' ? FieldType.string : FieldType.intl,
        },
        transformResponse: (_, data) => {
          // 如果是多语言组件，data会是{zh_CN: 'xxx'}，所以用fieldCode鉴别是否是处于多语言弹窗的环境下执行
          if (!data.fieldCode) return _;
          switch (data.fieldNameType) {
            case 'EXTEND':
              return data.extendFieldName;
            case 'MODEL':
              return data.modelFieldName;
            case 'CUSTOMIZE':
            default:
              return data.fieldName;
          }
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.fieldNameOrigin').d('字段名称来源'),
        name: 'fieldNameType',
        disabled: !updateMode,
        required: updateMode,
        defaultValue: 'CUSTOMIZE',
      },
      {
        label: getDefaultActiveAlias(initUnitType),
        name: 'defaultActive',
        type: FieldType.auto,
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        transformRequest(value) {
          return Number(value || 0);
        },
        transformResponse(value) {
          if (initUnitType === "COLLAPSE") return value === undefined ? 1 : Number(value);
          return Number(value || 0).toString();
        },
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示'),
        name: 'helpMessage',
        type: FieldType.intl,
        disabled: !isSeachBarType && !updateMode,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldType').d('字段类型'),
        name: 'custType',
        lookupCode: 'HPFM.CUST.FIELD_CUST_TYPE',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individual.model.config.fieldAlias').d('编码别名'),
        name: 'fieldCodeAlias',
        // required: !isSeachBarType && updateMode,
        validator: (val, name, record: Record) => {
          const fieldCode = record && record.get("fieldCode");
          if (!record.getState("editAliasFlag")) return true;
          if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(val || '')) {
            return true;
          }
          if (record.get('modelSelect')) {
            return intl.get("hpfm.customize.common.validate.fieldCodeAlias.rule1").d("格式错误，请输入数字、字母");
          }
        },
        dynamicProps: {
          required: ({ record }) => !isSeachBarType && updateMode && record.get('modelSelect'),
          disabled: ({ record }) => !updateMode || record.get('custType') === 'STD',
        },
      },
      {
        label: intl.get('hpfm.customize.common.cardRelatedUnit').d('卡片关联单元'),
        name: 'relatedUnitName',
        disabled: true,
      },
      {
        label: intl.get('hpfm.customize.common.aggregationFlag').d('聚合组'),
        name: 'aggregationFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) => !updateMode || record.get('custType') === 'STD',
        },
      },
      {
        label: intl.get('hpfm.customize.common.hiddenNumFlag').d('隐藏数字提醒'),
        name: 'hiddenNumFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.whereOption').d('查询关系类型'),
        name: 'whereOption',
        lookupCode: 'HPFM.CUST.FIELD_QUERY_REALTION',
        dynamicProps: {
          required: () => updateMode && ['FILTER', 'QUERYFORM'].includes(unitInfoFun().unitType),
          defaultValue: () =>
            ['FILTER', 'QUERYFORM'].includes(unitInfoFun().unitType) ? '=' : undefined,
          disabled: ({ record }) => record.get('custType') === 'STD',
        },
        transformResponse: (value) => {
          if (value) return value;
          else return '=';
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.model').d('所属模型'),
        name: 'field.modelName',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.bindField').d('字段绑定'),
        name: 'bindField',
        disabled: !updateMode,
      },
      {
        name: 'labelCol',
        label: intl.get('hpfm.customize.common.labelCol').d('标签比例'),
        type: FieldType.number,
        min: 1,
        max: 24,
        step: 1,
        disabled: !updateMode,
      },
      {
        name: 'wrapperCol',
        label: intl.get('hpfm.customize.common.wrapperCol').d('值比例'),
        type: FieldType.number,
        min: 1,
        max: 24,
        step: 1,
        disabled: !updateMode,
      },
      {
        name: 'encryptFlag',
        label: intl.get('hpfm.individual.model.config.encryptFlag').d('强制加密'),
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        transformResponse(value) {
          return value === undefined ? '-1' : value;
        },
      },
      {
        name: 'widget.fieldWidget',
        dynamicProps: {
          required: ({ record }) =>
            !isSeachBarType &&
            !['BTNGROUP', 'SECTION', 'TABPANE', 'COLLAPSE'].includes(initUnitType) &&
            record.get('renderOptions') === 'WIDGET' &&
            record.get('custType') !== 'STD',
          lookupCode: () => {
            const { unitType } = unitInfoFun();
            if (unitType === 'BTNGROUP') return 'HPFM.CUST.TABLE_BTN_TYPE';
            return 'HPFM.CUST.FIELD_COMPONENT';
          },
          disabled: ({ record }) =>
            !updateMode ||
            ['SECTION'].includes(unitInfoFun().unitType) ||
            record.get('custType') === 'STD',
          label: () => getWidgetAlias(unitInfoFun().unitType),
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.renderType').d('渲染方式'),
        lookupCode: 'HPFM.CUST.RENDER_OPTIONS',
        name: 'renderOptions',
        disabled: !updateMode,
        defaultValue: 'WIDGET',
        dynamicProps: {
          disabled: ({ record }) => !updateMode || record.get('custType') === 'STD',
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.showFieldSet').d('预展示字段'),
        name: 'showFieldFlag',
        type: FieldType.boolean,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置'),
        name: 'gridSeq',
        type: FieldType.number,
        min: 1,
        step: 1,
        dynamicProps: {
          required: () =>
          (batchFlag.flag || updateMode) && !['FORM', 'QUERYFORM', 'SEARCHBAR', 'WORKFLOW'].includes(unitInfoFun().unitType),
          disabled: () => !batchFlag.flag && !updateMode,
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fixed').d('冻结'),
        name: 'gridFixed',
        lookupCode: 'HPFM.CUST.GIRD.FIXED',
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.row').d('行'),
        name: 'formRow',
        type: FieldType.number,
        min: 1,
        max: 999,
        step: 1,
        dynamicProps: {
          required: () => (batchFlag.flag || updateMode) && ['FORM', 'QUERYFORM', 'WORKFLOW'].includes(unitInfoFun().unitType),
          disabled: () => !batchFlag.flag && !updateMode,
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.col').d('列'),
        name: 'formCol',
        type: FieldType.number,
        min: 1,
        max: 999,
        step: 1,
        dynamicProps: {
          required: () => (batchFlag.flag || updateMode) && ['FORM', 'QUERYFORM', 'WORKFLOW'].includes(unitInfoFun().unitType),
          disabled: () => !batchFlag.flag && !updateMode,
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.rowSpan').d('跨行'),
        name: 'rowSpan',
        type: FieldType.number,
        min: 1,
        max: 999,
        step: 1,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.colSpan').d('跨列'),
        name: 'colSpan',
        type: FieldType.number,
        min: 1,
        max: 999,
        step: 1,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.visible').d('显示'),
        name: 'visible',
        type: isSeachBarType ? FieldType.boolean : FieldType.string,
        lookupCode: isSeachBarType ? undefined : 'HPFM.CUST.UNIT_COND_OPTIONS',
        trueValue: isSeachBarType ? 1 : undefined,
        falseValue: isSeachBarType ? 0 : undefined,
        defaultValue: isSeachBarType ? 1 : '1',
        required: !isSeachBarType && updateMode,
        transformResponse: (value) => (isSeachBarType && !isNil(value) ? Number(value) : value),
        dynamicProps: {
          disabled: ({ record }) => {
            const fxFlag = record.get("fxFlag.visible");
            let visibleModifyFlag = record.get("visibleModifyFlag");
            if (visibleModifyFlag === undefined) visibleModifyFlag = 1;
            return !visibleModifyFlag || isList && fxFlag || (!isList || !batchFlag.flag) && (!isSeachBarType && !updateMode) && !fxFlag || record.get('unitFieldRequired') == 1;
          },
        },
      },
      {
        name: "unitFieldVisible",
        type: FieldType.string,
      },
      {
        label: intl.get('hpfm.individual.model.config.editable').d('编辑'),
        name: 'fieldEditable',
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        // type: FieldType.string,
        type: isSeachBarType ? FieldType.boolean : FieldType.string,
        trueValue: isSeachBarType ? 1 : undefined,
        falseValue: isSeachBarType ? 0 : undefined,
        defaultValue: isSeachBarType ? 1 : '1',
        transformResponse: (value) => (isSeachBarType && !isNil(value) ? Number(value) : value),
        dynamicProps: {
          required: ({ record }) =>
            !isSeachBarType && updateMode && record.get('renderOptions') === 'WIDGET',
          disabled: ({ record }) => {
            const fxFlag = record.get("fxFlag.editable");
            let editableModifyFlag = record.get("editableModifyFlag");
            if (editableModifyFlag === undefined) editableModifyFlag = 1;
            return !editableModifyFlag || isList && fxFlag || (!isList || !batchFlag.flag) && (!isSeachBarType && !updateMode) && !fxFlag;
          },
        },
      },
      {
        name: "unitFieldEditable",
        type: FieldType.string,
      },
      {
        label: intl.get('hpfm.individual.model.config.required').d('必输'),
        name: 'fieldRequired',
        type: FieldType.string,
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        defaultValue: '0',
        dynamicProps: {
          required: ({ record }) =>
            !isSeachBarType && updateMode && record.get('renderOptions') === 'WIDGET',
          disabled: ({ record }) => {
            const fxFlag = record.get("fxFlag.required");
            let requiredModifyFlag = record.get("requiredModifyFlag");
            if (requiredModifyFlag === undefined) requiredModifyFlag = 1;
            // const { unitTag } = unitInfoFun();
            // if (isGrid && record.get("widget.fieldWidget") === "UPLOAD" && (unitTag || "").split(",").includes("H0")) return true;
            return !requiredModifyFlag || isList && fxFlag || (!isList || !batchFlag.flag) && !updateMode && !fxFlag || record.get('unitFieldRequired') == 1;
          },
        },
      },
      {
        name: "unitFieldRequired",
        type: FieldType.string,
      },
      {
        label: intl.get('hpfm.individual.model.config.placeholder').d('背景文字'),
        name: 'placeholder',
        type: FieldType.intl,
        disabled: !updateMode,
        transformResponse: (_, data) => {
          // 如果是多语言组件，data会是{zh_CN: 'xxx'}，所以用fieldCode鉴别是否是处于多语言弹窗的环境下执行
          if (!data.fieldCode) return _;
          return (data.widget || {}).placeholder;
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.linkTitle').d('链接标题'),
        name: 'linkTitle',
        type: FieldType.intl,
        disabled: !updateMode,
        transformResponse: (_, data) => {
          // 如果是多语言组件，data会是{zh_CN: 'xxx'}，所以用fieldCode鉴别是否是处于多语言弹窗的环境下执行
          if (!data.fieldCode) return _;
          return (data.widget || {}).linkTitle;
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.linkHref').d('URL'),
        name: 'widget.linkHref',
        type: FieldType.string,
        disabled: !updateMode,
        dynamicProps: {
          required: ({ record }) =>
            updateMode &&
            record.get('custType') !== 'STD' &&
            ['TABPANE', 'COLLAPSE', "SECTION"].includes(initUnitType) &&
            !record.get('aggregationFlag'),
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.valueCode').d('值集编码'),
        name: 'sourceCodeObject',
        type: FieldType.object,
        textField: 'sourceCode',
        ignore: 'always',
        lovPara: {
          enabledFlag: 1,
        },
        dynamicProps: {
          required: ({ record }) =>
            !isSeachBarType &&
            updateMode &&
            record.get('custType') !== 'STD' &&
            ['LOV', 'SELECT', 'RADIOGROUP'].includes(record.get('widget.fieldWidget')),
          lovCode: ({ record }) => {
            if (!updateMode) return undefined;
            switch (record.get('widget.fieldWidget')) {
              case 'LOV':
                return 'HPFM.LOV.VIEW.ORG';
              case 'SELECT':
              case 'RADIOGROUP':
                return 'HPFM.LOV.LOV_DETAIL_CODE.ORG';
              default:
            }
          },
          textField: ({ record }) => {
            switch (record.get('widget.fieldWidget')) {
              case 'LOV':
                return 'viewCode';
              case 'SELECT':
              case 'RADIOGROUP':
                return 'lovCode';
              default:
            }
          },
          valueField: ({ record }) => {
            switch (record.get('widget.fieldWidget')) {
              case 'LOV':
                return 'viewCode';
              case 'SELECT':
              case 'RADIOGROUP':
                return 'lovCode';
              default:
            }
          },
          lovPara: ({ record }) => {
            const { labelCode } = unitInfoFun();
            const para: any = {};
            if (['SELECT', 'RADIOGROUP'].includes(record.get('widget.fieldWidget'))) {
              para.lovGridQueryFlag = 0
            }
            if (labelCode) {
              para.labelCode = labelCode;
            }
            return para;
          },
        },
        disabled: !updateMode,
        transformResponse: (_, data) => {
          if (data.widget && data.widget.sourceCode) {
            return {
              lovCode: data.widget.sourceCode,
              viewCode: data.widget.sourceCode,
            };
          }
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.maxLength').d('最大长度'),
        name: 'widget.textMaxLength',
        type: FieldType.number,
        min: 1,
        step: 1,
        disabled: !updateMode,
        dynamicProps: {
          max: ({ record }) => {
            return record.get("columnLength") || 2147483647;
          }
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.minLength').d('最小长度'),
        name: 'widget.textMinLength',
        type: FieldType.number,
        min: 1,
        step: 1,
        disabled: !updateMode,
        dynamicProps: {
          max: ({ record }) => {
            return record.get("columnLength") || 2147483647;
          }
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.max').d('最大值'),
        name: 'widget.numberMax',
        type: FieldType.number,
        disabled: !updateMode,
        dynamicProps: {
          max: ({ record }) => {
            switch(record.get("columnType")) {
              case "bit": return 255;
              case "bigint": return 9223372036854775807;
              case "mediumint": return 8388607;
              case "tinyint": return 127;
              case "smallint": return 32767;
              case "varchar":
              case "int":
              case "integer": return 2147483647;
              case "decimal": return 2147483647;
              case "numeric": return 2147483647;
              case "float": return 1.7E+38;
              case "double": return 1.8E+308;
            }
            return 2147483647;
          },
          min: ({ record }) => {
            return record.get('widget.numberMin') || undefined;
          },
          precision: ({ record }) => {
            return record.get('widget.numberDecimal') || 0;
          },
          padDecimalZeros: ({ record }) => {
            return record.get('widget.supplementZero') === 1;
          },
        },
        transformRequest: (value) => {
          return !isNil(value) ? Number(value) : undefined;
        },
        validator: (v) => {
          if (!isNil(v) && v.toString().length > 300) {
            return intl.get('hpfm.individual.model.config.max.lengthError').d('最大值长度不能超过300');
          }
        }
      },
      {
        label: intl.get('hpfm.individual.model.config.min').d('最小值'),
        name: 'widget.numberMin',
        type: 'number',
        disabled: !updateMode,
        dynamicProps: {
          max: ({ record }) => {
            if (!isNil(record.get('widget.numberMax'))) {
              return record.get('widget.numberMax');
            }
            switch(record.get("columnType")) {
              case "bit": return 255;
              case "bigint": return 9223372036854775807;
              case "mediumint": return 8388607;
              case "tinyint": return 127;
              case "smallint": return 32767;
              case "varchar":
              case "int":
              case "integer": return 2147483647;
              case "decimal": return 2147483647;
              case "numeric": return 2147483647;
              case "float": return 1.7E+38;
              case "double": return 1.8E+308;
            }
            return 2147483647;
          },
          precision: ({ record }) => {
            return record.get('widget.numberDecimal') || 0;
          },
          padDecimalZeros: ({ record }) => {
            return record.get('widget.supplementZero') === 1;
          },
        },
        transformRequest: (value) => {
          return !isNil(value) ? Number(value) : undefined;
        },
        validator: (v) => {
          if (!isNil(v) && v.toString().length > 300) {
            return intl.get('hpfm.individual.model.config.min.lengthError').d('最小值长度不能超过300');
          }
        }
      },
      {
        label: intl.get('hpfm.individual.model.config.decimal').d('精度'),
        name: 'widget.numberDecimal',
        type: FieldType.number,
        min: 0,
        max: 100,
        step: 1,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.allowThousandth').d('千分位'),
        name: 'widget.allowThousandth',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.padZero').d('按精度小数位补零'),
        name: 'widget.supplementZero',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.dateFormat').d('日期格式'),
        name: 'widget.dateFormat',
        type: FieldType.string,
        lookupCode: 'HPFM.CUST.DATE_FORMAT',
        disabled: !isSeachBarType && !updateMode,
      },
      {
        label: intl.get('hpfm.customize.common.includeNowDayFlag').d('包含当天'),
        name: 'widget.includeNowDayFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.textAreaMaxLine').d('文本域行数'),
        name: 'widget.textAreaMaxLine',
        type: FieldType.number,
        max: 100,
        min: 1,
        step: 1,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.bucketName').d('附件权限'),
        name: 'widget.bucketName',
        type: FieldType.string,
        lookupCode: 'HPFM.CUST.WIDGET.BUCKET',
        disabled: !updateMode,
        dynamicProps: {
          required: ({ record }) =>
            !isSeachBarType && createMode && record.get('widget.fieldWidget') === 'UPLOAD' && record.get('custType') !== 'STD',
          disabled: () => !createMode,
        },
      },
      {
        label: intl.get('hpfm.customize.common.attachmentTemplate').d('上传附件模版'),
        name: 'widget.attachmentTemplate',
        type: FieldType.attachment,
        disabled: !updateMode,
        bucketName: 'private-bucket',
      },
      {
        label: intl.get('hpfm.customize.common.attachmentType').d('附件类型'),
        name: 'widget.attachmentType',
        type: FieldType.string,
        lookupCode: "HPFM.CUST.ATTACHMENT.TYPE",
        disabled: !updateMode,
        defaultValue: "normal",
        dynamicProps: {
          required: ({ record }) =>
            !isSeachBarType && updateMode && record.get('widget.fieldWidget') === 'UPLOAD' && record.get('custType') !== 'STD',
          disabled: ({ record }) => record.get('custType') === 'STD',
        },
        transformRequest(value, record) {
          if (record.get("widget.fieldWidget") === "UPLOAD") {
            return value;
          }
          return undefined;
        },
        transformResponse(value, data) {
          if (data.widget && data.widget.fieldWidget === "UPLOAD") {
            return value === undefined ? "normal" : value;
          }
          return undefined;
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.modalWidth').d('宽度'),
        name: 'widget.modalWidth',
        type: FieldType.number,
        min: 1,
        max: 1920,
        step: 1,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.linkNewWindow').d('在新窗口中打开'),
        name: 'widget.linkNewWindow',
        type: FieldType.boolean,
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.fileFormat').d('文件格式'),
        name: 'widget.fileFormat',
        disabled: true,
        multiple: ',',
      },
      {
        label: intl.get('hpfm.individual.model.config.uploadShowFlag').d('附件直显'),
        name: 'widget.uploadShowFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        label: isSeachBarType
          ? undefined
          : intl.get('hpfm.individual.model.config.multipleFlag').d('启用多选'),
        name: 'widget.multipleFlag',
        type: FieldType.auto,
        disabled: !isSeachBarType && !updateMode,
        transformRequest(value, record) {
          if (!isSeachBarType && isNil(value)) return record && record.get("custType") === "EXT" ? 0 : -1;
          return Number(value);
        },
        transformResponse(value, obj) {
          if (!isSeachBarType && isNil(value)) return obj && obj.custType === "EXT" ? "0" : "-1";
          return Number(value || 0).toString();
        },
        dynamicProps: {
          lookupCode: () => {
            if (isSeachBarType) return 'HPFM.ENABLED_FLAG';
            return "HPFM.CUST.UNIT_COND_OPTIONS";
          }
        }
      },
      {
        label: intl.get('hpfm.customize.common.defaultValueType').d('默认值类型'),
        name: 'proDefaultFlag',
        type: FieldType.number,
        options: new DataSet({
          data: [
            { value: 0, meaning: intl.get('hpfm.customize.common.fixed').d('固定值') },
            { value: 1, meaning: intl.get('hpfm.customize.common.expression').d('公式') },
          ],
        }),
        defaultValue: 0,
        transformResponse: (value) => (value ? 1 : 0),
        disabled: !updateMode,
      },
      {
        label: intl.get('hpfm.individual.model.config.linkType').d('链接类型'),
        name: 'widget.linkType',
        type: FieldType.string,
        lookupCode: 'HPFM.CUST.WIDGET.LINK_TYPE',
      },
      {
        label: intl.get('hpfm.individual.model.config.defaultValue').d('默认值'),
        name: 'widget.defaultValue',
        regionField: 'regionField',
        defaultValidationMessages: {
          patternMismatch: intl.get('hpfm.individual.model.config.defaultValue.patternMismatch').d('手机号码格式有误'),
        },
        dynamicProps: {
          lovCode: ({ record }) => {
            if (record.get('widget.fieldWidget') === 'LOV') return record.get('widget.sourceCode');
          },
          pattern: ({ record }) => {
            if (record.get('widget.fieldWidget') !== 'TEL_FIELD') {
              return undefined;
            }
            if (record.get('regionField') === '+86') {
              return record.get('widget.landlineNumFlag') == '1' ? /^1\d{10}$|^(\d{2,5}-?|\(\d{2,5}\))?[1-9]\d{4,7}(-\d{1,8})?$/ : /^1\d{10}$/;
            }
            return NOT_CHINA_PHONE;
          },
          lookupCode: ({ record }) => {
            switch (record.get('widget.fieldWidget')) {
              case 'SELECT':
              case 'RADIOGROUP':
                return record.get('widget.sourceCode');
              case 'SWITCH':
              case 'CHECKBOX':
                return 'HPFM.ENABLED_FLAG';
              default:
            }
            if (['SELECT', 'RADIOGROUP'].includes(record.get('widget.fieldWidget'))) {
              return record.get('widget.sourceCode');
            }
          },
          lovPara: ({ record, dataSet }) => {
            return getParams({
              paramList: record.get('paramList') || [],
              ctxParams: dataSet.getState('contextParams'),
            });
          },
          type: ({ record }) => {
            if (record.get('proDefaultFlag') === 1) return FieldType.string;
            switch (record.get('widget.fieldWidget')) {
              case 'LOV':
                return record.get('proDefaultFlag') ? FieldType.string : FieldType.object;
              case 'DATE_PICKER':
                return record.get('proDefaultFlag') ? FieldType.string : FieldType.dateTime;
              case 'EMAIL_FIELD':
                return record.get('proDefaultFlag') ? FieldType.string : FieldType.email;
              default:
                return FieldType.string;
            }
          },
          multiple: ({ record }) => {
            if (record.get('widget.fieldWidget') === 'LOV' && record.get('proDefaultFlag') === 1) return false;
            if (Number(record.get('widget.multipleFlag')) === 1) {
              if (['SELECT', 'RADIOGROUP'].includes(record.get('widget.fieldWidget'))) return ',';
              return true;
            }
          },
          disabled: ({ record }) =>
            !updateMode ||
            (['LOV', 'SELECT', 'RADIOGROUP'].includes(record.get('widget.fieldWidget')) &&
              !record.get('widget.sourceCode')),
          format: ({ record }) => {
            if (record.get('widget.fieldWidget') === 'DATE_PICKER') {
              return record.get('widget.dateFormat');
            }
          },
          optionsProps: (dsProps) => {
            const { record } = dsProps;
            if (record.get('widget.fieldWidget') === 'LOV') {
              return {
                childrenField: 'children',
                paging: 'server',
              };
            }
            return {};
          },
          precision: ({ record }) => {
            return record.get('widget.numberDecimal') || 0;
          },
          padDecimalZeros: ({ record }) => {
            return record.get('widget.supplementZero') === 1;
          },
          trim: ({ record}) => {
            if (record.get('widget.fieldWidget') === 'INPUT' && record.get('proDefaultFlag') !== 1) {
              return record.get('widget.trimFlag') === 1 ? FieldTrim.all : FieldTrim.both;
            }
            return undefined;
          },
        },
        transformRequest: (value, record) => {
          if (!value) return value;
          const multipleFlag = Number(record.get('widget.multipleFlag'));
          const valueField = record.getField('widget.defaultValue')!.get('valueField');
          const regionField = record.get('regionField');
          if (multipleFlag === 1 && !value.length || isSeachBarType) return;
          switch (record.get('widget.fieldWidget')) {
            case 'LOV':
              if (record.get('proDefaultFlag')) return value;
              return multipleFlag === 1 ? value.map((v) => v[valueField]).join(',') : value[valueField];
            case 'SELECT':
            case 'RADIOGROUP':
              return multipleFlag === 1 && isArray(value) ? value.join(",") : value;
            case 'SWITCH':
            case 'CHECKBOX':
              return value;
            case 'TEL_FIELD':
              return value && value.indexOf('|') === -1 ? `${regionField}|${value}` : null;
            default:
              return value;
          }
        },
        transformResponse: (value, record = {}) => {
          const { lovInfo, multipleFlag, defaultValue: _d, defaultValueMeaning: _dm, fieldWidget } =
            record.widget || {};
          if (_d === "" || _d === undefined) return undefined;
          if (lovInfo) {
            const { valueField, displayField, valueFieldType } = lovInfo;
            // 如果不是string类型，说明至少已经转换过一次，直接返回
            if (typeof _d !== 'string') return _d;
            let defaultValue: string | string[] = _d;
            if (Number(multipleFlag || 0) === 1) {
              defaultValue = (_d || '').split(',');
              if (fieldWidget === 'LOV') {
                if (record.proDefaultFlag === 1) {
                  defaultValue = _d;
                } else {
                  return defaultValue.map((i) => {
                    let processV: any = i;
                    if (!isNil(processV)) {
                      switch(valueFieldType) {
                        case 'Number': processV = Number(i); break;
                        case 'String': processV = String(i); break;
                        default:;
                      }
                    }
                    return {
                      [valueField]: processV,
                      [displayField]: (_dm || [])[i] !== undefined ? _dm[i] : i,
                    };
                  });
                }
              }
              return defaultValue;
            }
            if (fieldWidget === 'LOV' && record.proDefaultFlag !== 1) {
              return {
                [valueField]: defaultValue,
                [displayField]: _dm,
              };
            }
            return defaultValue;
          }
          return value;
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.defaultValueReplace').d('默认值替换已有值'),
        name: 'widget.defaultValueReplaceFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: !updateMode,
      },
      {
        name: 'setRelateFields',
        dynamicProps: {
          disabled: ({ record }) => {
            if (!record.get('widget.sourceCode') || Number(record.get('widget.multipleFlag')) === 1) {
              return true;
            }
          },
        },
      },
      {
        name: 'sortedFlag',
        label: intl.get('hpfm.individual.model.config.sortedFlag').d('可排序'),
        options: new DataSet({
          selection: DataSetSelection.single,
          data: [
            { value: 1, meaning: intl.get('hzero.common.status.yes').d('是') },
            { value: 0, meaning: intl.get('hzero.common.status.no').d('否') },
            { value: -1, meaning: intl.get('hzero.common.status.default').d('默认') },
          ],
        }),
        dynamicProps:  ({ record }) => {
          const sortedEditorFlag = unitInfoFun().sortedEditorFlag || 0;
          const { custType, unitSortedFlag } = record.get(['custType', 'unitSortedFlag']);
          const isStandardField = custType === 'STD';
          return {
            disabled:
              sortedEditorFlag !== 1 ||
              (isStandardField && unitSortedFlag !== 1) ||
              (!isStandardField && unitInfoFun().extFieldSortedFlag !== 1),
            help:
              sortedEditorFlag === 1 && isStandardField && unitSortedFlag !== 1
                ? intl.get('hpfm.individual.model.config.sortedFlag.tooltip').d('当前字段平台层未启用排序，因此无法调整排序配置')
                : undefined,
          };
        },
      },
      {
        label: intl
          .get('hpfm.individuationUnit.model.individuationUnit.lovEnhanceFlag')
          .d('支持高级筛选'),
        name: 'widget.lovEnhanceFlag',
        type: 'number',
        defaultValue: 0,
        options: new DataSet({
          selection: DataSetSelection.single,
          data: [
            {
              value: 0,
              meaning: intl.get('hpfm.individual.model.config.normalFilter').d('普通筛选'),
            },
            {
              value: 1,
              meaning: intl.get('hpfm.individual.model.config.advanceFilter').d('高级筛选'),
            },
          ],
        }),
        transformResponse: (value, obj) => {
          if (obj && obj.widget && obj.widget.unitLovEnhanceFlag === 1 && (value === undefined || value === null)) {
            return 0;
          }
          return value;
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.mergeFlag').d('合并查询'),
        name: 'mergeFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get('hpfm.individual.model.config.placeholder').d('背景文字'),
        name: 'backgroundText',
        type: FieldType.intl,
      },
      {
        label: intl.get('hpfm.individual.model.config.filterType').d('筛选方式'),
        name: 'whereOptions',
        // lookupCode: 'HPFM.CUST.FIELD_QUERY_REALTION',
        multiple: true,
        help: intl.get('hpfm.individual.model.config.filterType.help').d('筛选方式中位于第一位的类型为默认筛选方式'),
        required: isSeachBarType,
        validator: (value) => value && value.length > 0,
        dynamicProps: {
          lookupCode: ({record}) => {
            const modelFieldFlag = record.get('modelFieldFlag');
            const isModelField = !record.get('virtualFieldFlag') && !isNil(record.get('modelCode')) && record.get('modelCode') !== -1;
            return isSeachBarType && !(createMode ? isModelField : modelFieldFlag) && record.get('widget.fieldWidget') === 'DATE_PICKER' ? 'HPFM.CUST.FIELD_QUERY_REALTION_RANGE' : 'HPFM.CUST.FIELD_QUERY_REALTION';
          }
        },
      },
      {
        label: intl
          .get('hpfm.individuationUnit.model.individuationUnit.sourceCode')
          .d('数据来源值集'),
        name: 'widget.sourceCode',
        dynamicProps: {
          lovCode: ({ record }) => {
            return getSingleTenantValueCode(
              record.get('widget.fieldWidget') === 'SELECT'
                ? 'HPFM.LOV.LOV_DETAIL_CODE'
                : 'HPFM.LOV.VIEW'
            );
          },
          displayField: ({ record }) =>
            record.get('widget.fieldWidget') === 'SELECT' ? 'lovCode' : 'viewCode',
          valueField: ({ record }) =>
            record.get('widget.fieldWidget') === 'SELECT' ? 'lovCode' : 'viewCode',
        },
      },
      {
        name: 'displayField',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.textField').d('显示字段名'),
        dynamicProps: {
          disabled: ({ record }) => record.get('custType') === 'STD',
        },
      },
      {
        name: 'valueField',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.valueField').d('值字段名'),
        dynamicProps: {
          disabled: ({ record }) => record.get('custType') === 'STD',
        },
      },
      {
        name: 'gridWidth',
        label: intl.get('hpfm.individual.model.config.gridWidth').d('宽度'),
        type: FieldType.number,
        disabled: !updateMode,
      },
      {
        name: 'gridFixed',
        label: intl.get('hpfm.individual.model.config.gridFixed').d('冻结'),
        type: FieldType.string,
        lookupCode: 'HPFM.CUST.GIRD.FIXED',
        disabled: !updateMode,
      },
      {
        name: 'sorter',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        disabled: true,
      },
      {
        name: 'aggregationCode',
        label: intl.get('hpfm.customize.common.aggregationCode').d('所在聚合组'),
        type: FieldType.string,
        options: new DataSet({
          paging: false,
          data: aggregationGroup
            .map((i) => ({
              value: i.fieldCodeAlias,
              meaning: i.cuszFieldName || i.extendFieldName || i.fieldName,
            }))
            .concat([
              {
                value: '__no_aggregation__',
                meaning: `---${intl.get('hpfm.customize.common.noAggregation').d('取消聚合')}---`,
              },
            ]),
        }),
        disabled: !updateMode,
      },
      {
        label: intl.get("hpfm.customize.common.autoDisabledDate").d("是否应用日历"),
        name: "widget.autoDisabledDate",
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        type: FieldType.auto,
        defaultValue: -1,
        transformResponse: (value, obj) => obj.widget && obj.widget.fieldWidget === "DATE_PICKER" && value === undefined ? -1 : value,
        transformRequest: (value, record) => record.get("widget.fieldWidget") === "DATE_PICKER" && value === undefined ? -1 : value,
        disabled: !isSeachBarType && !updateMode,
      },
      {
        label: intl.get('hpfm.customize.common.specialProps').d('UI特性'),
        name: "uiFeature",
        type: FieldType.string,
      },
      {
        label: intl.get('hpfm.customize.common.attachmentLimitNum').d('附件数量限制'),
        name: "widget.attachmentLimitNum",
        type: FieldType.number,
        precision: 0,
        step: 1,
        min: 1,
        max: 1000,
        // dynamicProps: {
        //   disabled: ({ record }) => {
        //     const { unitTag } = unitInfoFun();
        //     if (isGrid && record.get("widget.fieldWidget") === "UPLOAD" && (unitTag || "").split(",").includes("H0")) return true;
        //   }
        // }
      },
      {
        name: 'widget.uploadRecordFlag',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.uploadRecordFlag').d('展示附件操作记录'),
        type: FieldType.string,
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        transformRequest: (value) => {
          if (isNil(value) || isNaN(value)) return -1;
          return Number(value);
        },
        transformResponse: (value) => {
          if (isNil(value) || isNaN(value)) return -1;
          return Number(value);
        },
      },
      {
        label: intl.get('hpfm.customize.common.breakpointResumeFlag').d('分片上传'),
        name: 'widget.breakpointResumeFlag',
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        type: FieldType.string,
        transformRequest: (value) => {
          if (isNil(value) || isNaN(value)) return -1;
          return Number(value);
        },
        transformResponse: (value) => {
          if (isNil(value) || isNaN(value)) return -1;
          return Number(value);
        },
      }, {
        label: intl.get('hpfm.customize.common.autoCast').d('自动转大小写'),
        name: 'widget.autoCast',
        type: FieldType.string,
        options: new DataSet({
          data: [
            { value: "UPPER", meaning: intl.get('hpfm.customize.common.autoCast.upper').d('大写')},
            { value: "LOWER", meaning: intl.get('hpfm.customize.common.autoCast.lower').d('小写')},
            { value: "-1", meaning: intl.get('hpfm.customize.common.autoCast.origin').d('保留原有逻辑')}
          ]
        })
      },
      {
        label: intl.get('hpfm.customize.common.supportLandlineEntry').d('支持座机号码'),
        name: 'widget.landlineNumFlag',
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
        help: intl.get('hpfm.customize.common.supportLandlineEntry.help').d('仅支持C7N页面使用，H0页面无效'),
        dynamicProps: {
          required: ({ record }) => record.get('widget.fieldWidget') === 'TEL_FIELD' && initUnitType !== 'COMMON',
        },
        transformResponse(value) {
          return value === undefined ? '-1' : value;
        },
      },
      {
        name: 'regionField',
        type: 'string',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        name: 'widget.trimFlag',
        type: 'number',
        label: intl.get('hpfm.customize.common.trimFlag').d('去除空格'),
        lookupCode: 'HPFM.CUST.UNIT_TEXT_TRIM_TYPE',
        defaultValue: -1,
        transformResponse: (value) => {
          if (isNil(value) || isNaN(value)) return -1;
          return Number(value);
        },
      }
    ] as FieldProps[]).filter(Boolean),
    record: {
      dynamicProps: {
        selectable: (record) => !batchFlag.flag && record.get('configFieldId') !== undefined,
        defaultSelected: (record) => { return batchFlag.flag && record.dirty },
      },
    },
    events: {
      update: ({ name, record, value }) => {
        let valueField;
        if (name === "fieldCodeAlias") record.setState({editAliasFlag: true});
        runInAction(() => {

          switch (name) {
            case 'modelSelect':
              record.set('fieldSelect', undefined);
              record.set('fieldNameType', value ? 'MODEL' : 'CUSTOMIZE');
              break;
            case 'fieldCode':
              if (!record.get('modelSelect')) {
                record.set('fieldCodeAlias', value);
              }
              break;
            case 'widget.fieldWidget':
              record.set('sourceCodeObject', undefined);
              const { id, _token, tenantId, defaultValueReplaceFlag, bucketName: originBucketName } = record.get('widget') || {};
              let bucketName: string | undefined = originBucketName;
              if (value === "UPLOAD") {
                // if ((record.get("fieldCode") || "").startsWith("attribute")) {
                bucketName = originBucketName || "private-bucket";
                // }
                // h0表格附件临时方案，一旦组件类型发生变更，必输配置扩展字段要设置为否，标准字段设置为保留原有逻辑
                // 附件数量限制设置为空
                if (isGrid && (unitInfoFun().unitTag || "").split(",").includes("H0")) {
                  record.set("fieldRequired", record.get("custType") === "STD" ? -1 : 0)
                  record.set("widget.attachmentLimitNum", undefined);
                }
              }
              if (!isSeachBarType) {
                record.set('widget', {
                  fieldWidget: value,
                  id,
                  _token,
                  tenantId,
                  defaultValueReplaceFlag,
                  attachmentType: value === "UPLOAD" ? "normal" : undefined,
                  autoDisabledDate: value === "DATE_PICKER" ? -1 : undefined,
                  bucketName,
                  supplementZero: 1,
                  uploadRecordFlag: value === 'UPLOAD' ? -1 : undefined,
                });
                if (isNil(record.get('widget.multipleFlag')) && ['LOV', 'SELECT', 'RADIOGROUP'].includes(value)) {
                  record.set("widget.multipleFlag", record.get('custType') === 'STD' ? -1 : 0)
                }
              } else {
                const defaultOption = getComponentWhereOption(
                  record,
                  Number(record.get('widget.multipleFlag')),
                  value
                );
                record.set('whereOptions', defaultOption);
                record.set('mergeFlag', 0);
                record.set('widget.sourceCode', undefined);
                record.set('widget.dateFormat', undefined);
                record.set('widget.bucketName', bucketName);
                record.set('displayField', undefined);
                record.set('valueField', undefined);
                record.set('widget.lovEnhanceFlag', 0);
              }
              record.set('proDefaultFlag', 0);
              record.set("paramList", undefined);
              break;
            case 'widget.sourceCode':
              if (isSeachBarType) {
                record.set('displayField', undefined);
                record.set('valueField', undefined);
              }
              break;
            case 'sourceCodeObject':
              valueField = record.getField('sourceCodeObject').get('valueField');
              record.set('widget.sourceCode', (value || {})[valueField]);
              break;
            case 'fieldSelect':
              record.set('fieldCodeAlias', (value || {}).fieldCodeCamel);
              if (value) {
                record.set('fieldNameType', 'MODEL');
              }
              record.set("field.fieldId", value && value.fieldId);
              record.set("fieldId", value && value.fieldId);
              record.set("columnType", value && value.columnType);
              break;
            case 'widget.multipleFlag':
              record.set('widget.defaultValue', undefined);
              record.set("fieldLovMaps", undefined);
              if (isSeachBarType) {
                const defaultOption = getComponentWhereOption(record, value);
                // 范围日期默认显示in类型
                record.set('whereOptions', record.get('custType') === 'EXT' ? defaultOption : Number(value) && record.get('widget.fieldWidget') === "DATE_PICKER" ? ['IN'] : ['=']);
                record.set('mergeFlag', 0);
              }
              break;
            case 'mergeFlag':
              if (isSeachBarType && value === 1) {
                record.set('widget.multipleFlag', '0');
                record.set('whereOptions', ['=']);
              }
              break;
            case 'sortedFlag':
              if (isSeachBarType && value === 1) {
                notification.warning({
                  message: intl
                    .get('hpfm.individuationUnit.view.message.addSortFieldTip')
                    .d('自定义排序条件可能会导致性能下降，请测试后谨慎配置!'),
                });
              }
              break;
            case 'proDefaultFlag':
              record.set('widget.defaultValue', undefined);
              break;
            // case "whereOptions":
            //   if (value && value.length === 0) {
            //     record.set('whereOptions', undefined);
            //   }
            //   break;
            case 'widget.landlineNumFlag':
            case 'regionField':  
              record.validate('widget.defaultValue');
              break;
            case 'widget.numberDecimal':
              const { 'widget.numberMax': numberMax, 'widget.numberMin': numberMin } = record.get(['widget.numberMax', 'widget.numberMin']);
              if (numberMax && value) {
                const decimalLength = numberMax.toString().split('.')[1]?.length; 
                if (decimalLength > value) {
                  record.set('widget.numberMax', roundToDecimalPlaces(numberMax, value));
                }
              }
              if (numberMin && value) {
                const decimalLength = numberMin.toString().split('.')[1]?.length; 
                if (decimalLength > value) {
                  record.set('widget.numberMin', roundToDecimalPlaces(numberMin, value));  
                }
              }
            default:
          }
        });
      },
      create: ({ record }) => {
        initComponentWhereOption(record);
      },
      load: ({ dataSet }) => {
        if (isSeachBarType) {
          dataSet.forEach((record) => {
            initComponentWhereOption(record);
            const sortedEditorFlag = unitInfoFun().sortedEditorFlag || 0;
            const { custType, visible, unitFieldVisible, sortedFlag, unitSortedFlag } = record.get([
              'custType',
              'visible',
              'unitFieldVisible',
              'sortedFlag',
              'unitSortedFlag',
            ]);
            const isStandardField = custType === 'STD';
            if (
              sortedEditorFlag !== 1 ||
              (!isStandardField && (sortedFlag === -1 || unitInfoFun().extFieldSortedFlag !== 1)) ||
              (isStandardField && unitSortedFlag === 0)
            ) {
              record.init('sortedFlag', 0);
            }
            if (visible === -1) {
              record.init(
                'visible',
                !isNil(unitFieldVisible) && unitFieldVisible !== -1 ? unitFieldVisible : 1
              );
            }
          });
        } else {
          dataSet.forEach((record) => {
            const { 'widget.fieldWidget': fieldWidget, 'widget.supplementZero': supplementZero } = record.get(['widget.fieldWidget', 'widget.supplementZero']);
            if (fieldWidget === 'TEL_FIELD') {
              if (record.get('widget.defaultValue')) {
                const defaultValue = record.get('widget.defaultValue');
                const [regionCode, phoneNum] = defaultValue.split('|');
                record.init('regionField', regionCode);
                record.init('widget.defaultValue', phoneNum);
              } else {
                record.init('regionField', '+86');
              }
            }
            const fileFormat = record.get('widget.fileFormat');
            if (fileFormat && fileFormat[0] === 'all') {
              record.init('widget.fileFormat', intl.get('hpfm.customize.common.fileFormat.all').d('无限制'));
            }
          });
        }
      },
    },
    transport: {
      tls: ({ dataSet, name: fieldCode }) => {
        // TODO: 先使用 dataSet.current 下个版本 c7n 会 把 record 传进来
        let _token = dataSet!.current!.get('_token');
        if (["linkTitle", "placeholder"].includes(fieldCode)) _token = dataSet!.current!.get('widget._token');
        return {
          url: `${HZERO_PLATFORM}/v1/multi-language`,
          method: 'GET',
          params: { _token, fieldName: fieldCode },
          transformResponse: (data) => {
            try {
              const jsonData = JSON.parse(data);
              if (jsonData && !jsonData.faied) {
                const tlsRecord = {};
                jsonData.forEach((intlRecord) => {
                  tlsRecord[intlRecord.code] = intlRecord.value;
                });
                return [{ [fieldCode]: tlsRecord }];
              }
            } catch (e) {
              // do nothing, use default error deal
            }
            return data;
          },
        };
      },
    },
  };
}

export function unitInfoDs(intl, { dsStatus = 0 }): DataSetProps {
  const updateMode = dsStatus & isUpdate;
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: [
      {
        name: 'unitCode',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.unitCode').d('单元编码'),
        disabled: true,
      },
      {
        name: 'unitName',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.unitName').d('单元名称'),
        disabled: true,
      },
      {
        name: 'unitTitle',
        label: intl.get('hpfm.customize.common.unitTitle').d('单元标题'),
        type: FieldType.intl,
        dynamicProps: {
          disabled: ({ record }) => {
            return !updateMode || record.get('unitType') !== 'SECTION';
          },
        },
      },
      {
        name: 'unitType',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.unitType').d('单元类型'),
        lookupCode: 'HPFM.CUST.UNIT_TYPE',
        disabled: true,
      },
      {
        name: 'menuName',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.menuName').d('所属功能'),
        disabled: true,
      },
      {
        name: 'combineName',
        label: intl
          .get('hpfm.individuationUnit.model.individuationUnit.combinObj')
          .d('关联业务对象组合'),
        disabled: true,
      },
      {
        name: 'relateGroup',
        label: intl
          .get('hpfm.individuationUnit.model.individuationUnit.relateGroup')
          .d('所属单元组'),
        disabled: true,
      },
      {
        name: 'formMaxCol',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.formMaxCol').d('表单列数'),
        type: FieldType.number,
        min: 1,
        max: 6,
        step: 1,
        dynamicProps: {
          disabled: ({ record }) => {
            return !updateMode || !['FORM', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(record.get('unitType'));
          },
        },
        transformResponse: (value, obj) => {
          return (obj.config || {}).maxCol || value;
        },
      },
      {
        name: 'pageSize',
        label: intl.get('hpfm.customize.common.defaultPageSize').d('默认分页大小'),
        type: FieldType.number,
        min: 1,
        step: 1,
        disabled: !updateMode,
        transformResponse: (value, obj) => {
          return (obj.config || {}).pageSize || value;
        },
        dynamicProps: {
          max({record}) {
            const { unitCode, gridMaxPageCount } = record.get(['unitCode', 'gridMaxPageCount']);
            return SPECIAL_TABLE_MAX_PAGE_SIZE[unitCode] || gridMaxPageCount;
          },
        },
      },
      {
        name: 'config.pageAsyncFlag',
        label: intl.get('hpfm.customize.common.pageAsyncFlag').d('异步显示总数'),
        type: FieldType.number,
        defaultValue: -1,
        options: new DataSet({
          data: [
            { value: 1, meaning: intl.get('hzero.common.status.yes').d('是') },
            { value: 0, meaning: intl.get('hzero.common.status.no').d('否') },
            { value: -1, meaning: intl.get('hzero.common.status.default').d('默认') },
          ],
        }),
        dynamicProps: {
          disabled: ({ record }) => !updateMode || record.get('pageAsyncFlag') === 0,
        },
        transformResponse: (value, obj) => {
          if (obj.pageAsyncFlag === 0) return 0;
          if (value === undefined || value === null) return obj.pageAsyncFlag;
          return value;
        },
      },
      {
        name: 'labelWrapperCol',
        label: intl
          .get('hpfm.individuationUnit.model.individuationUnit.labelWrapperCol')
          .d('标签组件比例'),
        disabled: true,
        transformResponse(_value, rowData) {
          if (rowData.labelCol === undefined || rowData.wrapperCol === undefined) return undefined;
          return `${rowData.labelCol || 0}/24 - ${rowData.wrapperCol || 0}/24`;
        },
        transformRequest() {
          return undefined;
        },
      },
      {
        name: 'unitTag',
        disabled: true,
        label: intl.get('hpfm.customize.common.unitTag').d('单元标签'),
        lookupCode: 'HPFM.CUST.UNIT_LABEL',
        multiple: ',',
      },
      {
        name: 'sqlIds',
        disabled: true,
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.sqlIds').d('SQL IDs'),
        multiple: ',',
      },
      {
        name: 'config.autoNewlineFlag',
        type: FieldType.number,
        label: intl.get('hpfm.customize.common.autoRowHeight').d('多行文本自动换行'),
      },
      {
        name: 'sortedEnabled',
        label: intl.get('hpfm.individual.model.config.sortedEnabled').d('启用排序'),
        options: new DataSet({
          selection: DataSetSelection.single,
          data: [
            { value: 1, meaning: intl.get('hzero.common.status.yes').d('是') },
            { value: 0, meaning: intl.get('hzero.common.status.no').d('否') },
            { value: -1, meaning: intl.get('hzero.common.status.default').d('默认') },
          ],
        }),
        dynamicProps: {
          disabled: ({ record }) => {
            const sortedEditorFlag = record.get('sortedEditorFlag') || 0;
            return sortedEditorFlag !== 1;
          },
        },
      },
      {
        name: "config.gridSummary",
        label: intl.get('hpfm.customize.common.gridSummary').d('启用表格汇总行'),
        type: FieldType.number,
        lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
      },
      {
        // 通过在个性化直接增加业务对象扩展字段的DTO
        name: "businessObjectField",
        type: FieldType.object,
      },
      {
        name: "cardMaxCount",
        label: intl.get('hpfm.customize.common.cardMaxCount').d('自定义卡片数量'),
        transformResponse(value, obj) {
          if (obj.config && obj.config.cardMaxCount) {
            return obj.config.cardMaxCount;
          }
          return value;
        }
      }
    ],
  };
}
export function pageDs(dsData: any = [], intl): DataSetProps {
  const isUpdateDs = dsData.length > 0;
  return {
    autoCreate: true,
    data: dsData,
    fields: [
      {
        name: 'pageCode',
        required: true,
        pattern: /^[_A-Z0-9]+(\.[_A-Z0-9]*)*$/,
        label: intl.get('hpfm.doc.common.pageCode').d('页面编码'),
        disabled: isUpdateDs,
        format: 'uppercase',
      },
      {
        name: 'pageName',
        label: intl.get('hpfm.doc.common.pageName').d('页面名称'),
        type: FieldType.intl,
        required: true,
      },
      {
        name: 'orderSeq',
        label: intl.get('hpfm.doc.common.orderSeq').d('顺序'),
        type: FieldType.number,
        required: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hpfm.doc.common.enabledFlag').d('启用'),
        required: true,
        lookupCode: 'HPFM.ENABLED_FLAG',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
}

export function stageDs(dsData: any = [], intl): DataSetProps {
  const isUpdateDs = dsData.length > 0;
  return {
    autoCreate: true,
    data: dsData,
    fields: [
      {
        name: 'stageCode',
        required: true,
        pattern: /^[_A-Z0-9]+(\.[_A-Z0-9]*)*$/,
        label: intl.get('hpfm.doc.common.stageCode').d('阶段编码'),
        disabled: isUpdateDs,
        format: 'uppercase',
      },
      {
        name: 'stageName',
        label: intl.get('hpfm.doc.common.stageName').d('阶段名称'),
        type: FieldType.intl,
        required: true,
      },
      {
        name: 'orderSeq',
        label: intl.get('hpfm.doc.common.orderSeq').d('顺序'),
        type: FieldType.number,
        required: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hpfm.doc.common.enabledFlag').d('启用'),
        required: true,
        lookupCode: 'HPFM.ENABLED_FLAG',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
}

export function filterFieldDS(intl): DataSetProps {
  return {
    fields: [
      {
        label: intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称'),
        name: 'fieldName',
      },
      {
        label: intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型'),
        name: 'widget',
      },
      {
        label: intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值'),
        name: 'defaultValue',
      },
      {
        label: intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结'),
        name: 'fixedFlag',
      },
    ],
  };
}

function getComponentWhereOption(record, multipleFlag = 0, widget = undefined) {
  const fieldWidget = widget || record.get('widget.fieldWidget');
  if (fieldWidget === 'DATE_PICKER') {
    return ['='];
  } else if (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget)) {
    // INPUT', 'INPUT_NUMBER', 'SELECT', 'LOV'
    return Number(multipleFlag) === 1 ? ['IN'] : ['='];
  } else if (['LOV', 'SELECT'].includes(fieldWidget)) {
    return Number(multipleFlag) === 1 ? ['IN', 'NOT IN'] : ['=', '<>'];
  } else {
    return ['LIKE'];
  }
}

function initComponentWhereOption(record) {
  const { whereOption, 'widget.multipleFlag': multipleFlag, custType, 'widget.fieldWidget': fieldWidget } = record.get([
    'whereOption',
    'widget.multipleFlag',
    'custType',
    'widget.fieldWidget'
  ]);
  if (whereOption && whereOption.split(',').length > 0) {
    let options = whereOption.split(',');
    if (fieldWidget === 'DATE_PICKER') {
      options = options.map(item => item === 'IN' ? 'RANGE' : item);
    }
    record.init('whereOptions', options);
  } else {
    let defaultOption = getComponentWhereOption(record, multipleFlag);
    if (custType !== 'EXT') {
      // 标准字段multiple时默认筛选方式为in
      defaultOption = Number(multipleFlag) === 1 ? ['IN'] : ['='];
    }
    record.init('whereOptions', defaultOption);
  }
}


function roundToDecimalPlaces(x, y) {
  // 计算 10 的 y 次幂
  const multiplier = Math.pow(10, y);
  // 将 x 乘以 10 的 y 次幂，进行四舍五入，再除以 10 的 y 次幂
  return Math.round(x * multiplier) / multiplier;
}
