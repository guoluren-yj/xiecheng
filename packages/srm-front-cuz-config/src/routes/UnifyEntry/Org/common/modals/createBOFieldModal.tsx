/* eslint-disable no-nested-ternary */
import React, { createRef, useImperativeHandle, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, Select, Form, TextField, DataSet, Lov, NumberField, Switch, IntlField, SelectBox, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import boDataSetConfig from './boDataSetConfig';

export default function createBOFieldModal({ record }, callback) {
  const dsRef = createRef<DataSet>();
  const ModalChildrenComponent = formatterCollections({ code: ['hpfm.individual', 'hpfm.customize', 'hmde.domainOwnBOList', 'hmde.bo', 'hmde.common'] })(BusinessObjectFieldCreate);
  Modal.open({
    title: intl.get("hpfm.customize.common.addExtField").d("新建扩展字段"),
    style: {
      width: '750px',
    },
    drawerOffset: 150,
    maskClosable: false,
    drawer: true,
    children: (
      <ModalChildrenComponent record={record} dsRef={dsRef}/>
    ),
    onOk: async () => {
      const dataSet = dsRef.current;
      if (!dataSet) return false;
      if (!await dataSet.validate()) return false;
      const data = dataSet.current!.toJSONData();
      switch (data.componentType) {
        case "SWITCH":
          if (data.meaningConfig !== "selfConfig") break;
          data.trueMeaning = { zh_CN: "是", en_US: "Yes" };
          data.falseMeaning = { zh_CN: "否", en_US: "No" };
          break;
        default: ;
      }
      if (callback) callback(undefined, data);
      return true;
    },
  });
}
const { Option } = SelectBox;
const BusinessObjectFieldCreate = observer<{ record, dsRef }>(({ record, dsRef }) => {
  const dataSet = useMemo(() => new DataSet(boDataSetConfig(record)), [record]);
  useImperativeHandle(dsRef, () => dataSet, [dataSet, dsRef]);
  const { componentType, optionSettings } = dataSet.current!.get(["componentType", "optionSettings"]);
  const hasMaxLength = ["TEXT_FIELD", "TEXT_AREA", "PHONE_NUMBER", "EMAIL", "SINGLE_SELECT", "MULTIPLE_SELECT"].includes(componentType);
  const hasMaxOrMinValue = ["NUMBER_FIELD", "FLOAT", "PERCENTAGE", "MONEY"].includes(componentType);
  const hasDigitalAccuracy = ["FLOAT", "PERCENTAGE", "MONEY"].includes(componentType);
  const hasFormat = ["DATE_SELECTION_BOX", "DATETIME_SELECTION_BOX"].includes(componentType);
  const hasOptionSettings = ["SINGLE_SELECT", "MULTIPLE_SELECT", "RADIO", "CHECKBOX", "SWITCH"].includes(componentType);
  const hasOptionDirection = ["RADIO", "CHECKBOX"].includes(componentType);
  const hasValueList = optionSettings === "_valueList" && ["SINGLE_SELECT", "MULTIPLE_SELECT", "RADIO", "CHECKBOX", "NUMBER_FIELD", "SWITCH"].includes(componentType);
  const hasMultipleFlag = ["APPENDIX"].includes(componentType);
  const componentConfig: any[] = [
    hasMaxLength && <NumberField name="maxLength" colSpan={2} newLine />,
    hasMaxOrMinValue && <NumberField colSpan={2} name="maxValue" newLine />,
    hasMaxOrMinValue && <NumberField colSpan={2} name="minValue" />,
    hasDigitalAccuracy && <NumberField colSpan={2} name="digitalAccuracy" newLine />,
    hasFormat && (
      <Select
        colSpan={2}
        name="format"
        newLine
        label={(
          <>
          {componentType === 'DATE_SELECTION_BOX' ?
            intl.get('hmde.bo.model.dateFormat').d('日期格式') : intl.get('hmde.bo.model.dateTimeFormat').d('日期时间格式')}
          <Tooltip
             title={
              componentType === 'DATE_SELECTION_BOX' ?
                intl.get('hmde.bo.model.dateFormat.tooltip').d('日期格式仅影响导出数据日期的展示格式，不限制导入数据的日期格式维护，导入数据的日期格式必须为 2018-09-30 形式')
                : intl.get('hmde.bo.model.dateTimeFormat.tooltip').d('日期时间格式仅影响导出数据日期时间的展示格式，不限制导入数据的日期时间格式维护，导入数据的日期时间格式必须为 2018-09-30 23:59:59 形式')
            }
          >
            <Icon type='help' style={{ fontSize: '14px', verticalAlign: 'text-bottom' }} />
          </Tooltip>
          </>
        )}
        optionsFilter={obj => {
          if (componentType === 'DATE_SELECTION_BOX') {
            return !obj.get('value').includes('mm:ss');
          } else {
            return obj.get('value').includes('mm:ss');
          }
        }}
      />
    ),
    componentType === "DATETIME_SELECTION_BOX" && (
      <Switch colSpan={2} name="timeZoneConvertFlag" />
    ),
    hasOptionSettings && (
      <SelectBox name="optionSettings" newLine colSpan={2}>
        <Option value="_custom">
          {intl.get('hmde.bo.field.optionSettings.custom').d('自定义')}
        </Option>
        <Option value="_valueList">
          {intl.get('hmde.bo.field.optionSettings.valueList').d('值集')}
        </Option>
      </SelectBox>
    ),
    hasOptionDirection && (
      <SelectBox
        name="optionDirection"
        colSpan={2}
      >
        <Option value="horizontal">
          {intl.get('hmde.bo.field.optionDirection.horizontal').d('横向排列')}
        </Option>
        <Option value="vertical">
          {intl.get('hmde.bo.field.optionDirection.vertical').d('纵向排列')}
        </Option>
      </SelectBox>
    ),
    hasValueList && <Lov colSpan={2} name="valueList" newLine />,
    hasMultipleFlag && <SelectBox name="multipleFlag" newLine />,
  ];
  switch (componentType) {
    case "APPENDIX":
      const optionsFilter = (record) => {
        const fileTypes = dataSet.current?.get('fileTypes');
        if (fileTypes && fileTypes.length) {
          return fileTypes.includes(record.get('parentValue'));
        }
        return false;
      };
      componentConfig.push(
        <Select name="fileTypes" newLine />,
        <Select name="fileFormats" colSpan={4} searchable maxTagCount={100} optionsFilter={optionsFilter} />,
        <NumberField name="maxFileSize" addonAfter="MB" step={0.1} />
      );
      break;
    default: ;
  }
  // 表单布局，两个字段为一行，每个字段占2/5
  return (
    <>
      <div className='with-prefix-title lower-blue'>{intl.get('hmde.bo.field.componentType').d('字段类型')}</div>
      <Form dataSet={dataSet} labelLayout={LabelLayout.float} columns={5}>
        <Select colSpan={2} name="componentType" />
        <TextField colSpan={2} name="inheritSourceType" />
      </Form>
      <div className='with-prefix-title lower-blue has-margin-top'>{intl.get('hmde.bo.field.props').d('字段属性')}</div>
      <Form dataSet={dataSet} labelLayout={LabelLayout.float} columns={5}>
        <IntlField colSpan={2} name="inheritFieldName" />
        <Lov colSpan={2} name="businessObjectField" />
        <TextField colSpan={2} newLine name="inheritFieldCode" />
        <IntlField newLine colSpan={4} name="helpText" />
        <IntlField newLine colSpan={4} name="remark" />
        {componentConfig.filter(Boolean)}
        <Switch newLine colSpan={2} name="requiredFlag" disabled={componentType === "SWITCH"} />
        <Switch colSpan={2} name="exportableFlag" />
      </Form>
    </>
  );
});