import React, { useEffect, useState } from 'react';
import { Text, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import {
  Form,
  TextField,
  TextArea,
  Select,
  NumberField,
  Lov,
  Tooltip,
  Output,
  Switch,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { getEntityField } from '@/services/fieldMappingDefinationService';
import styles from './index.less';

function Drawer(props) {
  const {
    fieldFormDs,
    isCreate,
    templateId,
    sourceStructureCode,
    targetStructureCode,
    isReadonly,
  } = props;
  const [fieldValueType, setFieldValueType] = useState(null);
  const [triggerFieldHidden, setTriggerFieldHidden] = useState(null);
  const [lovFinalFlag, setLovFinalFlag] = useState(null);

  useEffect(() => {
    const data = fieldFormDs.current.toData();
    setFieldValueType(data.valueType);
    setTriggerFieldHidden(sourceStructureCode === targetStructureCode);
    if (data.targetField) {
      fieldFormDs.current.getField('functionLibraryLov').setLovPara('fieldName', data.targetField);
      const record = fieldFormDs.current;
      // 为了值集处理
      getEntityField({
        templateId,
        entityCode: targetStructureCode,
        target: false,
        name: data.targetField,
      }).then((res) => {
        const fiedDetail = res.content[0];
        if (fiedDetail && fiedDetail.viewCode) {
          record.set('viewCode', fiedDetail.viewCode);
          record.set('valueField', fiedDetail.valueField);
          record.set('textField', fiedDetail.textField);
          record.set('lovFinalFlag', fiedDetail.viewCode);

          const obj = {};
          obj[fiedDetail.valueField] = 9130;
          // obj[fiedDetail.textField] = '';
          record.set('finalValueLov', obj);
          setLovFinalFlag(fiedDetail.viewCode);
        }
      });
    }
    return () => {
      // 组件卸载时清除state
      setFieldValueType(null);
    };
  }, []);

  const handleChangeFunctionLibrary = (functionLibraryValue) => {
    if (functionLibraryValue) {
      const { expression, remark } = functionLibraryValue;
      const record = fieldFormDs.current;
      record.set('expression', expression);
      record.set('remark', remark);
    }
  };

  const handleChangeFieldValueType = (newValueType) => {
    setFieldValueType(newValueType);
    if (fieldFormDs.current) {
      fieldFormDs.current.set('sourceFieldLov', undefined);
    }
  };

  const handleChangeSourceData = (targetField) => {
    const record = fieldFormDs.current;
    if (targetField) {
      const { viewCode = undefined, valueField = undefined, textField = undefined } = targetField;
      fieldFormDs.current.getField('functionLibraryLov').setLovPara('fieldName', targetField.name);
      // 为了值集处理
      record.set('viewCode', viewCode);
      record.set('valueField', valueField);
      record.set('textField', textField);
      record.set('lovFinalFlag', viewCode);
      setLovFinalFlag(viewCode);
    }
  };

  const render = () => {
    if (isReadonly) {
      return (
        <Form
          dataSet={fieldFormDs}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="lineNum" />
          <Output name="targetField" />
          <Output name="targetFieldName" />
          {triggerFieldHidden && <Output name="triggerField" />}
          <Output name="valueType" />
          {fieldValueType === 'final_value' && lovFinalFlag && <Output name="finalValueLov" />}
          {fieldValueType === 'final_value' && !lovFinalFlag && <Output name="finalValue" />}
          {fieldValueType === 'source_data' && <Output name="sourceField" />}
          {fieldValueType === 'source_data' && <Output name="sourceFieldName" />}
          {fieldValueType === 'function' && <Output name="functionLibrary" />}
          {fieldValueType === 'function' && <Output name="expression" />}
          {fieldFormDs.current &&
            (fieldFormDs.current.get('uploadFlag') ||
              fieldFormDs.current.get('uploadTransformType')) && (
              <Output
                name="uploadTransformType"
                label={
                  <>
                    <Text className={styles['label-with-help']}>
                      {intl
                        .get('spfm.fieldMapDefine.model.fieldMapDefine.uploadTransformType')
                        .d('附件转单方式')}
                    </Text>
                    <Tooltip
                      title={
                        <div>
                          <div>
                            {intl
                              .get('spfm.fieldMapDefine.attachment.help.uuid')
                              .d(
                                '“引用源附件(同UUID)”表示目标单据附件字段UUID与来源单据附件UUID一致，可能会导致单据间附件篡改情况，需谨慎选择；'
                              )}
                          </div>
                          <div>
                            {intl
                              .get('spfm.fieldMapDefine.attachment.help.copy')
                              .d(
                                '“复制源附件(新UUID)”表示目标单据附件字段UUID与来源单据附件字段UUID不一致，目标单据调整附件不会影响来源单据附件字段，建议选择该方式。'
                              )}
                          </div>
                        </div>
                      }
                    >
                      <Icon type="help" style={{ verticalAlign: 'sub' }} />
                    </Tooltip>
                  </>
                }
              />
            )}
          {fieldFormDs.current &&
            (fieldFormDs.current.get('uploadFlag') ||
              fieldFormDs.current.get('uploadTransformType')) && (
              <Output
                name="useFirstLine"
                label={
                  <>
                    <Text className={styles['label-with-help']}>
                      {intl
                        .get('spfm.fieldMapDefine.model.fieldMapDefine.useFirstLine')
                        .d('取首行')}
                    </Text>
                    <Tooltip
                      title={intl
                        .get('spfm.fieldMapDefine.attachment.help.useFirstLine')
                        .d(
                          '针对来源头附件字段转目标头附件字段且单次入参只有1个头场景的性能优化，勾选后只会进行1次附件复制，所有目标行该字段值相同'
                        )}
                    >
                      <Icon type="help" style={{ verticalAlign: 'sub' }} />
                    </Tooltip>
                  </>
                }
              />
            )}
          {/* {fieldValueType === 'function' && <TextArea name="remark" />} */}
          <Output name="remark" />
        </Form>
      );
    }
    return (
      <Form dataSet={fieldFormDs} labelLayout="float">
        <NumberField name="lineNum" />
        <Lov
          name="targetFieldLov"
          disabled={!isCreate}
          onChange={(targetField) => handleChangeSourceData(targetField)}
        />
        <TextField name="targetFieldName" disabled />
        {triggerFieldHidden && <Lov name="triggerFieldLov" />}
        <Select name="valueType" onChange={(value) => handleChangeFieldValueType(value)} />
        {fieldValueType === 'final_value' && lovFinalFlag && <Lov name="finalValueLov" noCache />}
        {fieldValueType === 'final_value' && !lovFinalFlag && <TextField name="finalValue" />}
        {fieldValueType === 'source_data' && <Lov name="sourceFieldLov" />}
        {fieldValueType === 'source_data' && <TextField name="sourceFieldName" disabled />}
        {fieldValueType === 'function' && (
          <Lov name="functionLibraryLov" onChange={(value) => handleChangeFunctionLibrary(value)} />
        )}
        {fieldValueType === 'function' && <TextArea name="expression" />}
        {fieldFormDs.current &&
          (fieldFormDs.current.get('uploadFlag') ||
            fieldFormDs.current.get('uploadTransformType')) && (
            <Select
              name="uploadTransformType"
              label={
                <>
                  <Text className={styles['label-with-help']}>
                    {intl
                      .get('spfm.fieldMapDefine.model.fieldMapDefine.uploadTransformType')
                      .d('附件转单方式')}
                  </Text>
                  <Tooltip
                    title={
                      <div>
                        <div>
                          {intl
                            .get('spfm.fieldMapDefine.attachment.help.uuid')
                            .d(
                              '“引用源附件(同UUID)”表示目标单据附件字段UUID与来源单据附件UUID一致，可能会导致单据间附件篡改情况，需谨慎选择；'
                            )}
                        </div>
                        <div>
                          {intl
                            .get('spfm.fieldMapDefine.attachment.help.copy')
                            .d(
                              '“复制源附件(新UUID)”表示目标单据附件字段UUID与来源单据附件字段UUID不一致，目标单据调整附件不会影响来源单据附件字段，建议选择该方式。'
                            )}
                        </div>
                      </div>
                    }
                  >
                    <Icon type="help" style={{ verticalAlign: 'sub' }} />
                  </Tooltip>
                </>
              }
            />
          )}
        {fieldFormDs.current &&
          (fieldFormDs.current.get('uploadFlag') ||
            fieldFormDs.current.get('uploadTransformType')) && (
            <Switch
              name="useFirstLine"
              style={{ paddingTop: '6px' }}
              label={
                <>
                  <Text className={styles['label-with-help']}>
                    {intl.get('spfm.fieldMapDefine.model.fieldMapDefine.useFirstLine').d('取首行')}
                  </Text>
                  <Tooltip
                    title={intl
                      .get('spfm.fieldMapDefine.attachment.help.useFirstLine')
                      .d(
                        '针对来源头附件字段转目标头附件字段且单次入参只有1个头场景的性能优化，勾选后只会进行1次附件复制，所有目标行该字段值相同'
                      )}
                  >
                    <Icon type="help" style={{ verticalAlign: 'sub' }} />
                  </Tooltip>
                </>
              }
            />
          )}
        {/* {fieldValueType === 'function' && <TextArea name="remark" />} */}
        <TextArea name="remark" />
      </Form>
    );
  };

  return render();
}

export default observer(Drawer);
