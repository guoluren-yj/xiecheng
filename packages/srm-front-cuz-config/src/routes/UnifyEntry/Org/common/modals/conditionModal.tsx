/* eslint-disable no-nested-ternary */
import React, { JSXElementConstructor, createRef } from 'react';
import { Modal, TextField, Lov, Select, NumberField, DateTimePicker, TextArea, MonthPicker, DatePicker, Attachment, TelField, EmailField } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';

import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';

import ConNormalHeader from '../../../../../components/Condition/ConNormalHeader';
import ConFieldNameHeader from '../../../../../components/Condition/ConFieldNameHeader';
import ConDefaultValueHeader from '../../../../../components/Condition/ConDefaultValueHeader';
import ConAttachmentTplHeader from '../../../../../components/Condition/ConAttachmentTplHeader';
import { DefaultValuePro } from './defaultValueProModal';
import Condition from '../../../../../components/Condition';
import {
  queryRelatedUnits,
  queryTemplateRelatedUnits,
} from '../../../../../services/customizeConfigService';
import { filterFxUnitType } from "../../../../../utils/constConfig";

class ConditionImpl extends Condition {
  queryRelatedUnits() {
    return this.props.isTemplate ? this.queryDocRelatedUnits() : this.queryUnitRelatedUnits();
  }
  queryUnitRelatedUnits() {
    return queryRelatedUnits({ unitId: this.props.unitId, returnVirtual: true, filterUnitType: filterFxUnitType });
  }
  queryDocRelatedUnits() {
    return queryTemplateRelatedUnits({ ...this.props.relatedParams, returnVirtual: true, filterUnitType: filterFxUnitType });
  }
}

