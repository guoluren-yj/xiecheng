/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import React from 'react';
import { Modal, Button, DataSet } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { isEmpty, isNil } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { getContext } from 'srm-front-cuz/lib/customizeTool';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { unitFieldsDs } from '../dataSets';
import {
  isCreate,
  isUpdate,
  SEARCHBAR_RANGE_COMPONENT,
  FilterComponentList,
  getFieldConfigAlias,
  unit,
  getSpecialConfig,
  limitWidgetTypeByColumnType,
  FIX_DATE_RANGES,
} from "../../../../../utils/constConfig";
import styles from "../../../style.less";
import { transformRequestFieldData } from './utils';
import FieldDetail from './FieldDetail';
import FieldDetailReadonly from './FieldDetailReadonly';

export default function openFieldDetail(record, options, {
  ParamsConfigImpl, ComputeRuleImpl,
  saveFieldUrl,
}) {
  const { dsStatus = 0, unitInfoFun, callback } = options;
  const newDs = new DataSet({
    ...unitFieldsDs(intl, options),
  });
  const readOnly = dsStatus === 0;
  const createMode = dsStatus & isCreate;
  const updateMode = dsStatus & isUpdate;
  const originData = record ? record.toJSONData() : {};
  const modalVar = getModalVar(originData, newDs, options);
  const { unitType, isSeachBarType, innerDataRef, coverData } = modalVar;
  const modalContext: ModalContext = {
    modalVar,
    utilsFunction: getUtilsFunction(newDs, options),
    impl: {
     ParamsConfigImpl, ComputeRuleImpl,
    },
    createMode,
    updateMode,
    options,
    modalDs: newDs,
    originData,
  };
  let forceSetValue = {};

  if (["TABPANE", "COLLAPSE", "SECTION"].includes(unitType)) forceSetValue = {widget: {fieldWidget: "LINK"}};

  Object.keys(coverData || {}).forEach(key => {
    forceSetValue[key] = coverData[key];
  });
  if (createMode) newDs.create(forceSetValue);
  else {
    newDs.loadData([Object.assign(originData, {widget: {...originData.widget, ...forceSetValue}})]);
    newDs.current!.status = RecordStatus.update;
  }

  newDs.setState("contextParams", {
    ctx: getContext(),
    /** url参数在配置界面上无意义 */
    url: {},
    self: {}, // 自定义参数，留口备用
  });
  const DetailComponent = readOnly ? FieldDetailReadonly : FieldDetail
  const ModalChildrenComponent: typeof FieldDetail = formatterCollections({ code: ['hpfm.individual', 'hpfm.customize', 'hmde.domainOwnBOList', 'hmde.bo'] })(DetailComponent);
  Modal.open({
    key: Modal.key(),
    drawer: true,
    style: {
      width: '742px',
    },
    maskClosable: false,
    title: getFieldConfigAlias(modalVar.unitType),
    className: styles["self-module1-style"],
    children: (
      <ModalChildrenComponent modalContext={modalContext} />
    ),
    footer: (ok, cancel, modal) => updateMode ? [ok, cancel] : [null, (
      <Button color={ButtonColor.primary} onClick={() => modal.close()}>
        {intl.get("hzero.common.button.close").d("关闭")}
      </Button>
    )],
    onOk: async () => {
      const unitInfo = unitInfoFun();
      if (!await newDs.current!.validate()) return false;
      if (
        newDs.current!.get("widget.fieldWidget") === "UPLOAD" &&
        // 仅检测发生过变化且非空的场景，为空场景交给必输检验
        newDs.current!.getField("widget.bucketName")!.isDirty() &&
        !!newDs.current!.get("widget.bucketName") &&
        await Modal.confirm({
          title: intl.get("hzero.common.message.confirm.title").d("提示"),
          children: intl.get("hpfm.customize.help.bucketName.confirmChange").d("您已修改桶名，请确认是否为您所需。该配置生效后将无法被修改，且已经保存过的文件将无法被访问")
        }) !== "ok"
      ) return false;
      let fieldData = newDs.current!.toJSONData();
      if (isSeachBarType && (!fieldData.whereOptions || fieldData.whereOptions.length === 0)) {
        return false;
      }
      fieldData = transformRequestFieldData(fieldData, isSeachBarType);
      const { field, fieldCode, fieldCodeAlias } = fieldData;
      if (!createMode) {
        fieldData.configId = (unitInfo.config || {}).id;
      } else {
        delete fieldData.configId;
      }
      newDs.current!.status = RecordStatus.update;
      const { conditionData } = innerDataRef;
      // 兼容旧逻辑，后端接口至少要一个field.fieldCode
      fieldData.field = { ...field, fieldCode };
      fieldData.fieldCodeAlias = fieldCodeAlias || fieldCode;
      // fx保存时需判断lines是否为空，为空则过滤掉，若是默认值fx还需判断valids是否为空
      const conditionHeaders = conditionData ? Object.values(conditionData).filter((i: any) => !!i && !isEmpty(i) && i.lines && i.lines.length && (i.conType !== 'defaultValue' || (i.valids && i.valids.length))) : undefined;
      const success = await saveFieldUrl({
        ...fieldData,
        widget: {
          ...fieldData.widget,
          linkTitle: fieldData.linkTitle,
          placeholder: fieldData.placeholder,
        },
        linkTitle: undefined,
        placeholder: undefined,
        conditionHeaders,
        fieldAlias: fieldData.fieldCodeAlias,
        unitId: unitInfo.id,
      }).then(res => {
        if (res !== "cancel" && getResponse(res)) {
          notification.success(undefined as any);
          callback();
          return true;
        }
        return false;
      });
      return success;
    },
  });
}


