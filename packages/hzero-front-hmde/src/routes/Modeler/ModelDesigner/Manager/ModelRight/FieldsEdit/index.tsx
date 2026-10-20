import React, { useEffect, useMemo, useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Select,
  TextField,
  TextArea,
  Button,
  DataSet,
  SelectBox,
  Icon,
} from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import notification from 'utils/notification';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import Lov from '@/components/LowcodeLov';
import _store from '@/routes/Modeler/ModelDesigner/stores';
import { MySQLDataType, OracleDataType } from '@/routes/Modeler/ModelDesigner/utils/dataTypeChange';
import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { isPresetField, hasNumberType } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { modelDataTypeList } from '@/routes/Modeler/ModelDesigner/utils/config';

import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import styles from './index.less';
import FieldInformationDataSet from './store/FieldInformationDataSet';
import { IParams } from '..';
import { IModelManagerStore } from '../../../stores/index';

// eslint-disable-next-line prefer-destructuring
const Panel = Collapse.Panel;
const ReactFragment: any = React.Fragment;
const { Option } = SelectBox;

interface IValueList {
  valueListCode: string;
}

interface IRuleCode {
  ruleCode: string;
}

export default observer(({ handleMenuQueryList }: IParams) => {
  const [optionStrArr, setOptionStrArr] = useState<string[]>([]);
  const [valueListObj, setValueListObj] = useState<null | IValueList>(null);
  const [ruleCodeObj, setRuleCodeObj] = useState<null | IRuleCode>(null);
  const {
    ref: { modelDetailRef, apiDetailRef },
    storeData: {
      modelDetail,
      // apiDetail,
      fieldAttribute,
      refDataSourceType,
      modelRadio /* , modelType */,
      resourceUponRoleHierarchy,
      modelType,
    },
  }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  const perHidden = false;
  const fieldInformationDataSet = useMemo(
    () => new DataSet(FieldInformationDataSet(fieldAttribute.toData().id)),
    [modelRadio]
  );
  const fieldAttributeData = useMemo(() => fieldAttribute.toData(), [fieldAttribute]);
  // 编码规则|值集设置
  useEffect(() => {
    if (fieldAttributeData.ruleCode) {
      setRuleCodeObj({ ruleCode: fieldAttributeData.ruleCode });
    } else {
      setRuleCodeObj(null);
    }
    if (fieldAttributeData.valueListCode) {
      setValueListObj({ valueListCode: fieldAttributeData.valueListCode });
    } else {
      setValueListObj(null);
    }
  }, [modelDetail.id, fieldAttribute.id]);

  /**
   * 重置字段属性
   */
  const queryFieldEdit = (): void => {
    fieldInformationDataSet.setQueryParameter('modelRadio', modelRadio);
    fieldInformationDataSet.removeAll();
    if (fieldAttributeData) {
      fieldInformationDataSet.create(fieldAttributeData);
    }
  };
  useEffect(() => {
    queryFieldEdit();
    if (fieldInformationDataSet.current) {
      const newOptionStrArr: string[] =
        refDataSourceType !== 'Oracle'
          ? MySQLDataType(fieldInformationDataSet.current.get('originDataType'))
          : OracleDataType(fieldInformationDataSet.current.get('originDataType'));
      setOptionStrArr(newOptionStrArr);
    }
  }, [modelDetail.id, modelRadio, fieldAttribute]);
  const handleSaveFields = async () => {
    const validateValue = await fieldInformationDataSet.validate();
    if (validateValue) {
      // eslint-disable-next-line no-unused-expressions
      fieldInformationDataSet?.current?.save();
      const res = await fieldInformationDataSet.submit();
      if (res && res.success) {
        if (fieldAttribute.get('fieldType') === 'TABLE_FIELD') {
          await modelDetailRef.current.fieldInformationDataSetReset();
        } else if (fieldAttribute.get('fieldType') === 'REDUNDANT_FIELD') {
          await modelDetailRef.current.redundantTableDataSetRest();
        }
        handleMenuQueryList();
        if (modelRadio === 'modelTable' && modelDetailRef?.current) {
          modelDetailRef.current.fieldAttributeReset();
        }
        if (modelRadio === 'apiTable' && apiDetailRef?.current) {
          apiDetailRef.current.modelFieldDataSetReset();
        }
      }
      return false;
    } else {
      notification.error({ message: '错误', description: '校验未通过' });
    }
  };

  /**
   * 值集lov change事件
   * @param {*} val
   */
  const valueListChange = (val: IValueList | null) => {
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
    if (fieldInformationDataSet && fieldInformationDataSet.current && val) {
      // 选中值则置当前字段为非必输 否则还原必输
      fieldInformationDataSet.current.set('requiredFlag', 0);
    } else if (fieldInformationDataSet && fieldInformationDataSet.current) {
      fieldInformationDataSet.current.set(
        'requiredFlag',
        fieldInformationDataSet.current.get('physicalFieldRequiredFlag')
      );
    }
  };

  return (
    <div className={`${styles['global-c7n-fields']} ${styles.form}`}>
      <div className={globalStyles.collapse}>
        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel header="通用" key="1">
            <Form
              className={styles.input}
              labelLayout={'vertical' as LabelLayout}
              dataSet={fieldInformationDataSet}
              columns={1}
            >
              <TextField
                name="displayName"
                disabled={
                  perHidden ||
                  (modelRadio !== 'apiTable' &&
                    fieldInformationDataSet.current &&
                    isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                      'redNameList',
                    ]))
                }
              />
              <TextField name="fieldName" disabled={modelRadio !== 'apiTable'} />
              <TextArea
                name="description"
                disabled={
                  perHidden ||
                  (modelRadio !== 'apiTable' &&
                    fieldInformationDataSet.current &&
                    isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                      'redNameList',
                    ]))
                }
              />
            </Form>
          </Panel>
          <Panel header="类型" key="2">
            <Form
              className={styles.input}
              labelLayout={'vertical' as LabelLayout}
              dataSet={fieldInformationDataSet}
              columns={1}
            >
              <Select
                name="dataType"
                searchMatcher={searchMatcher}
                optionsFilter={(optionRecord) =>
                  // @ts-ignore
                  modelRadio === 'apiTable' || optionStrArr.includes(optionRecord.toData().value)
                }
                disabled={
                  perHidden ||
                  (modelRadio !== 'apiTable' &&
                    (!optionStrArr ||
                      optionStrArr.length === 0 ||
                      (fieldInformationDataSet.current &&
                        (fieldInformationDataSet.current.get('primaryFlag') === 1 ||
                          isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                            'others',
                            ['LAST_UPDATED_BY', 'CREATED_BY', 'OBJECT_VERSION_NUMBER', 'TENANT_ID'],
                          ]) ||
                          isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                            'redNameList',
                          ])))))
                }
              >
                {modelDataTypeList.map((item) => (
                  <Option value={item}>{item}</Option>
                ))}
              </Select>
              <SelectBox
                name="requiredFlag"
                disabled={
                  // 主键who字段不可编辑必输性
                  perHidden ||
                  (modelRadio !== 'apiTable' &&
                    fieldInformationDataSet.current &&
                    (fieldInformationDataSet.current.get('primaryFlag') === 1 ||
                      isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                        'whoNameList',
                        'redNameList',
                      ]) ||
                      fieldInformationDataSet.current.get('ruleCode')))
                }
              >
                <Option value={1}>是</Option>
                <Option value={0}>否</Option>
              </SelectBox>
              <TextField
                name="dataSize"
                restrict="0-9"
                disabled={
                  perHidden ||
                  (modelRadio !== 'apiTable' &&
                    fieldInformationDataSet.current &&
                    (fieldInformationDataSet.current.get('primaryFlag') === 1 ||
                      isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                        'whoNameList',
                        'redNameList',
                        'TENANT_ID',
                      ])))
                }
              />
            </Form>
          </Panel>
          <Panel header="值" key="3">
            <Form
              className={styles.input}
              labelLayout={'vertical' as LabelLayout}
              dataSet={fieldInformationDataSet}
              columns={1}
            >
              {modelRadio !== 'apiTable' && [
                <TextField name="defaultValue" disabled />,
                <Lov
                  onChange={valueListChange}
                  name="valueList"
                  disabled={
                    perHidden ||
                    (fieldInformationDataSet.current &&
                      (fieldInformationDataSet.current.get('primaryFlag') === 1 ||
                        isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                          'whoNameList',
                          'redNameList',
                          'TENANT_ID',
                        ]) ||
                        fieldInformationDataSet.current.get('fieldName') === 'ID')) ||
                    !!ruleCodeObj
                  }
                />,
                <Lov
                  onChange={encodingRuleChange}
                  name="encodingRule"
                  disabled={
                    perHidden ||
                    (fieldInformationDataSet.current &&
                      (fieldInformationDataSet.current.get('primaryFlag') === 1 ||
                        isPresetField(fieldInformationDataSet.current.get('fieldName'), [
                          'whoNameList',
                          'redNameList',
                          'TENANT_ID',
                        ]) ||
                        fieldInformationDataSet.current.get('fieldName') === 'ID' ||
                        fieldInformationDataSet.current.get('fieldName') === 'REDUNDANT_ID')) ||
                    !!valueListObj
                  }
                />,
              ]}
              {modelRadio === 'apiTable' && (
                <SelectBox name="primaryFlag">
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </SelectBox>
              )}
              <ReactFragment name="encryptFlag">
                <SelectBox
                  name="encryptFlag"
                  disabled={
                    perHidden ||
                    ['objectVersionNumber'].includes(
                      fieldInformationDataSet?.current?.get('fieldName')
                    ) ||
                    !hasNumberType(fieldInformationDataSet?.current?.get('dataType'))
                  }
                >
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </SelectBox>
              </ReactFragment>
            </Form>
          </Panel>
        </Collapse>
      </div>
      <div className={styles['fields-edit-button']}>
        <Button
          color={'dark' as ButtonColor}
          onClick={() => queryFieldEdit()}
          hidden={perHidden}
          disabled={
            (isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
            modelType === 'PLATFORM_SHARED'
          }
        >
          <Icon
            type="refresh"
            style={{
              marginRight: '8px',
              verticalAlign: 'sub',
            }}
          />
          重置
        </Button>
        {((isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
          modelType === 'PLATFORM_SHARED') || (
          <Button
            color={'primary' as ButtonColor}
            hidden={perHidden}
            onClick={handleSaveFields}
            style={{ float: 'right' }}
          >
            <Icon
              type="save"
              style={{
                marginRight: '8px',
                verticalAlign: 'sub',
              }}
            />
            保存
          </Button>
        )}
      </div>
    </div>
  );
});
