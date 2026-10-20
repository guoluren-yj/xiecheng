/* eslint-disable no-nested-ternary */
import React, { createElement, ReactElement } from 'react';
import { Modal, TextField, Lov, Select, CheckBox, NumberField, Output, DateTimePicker, TextArea, MonthPicker, DatePicker, TelField, EmailField } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import { Record } from 'choerodon-ui/dataset';
import { Badge } from 'choerodon-ui';
import DefaultExpConfig from '../../../../../components/DefaultExpConfig';
import styles from "../styles.less";

export const DefaultValuePro = observer<{ record, unitId, defaultValueFxNode?, defaultExpTemplateParams, fieldWidget?: string, multipleFlag?: boolean }>((
  { record: r, unitId, defaultValueFxNode, defaultExpTemplateParams, fieldWidget, multipleFlag }
) => {
  const defaultValue = r.get("widget.defaultValue");
  const hasValue = !!defaultValue;
  return (
    <>
      <Badge dot={hasValue}>
        {createElement("a", {
          onClick: () => openProDefaultValueModal(r, unitId, defaultExpTemplateParams, fieldWidget),
        },
          intl.get('hpfm.individual.model.config.proDefault').d('公式配置')
        )}
      </Badge>
      {defaultValueFxNode && (
        <>
          <span style={{ marginRight: '8px' }} />|
          <a style={{ marginLeft: "8px" }}>{defaultValueFxNode}</a>
        </>
      )}
    </>
  );
});

export function getDefaultValueNode(widgetType: string, record: Record, {
  unitId, defaultExpTemplateParams, defaultValueFxNode, clearDefaultValueFx, readOnly = false, isC7N = false, isH0 = false,
}): ReactElement[] {
  let Widget: any = Output;
  const widgetProps: any = {
    name: "widget.defaultValue",
    colSpan: 4,
    tableProps: { mode: "tree" },
    className: styles['default-value-output'],
    renderer: ({ record: r }) => (
      <DefaultValuePro
        record={r}
        unitId={unitId}
        defaultExpTemplateParams={defaultExpTemplateParams}
        defaultValueFxNode={defaultValueFxNode}
      />
    ),
    labelLayout: "none",
    newLine: true,
    addonAfter: defaultValueFxNode,
  };
  let seprateFx;
  if (record.get("proDefaultFlag") === 0) {
    widgetProps.renderer = undefined;
    widgetProps.labelLayout = undefined;
    const dateFormat = record.get("widget.dateFormat") || '';
    switch (widgetType) {
      case 'INPUT': Widget = TextField; break;
      case 'TEXT_AREA':
        Widget = TextArea;
        widgetProps.colSpan = 3;
        widgetProps.addonAfter = undefined;
        seprateFx = defaultValueFxNode;
        break;
      case 'CURRENCY':
      case 'INPUT_NUMBER': Widget = NumberField; break;
      case 'DATE_PICKER':
        if (/^(YYYY)?[-/]?MM$/.test(dateFormat)) Widget = MonthPicker;
        else if (/HH|mm|ss|hh/.test(dateFormat)) Widget = DateTimePicker;
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
  }
  if (readOnly) {
    Widget = Output;
    if (record.get("proDefaultFlag") === 0) {
      widgetProps.name = "__defaultValue__";
      widgetProps.label = record.getField("widget.defaultValue")!.get("label");
      widgetProps.renderer = () => (
        <div style={{ display: 'flex', alignItems: "center" }}>
          {widgetType === 'TEL_FIELD' ? (
            <Output name="widget.defaultValue" labelLayout={LabelLayout.none} renderer={({record, value}) => <>{record?.get('regionField')}|{value}</>} />
          ) :(
            <Output name="widget.defaultValue" labelLayout={LabelLayout.none} />
          )}
          {defaultValueFxNode}
        </div>
      )
    }
  }
  const defaultWidgets: ReactElement[] = [];
  if (["INPUT", "TEXT_AREA", 'CURRENCY', "INPUT_NUMBER", "DATE_PICKER", "EMAIL_FIELD"].includes(widgetType)
    ||  (!isH0 && widgetType === 'LOV')) {
    const commonProps = { name: "proDefaultFlag", colSpan: 4, newLine: true }
    defaultWidgets.push(readOnly ? <Output {...commonProps} /> : <Select {...commonProps} clearButton={false} onChange={clearDefaultValueFx} />);
    widgetProps.newLine = false;
  }
  defaultWidgets.push(<Widget {...widgetProps} />, seprateFx);
  defaultWidgets.push(readOnly ? <Output name="widget.defaultValueReplaceFlag" colSpan={4} /> :<CheckBox name="widget.defaultValueReplaceFlag" colSpan={4} />);
  return defaultWidgets;
}

export default function openProDefaultValueModal(record, unitId, defaultExpTemplateParams, widget) {
  const { readOnly, isTemplate, ...others } = defaultExpTemplateParams;
  const fieldWidget = widget || (record ? record.get('widget.fieldWidget') : undefined);
  const isLov = fieldWidget === 'LOV';
  const hiddenLeftTree = isLov;
  Modal.open({
    title: intl.get('hpfm.individual.model.config.proDefault').d('公式配置'),
    closable: true,
    movable: false,
    drawer: false,
    key: Modal.key(),
    style: { width: hiddenLeftTree ? 715 : 920 },
    bodyStyle: { padding: 0, display: "flex", flexDirection: "column", height: "calc(100vh - 2.06rem)" },
    footer: null,
    children: (
      <DefaultExpConfig
        record={record}
        ctxParams={record.dataSet.getState("contextParams")}
        unitId={unitId}
        mode="c7n"
        isTemplate={isTemplate}
        templateParams={others}
        readOnly={readOnly}
        propName="widget.defaultValue"
        fieldWidget={fieldWidget}
      />
    ),
  });
}