/**
 * 无业务场景的dataSet，只是用来管理部分独立组件的配置
 */
function utilDataSetConfig({BoRelationId}): DataSetProps {
  return {
    autoCreate: true,
    fields: [
      {
        name: "selectBOField",
        label: intl.get("hpfm.customize.common.addField").d("添加字段"),
        type: FieldType.object,
        lovCode: "HMDE.BO_FIELD.BY.RELATION_ID",
        dynamicProps: {
          lovPara: () => {
            return {
              businessObjectRelationId: BoRelationId(),
              tenantId: getCurrentOrganizationId(),
            };
          },
        },
      },
    ],
  };
}

function getUtilsFunction(modalDs, options) {
  const { unitType } = options.unitInfoFun();

  function widgetOptionsFilter(r) {
    switch (unitType) {
      case 'SECTION': return ["SECTION", "FORM", "GRID"].includes(r.get("value"));
      case 'SEARCHBAR': return FilterComponentList.includes(r.get("value"));
      default: return !["SECTION", "FORM", "GRID"].includes(r.get("value"));
    }
  }

  function whereOptionsFilter(r) {
    const {
      "widget.fieldWidget": fieldWidget,
      "widget.multipleFlag": multipleFlag,
    } = modalDs.current!.get(["widget.fieldWidget", "widget.multipleFlag"]);
    const value = r.get('value');
    if (['NOTNULL', 'ISNULL'].includes(value)) {
      return true;
    }
    if (fieldWidget === 'DATE_PICKER') {
      return [...FIX_DATE_RANGES, '=', '<>', '>', '<', '>=', '<=', 'NOTNULL', 'ISNULL'].includes(value);
    } else if (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget)) {
      return Number(multipleFlag) === 1 ? value === 'IN' : ['=', '>', '>=', '<', '<=', '<>'].includes(value);
    } else if (['LOV', 'SELECT'].includes(fieldWidget)) {
      return Number(multipleFlag) === 1 ? ['IN', 'NOT IN'].includes(value) : ['=', '<>', '~IN', '~NOT IN'].includes(value);
    } else {
      return ['=', '<>', 'L_LIKE', 'R_LIKE', 'LIKE', 'NOT LIKE'].includes(value);
    }
  }

  function sortedFlagFilter(r) {
    const isStandardField = modalDs.current!.get("custType") === 'STD';
    return isStandardField || r.get('value') !== -1;
  }

  function onWidgetOptions({ record: r }, { isH0 }) {
    console.log('onWidgetOptions', isH0)
    const fieldType = modalDs.current && (modalDs.current.get("columnType") || (modalDs.current.get("businessObjectField") && modalDs.current.get("businessObjectField").componentType && modalDs.current.get("businessObjectField").componentType.toLowerCase()) || "").toLowerCase();
    const limitWidget = limitWidgetTypeByColumnType(fieldType);
    let disabled = false;
    const value = r.get('value');
    if (value === 'EMAIL_FIELD') {
      disabled = !['varchar', 'tinytext', 'text', 'mediumtext',
        'longtext', 'enum', 'set'].includes(fieldType) || isH0;
    } else if (value === 'TEL_FIELD' && ['varchar', 'tinytext', 'text', 'mediumtext', 
      'longtext', 'bigint', 'int', 'integer', 'tinyint', 'smallint', 'link_relation',
      'formula', 'phone_number'].includes(fieldType)
    ) {
      disabled = false;
    } else if (!limitWidget || !limitWidget.length || limitWidget.includes(value)) {
      disabled = false;
    } else {
      disabled = true;
    }
    return { disabled, style: disabled ? { backgroundColor: "#f7f8fa" } : undefined }
  }
  return { widgetOptionsFilter, whereOptionsFilter, sortedFlagFilter, onWidgetOptions };
}