export default function openConditionModal(options = {} as any) {
  const {
    readOnly,
    subModalCommonParams,
    type,
    conditionData,
    updateData = () => { },
    record,
    unitInfoFun,
    isTemplate,
  } = options;
  const { unitType, id } = unitInfoFun();
  const isSeachBarType = unitType === 'SEARCHBAR';
  const { lines: lineData = [], ...headerData } = conditionData[type] || {};
  const conditionRef = createRef<any>();
  const titleMap = {
    visible: intl.get("hpfm.customize.commom.visibleFx").d("条件-显示"),
    required: intl.get("hpfm.customize.commom.requiredFx").d("条件-必输"),
    editable: intl.get("hpfm.customize.commom.editableFx").d("条件-编辑"),
    fieldName: intl.get("hpfm.customize.commom.fieldNameFx").d("条件-名称"),
    valid: intl.get("hpfm.customize.commom.conValidFx").d("条件-自定义校验"),
    defaultValue: intl.get("hpfm.customize.commom.defaultValueFx").d("条件-默认值"),
    helpMessage: intl.get("hpfm.customize.commom.helpMessageFx").d("条件-气泡提示"),
    attachment: intl.get("hpfm.customize.commom.attachmentTplFx").d("条件-附件模板"),
  };
  const titleMap2 = {
    visible: intl.get('hpfm.individual.model.config.visible').d('显示'),
    required: intl.get('hpfm.individual.model.config.required').d('必输'),
    editable: intl.get('hpfm.individual.model.config.editable').d('编辑'),
  };
  let Header = ConNormalHeader;
  let Widget: JSXElementConstructor<any> | Function = TextField;
  let headerProps: any = { headerData, title: titleMap2[type] };
  switch (type) {
    case "valid":
      Header = ConFieldNameHeader;
      headerProps.title = intl.get('hpfm.individual.view.message.title.validatorList').d('校验清单（当不满足条件时报错）');
      headerProps.errorMessageLabel = intl.get('hpfm.individual.model.config.valid.errorMessage').d('错误信息');
      headerProps.conExpressionLabel = intl.get('hpfm.individual.model.config.valid.condExpression').d('错误信息（条件不满足时报错）');
      break;
    case 'fieldName':
      Header = ConFieldNameHeader;
      headerProps.title = intl.get('hpfm.customize.common.fieldNameList').d('名称清单');
      break;
    case 'helpMessage':
      Header = ConFieldNameHeader;
      headerProps.title = intl.get('hpfm.customize.common.helpMessageList').d('气泡提示清单');
      headerProps.errorMessageLabel = intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示');
      break;
    case 'attachment':
      Header = ConAttachmentTplHeader;
      headerProps.title = intl.get('hpfm.customize.common.attachmentTpl.title').d('附件模版');
    default: ;
  }
  if (type === "defaultValue") {
    const field = record.getField("widget.defaultValue");
    const {
      proDefaultFlag, "widget.fieldWidget": fieldWidget, 'widget.multipleFlag': multipleFlag,
      "widget.dateFormat": format = DEFAULT_DATE_FORMAT, "widget.landlineNumFlag": landlineNumFlag,
      "widget.numberDecimal": precision, "widget.supplementZero": supplementZero, 
    } = record.get(["proDefaultFlag", "widget.fieldWidget", 'widget.multipleFlag',
      "widget.dateFormat", "widget.landlineNumFlag", "widget.numberDecimal", "widget.supplementZero"]);

    switch (fieldWidget) {
      case 'INPUT': Widget = TextField; break;
      case 'TEXT_AREA': Widget = TextArea; break;
      case 'CURRENCY':
      case 'INPUT_NUMBER': Widget = NumberField; break;
      case 'DATE_PICKER':
        if (/^(YYYY)?[-/]?MM$/.test(format)) Widget = MonthPicker;
        else if (/HH|mm|ss|hh/.test(format)) Widget = DateTimePicker;
        else Widget = DatePicker;
        break;
      case 'SELECT':
      case 'RADIOGROUP':
      case 'SWITCH':
      case 'CHECKBOX': Widget = Select; break;
      case 'LOV': Widget = Lov; break;
      case 'TEL_FIELD': Widget = TelField; break;
      case 'EMAIL_FIELD': Widget = EmailField; break;
      default: ;
    }
    if (proDefaultFlag) {
      Widget = (({ record: r }) => <DefaultValuePro record={r} unitId={id} defaultExpTemplateParams={{ ...subModalCommonParams, isTemplate, readOnly }} fieldWidget={fieldWidget} />) as any;
    }
    headerProps = {
      ...headerProps,
      lovCode: field.get("lovCode"),
      lookupCode: field.get("lookupCode"),
      multiple: field.get("multiple"),
      lovPara: field.get("lovPara") || record.get('lovPara'),
      disabled: field.get("disabled"),
      valueField: field.get("valueField"),
      valueFieldType: (record.get("lovInfo") || {}).valueFieldType,
      displayField: field.get("textField"),
      range: isSeachBarType && ['INPUT_NUMBER', 'DATE_PICKER'].includes(fieldWidget) && Number(multipleFlag) === 1,
      format,
      fieldWidget,
      Widget,
      proDefaultFlag,
      landlineNumFlag,
      regionField: field.get("regionField"),
      precision,
      padDecimalZeros: supplementZero === 1,
    };
    Header = ConDefaultValueHeader;
  }
  Modal.open({
    title: titleMap[type],
    key: Modal.key(),
    style: {
      width: '965px',
    },
    maskClosable: false,
    className: "modal-max-height",
    children: (
      <ConditionImpl
        readOnly={readOnly}
        lineData={lineData}
        Header={Header}
        headerProps={headerProps}
        unitType={unitType}
        unitId={id}
        ctxParams={record.dataSet.getState("contextParams")}
        type={type}
        relatedParams={subModalCommonParams}
        ref={conditionRef}
        isTemplate={isTemplate}
      />
    ),
    footer: (ok, cancel) => [cancel, readOnly ? null : ok],
    onOk: async () => {
      const data = await conditionRef.current!.getData();
      if (!data) return false;
      const { lineData: l, headerData: h } = data;
      updateData({
        ...conditionData,
        [type]: {
          ...h,
          conType: type,
          lines: l,
        },
      }, type);
    },
  });
}