/**
 * EditModelForm
 * @date: 2021-05-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect } from 'react';
import {
  Form,
  TextField,
  DataSet,
  Select,
  TextArea,
  Lov,
  Table,
  SelectBox,
  CheckBox,
} from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { searchMatcher } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { MySQLDataType, OracleDataType } from '@/routes/Modeler/ModelDesigner/utils/dataTypeChange';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import styles from './index.less';

const { Panel } = Collapse;
const { Option } = SelectBox;

interface IEditModelFormProps {
  formDs: DataSet;
  tableDs: DataSet;
  resourceUponRoleHierarchy: string;
  tenantEditable: boolean;
  modelDetail?: any;
  modelRadio?: string;
  refDataSourceType?: string;
}

interface IValueList {
  valueListCode: string;
}

interface IRuleCode {
  ruleCode: string;
}

// 模型字段数据类型可选范围
const modelDataTypeList = [
  'Boolean',
  'Byte',
  'Short',
  'Integer',
  'Long',
  'Float',
  'Double',
  'LocalDate',
  'ZonedDateTime',
  'BigDecimal',
  'String',
];

function EditModelForm(props: IEditModelFormProps) {
  // const {
  //   storeData: { modelDetail, modelRadio, refDataSourceType },
  // }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const [optionStrArr, setOptionStrArr] = useState<string[]>([]);
  const [valueListObj, setValueListObj] = useState<null | IValueList>(null);
  const [ruleCodeObj, setRuleCodeObj] = useState<null | IRuleCode>(null);
  const {
    formDs,
    tableDs,
    resourceUponRoleHierarchy,
    tenantEditable,
    modelDetail,
    modelRadio,
    refDataSourceType,
  } = props;

  useEffect(() => {
    if (formDs.current) {
      const newOptionStrArr: string[] =
        refDataSourceType !== 'Oracle'
          ? MySQLDataType(formDs.current.get('originDataType'))
          : OracleDataType(formDs.current.get('originDataType'));
      setOptionStrArr(newOptionStrArr);
    }
  }, [modelDetail.id, modelRadio]);

  /**
   * 值集lov change事件
   * @param {*} val
   */
  const valueListChange = (val: IValueList | null) => {
    // console.log('trigger valueListChange');
    // console.log(val);

    setValueListObj(val);
    setRuleCodeObj(null);
  };

  /**
   * 编码规则lov change事件
   * @param {*} val
   */
  const encodingRuleChange = (val: IRuleCode | null) => {
    setRuleCodeObj(val);
    setValueListObj(null);
    if (formDs && formDs.current && val) {
      // 选中值则置当前字段为非必输 否则还原必输
      formDs.current.set('requiredFlag', 0);
    } else if (formDs && formDs.current) {
      formDs.current.set('requiredFlag', formDs.current.get('physicalFieldRequiredFlag'));
    }
  };

  return (
    <div className={globalStyles.collapse}>
      <Collapse defaultActiveKey={['1', '2']}>
        <Panel header="字段基础信息" key="1" className={styles['edit-model-form-panel']}>
          <Form
            dataSet={formDs}
            labelLayout={LabelLayout.float}
            disabled={resourceUponRoleHierarchy === 'tenant' && tenantEditable}
          >
            <TextField name="fieldName" disabled />
            {/* <Select name="dataType" /> */}
            <Select
              name="dataType"
              searchMatcher={searchMatcher}
              optionsFilter={(optionRecord) =>
                // @ts-ignore
                modelRadio === 'apiTable' || optionStrArr.includes(optionRecord.toData().value)
              }
              disabled={
                modelRadio !== 'apiTable' &&
                (!optionStrArr ||
                  optionStrArr.length === 0 ||
                  (formDs.current &&
                    (formDs.current.get('primaryFlag') === 1 ||
                      isPresetField(formDs.current.get('fieldName'), [
                        'others',
                        ['LAST_UPDATED_BY', 'CREATED_BY', 'OBJECT_VERSION_NUMBER', 'TENANT_ID'],
                      ]) ||
                      isPresetField(formDs.current.get('fieldName'), ['redNameList']))))
              }
            >
              {modelDataTypeList.map((item) => (
                <Option value={item}>{item}</Option>
              ))}
            </Select>
            <TextField
              name="displayName"
              disabled={
                formDs.current &&
                (formDs.current.get('primaryFlag') === 1 ||
                  formDs.current.get('fieldName') === 'ID' ||
                  formDs.current.get('fieldName') === 'REDUNDANT_ID')
              }
            />
            <TextArea
              name="description"
              disabled={
                formDs.current &&
                (formDs.current.get('primaryFlag') === 1 ||
                  formDs.current.get('fieldName') === 'ID' ||
                  formDs.current.get('fieldName') === 'REDUNDANT_ID')
              }
            />
            <TextField
              name="dataSize"
              disabled={
                formDs.current &&
                (formDs.current.get('primaryFlag') === 1 ||
                  formDs.current.get('fieldName') === 'ID' ||
                  formDs.current.get('fieldName') === 'REDUNDANT_ID')
              }
            />
            <TextField name="defaultValue" disabled />
            <TextField name="regexpExpression" />
            <Lov
              onChange={valueListChange}
              name="valueList"
              disabled={
                (formDs.current &&
                  (formDs.current.get('primaryFlag') === 1 ||
                    isPresetField(formDs.current.get('fieldName'), [
                      'whoNameList',
                      'redNameList',
                      'TENANT_ID',
                    ]) ||
                    formDs.current.get('fieldName') === 'ID')) ||
                !!ruleCodeObj
              }
            />
            <Lov
              onChange={encodingRuleChange}
              name="encodingRule"
              disabled={
                (formDs.current &&
                  (formDs.current.get('primaryFlag') === 1 ||
                    isPresetField(formDs.current.get('fieldName'), [
                      'whoNameList',
                      'redNameList',
                      'TENANT_ID',
                    ]) ||
                    formDs.current.get('fieldName') === 'ID' ||
                    formDs.current.get('fieldName') === 'REDUNDANT_ID')) ||
                !!valueListObj
              }
            />
            <SelectBox
              name="requiredFlag"
              disabled={
                formDs.current &&
                (formDs.current.get('primaryFlag') === 1 ||
                  isPresetField(formDs.current.get('fieldName'), ['whoNameList', 'redNameList']) ||
                  formDs.current.get('ruleCode'))
              }
            >
              <Option value={1}>是</Option>
              <Option value={0}>否</Option>
            </SelectBox>
            {resourceUponRoleHierarchy === 'platform' && (
              <CheckBox
                name="subCanEditFlag"
                disabled={
                  isPresetField(formDs?.current?.get('fieldName'), [
                    'TENANT_ID',
                    'whoNameList',
                    'redNameList',
                  ]) ||
                  formDs?.current?.get('primaryFlag') === 1 ||
                  ['objectVersionNumber'].includes(formDs?.current?.get('fieldName'))
                }
              />
            )}
          </Form>
        </Panel>
      </Collapse>
      <Collapse defaultActiveKey={['1', '2']}>
        <Panel header="模型" key="2">
          <Table
            dataSet={tableDs}
            buttons={
              (resourceUponRoleHierarchy === 'tenant' && tenantEditable) ||
              (formDs.current &&
                (formDs.current.get('primaryFlag') === 1 ||
                  formDs.current.get('fieldName') === 'ID' ||
                  formDs.current.get('fieldName') === 'REDUNDANT_ID'))
                ? []
                : (['add', 'delete'] as any)
            }
            disabled={resourceUponRoleHierarchy === 'tenant' && tenantEditable}
          >
            <Table.Column name="targetLogicModel" editor />
            <Table.Column name="targetModelField" editor />
          </Table>
        </Panel>
      </Collapse>
    </div>
  );
}

export default EditModelForm;