function getModalVar(lineData, modalDs, options) {
  const { unitType, unitTag, sortedEditorFlag, sortedEnabled, id } = options.unitInfoFun();
  const unitTags = (unitTag || '').split(",");
  const uTag = unitType === "COMMON" && unitTags.find((t: string) => t.startsWith("AF-")) || "__no_config__";
  const uConfig = unit[uTag] || {};
  const specialConfig = getSpecialConfig(uTag);
  return {
    unitTags, unitType, id,
    innerDataRef: {} as any,
    utilDataSet: new DataSet(utilDataSetConfig({BoRelationId(){return modalDs.current!.get("modelCode");}})),
    changedFxFlag: {} as any,
    sortedEditorFlag: sortedEditorFlag || 0, sortedEnabled: sortedEnabled || 0,
    isExt: lineData.custType !== "STD",
    noModelUnit: ["SECTION", "COLLAPSE", "TABPANE", "BTNGROUP"].includes(unitType) || uConfig.noModelUnit,
    isInputUnit: ['FORM', 'FILTER', 'QUERYFORM', 'GRID', "WORKFLOW"].includes(unitType) || uConfig.isInputUnit,
    hasFx: !['FILTER', 'QUERYFORM', "SECTION", "COMMON"].includes(unitType) || uConfig.hasFx,
    isC7NTableBtn: unitTags.includes('C7N-TABLE-BTN'),
    isGroupGrid: unitTags.includes('GROUP-GRID'),
    hasHelpMessage: ['FORM', 'FILTER', 'QUERYFORM', 'GRID', 'BTNGROUP', 'SEARCHBAR', 'COLLAPSE', "WORKFLOW"].includes(unitType) || uConfig.hasHelpMessage,
    hasWidget: ["FORM", "GRID", "FILTER", "QUERYFORM", "SEARCHBAR", "WORKFLOW"].includes(unitType),
    hasWidgetConfig: ["FORM", "GRID", "FILTER", "QUERYFORM", "TABPANE", "SECTION", "COLLAPSE", "WORKFLOW"].includes(unitType) || unitType === "COMMON",
    forceVisibleWidget: ["SECTION", "BTNGROUP"].includes(unitType),
    isSeachBarType: unitType === 'SEARCHBAR',
    showWhereOptions: ["FILTER", "QUERYFORM"].includes(unitType) || uConfig.showWhereOptions,
    isC7N: unitTags.includes('C7N'),
    isH0: unitTags.includes('H0'),
    isCForm: unitTags.includes('CFORM'),
    isGrid: unitType === "GRID",
    showLabelWrapperCol: unitTags.includes('H0') && ['FORM', 'FILTER', 'QUERYFORM', "WORKFLOW"].includes(unitType),
    showHiddenNumMark: unitTags.includes('DOUBLETABS'),
    defaultActiveVisible: ['TABPANE', 'COLLAPSE'].includes(unitType),
    tabPaneShowAggregation: unitType === "TABPANE" && unitTags.includes('DOUBLETABS'),
    // 通用型单元预设配置
    commonUnitTypeConfig: uConfig,
    // UI特性配置项
    specialConfig,
    // UI特性的唯一性检验配置
    specialDisabledConfig: options.uniqueUiFeatureMap,
    coverData: uConfig.coverData || {},
  };
}
export type ModalContext = {
  modalDs: DataSet,
  modalVar: ReturnType<typeof getModalVar>,
  utilsFunction: ReturnType<typeof getUtilsFunction>,
  impl: {
    ParamsConfigImpl, ComputeRuleImpl,
  },
  createMode: number,
  updateMode: number,
  options: {
    dsStatus, subModalCommonParams, unitInfoFun, callback, isTemplate
  }
  originData,
};

function checkRequiredFieldVsisible({ record, conditionHeaders }) {
  const { fieldRequired, visible } = record.get(['fieldRequired', 'visible']);
  const conditionRequired = conditionHeaders && conditionHeaders.some(i => i.conType === "required");
  const required = fieldRequired === '1' || conditionRequired;
  if (required && ['-1', '0'].includes(visible)) {
    notification.warning({
      message: intl.get("hpfm.customize.help.required.confirmChange").d('当前字段已配置必输，建议”显示“配置设置为”是“'),
    });
    return false;
  }
}