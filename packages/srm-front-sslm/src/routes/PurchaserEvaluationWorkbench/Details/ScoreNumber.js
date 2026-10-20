/*
 * ScoreNumber - 带提示的分数输入框
 * @Date: 2023-04-23
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { Form, NumberField, Tooltip, Icon, Row } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';

const ScoreNumber = ({ record, fieldCode, editable = false }) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    record.setState('fieldRef', fieldRef);
    record.dataSet.addEventListener('validate', handleValidate);
    return () => {
      record.dataSet.removeEventListener('validate', handleValidate);
    };
  }, [record]);

  const handleValidate = useCallback(
    props => {
      const { valid, noLocate, errors } = props;
      if (!valid && !noLocate) {
        if (!isEmpty(errors)) {
          // 获取当前校验行信息
          const currentValidateInfo = errors.find(item => {
            const { record: cRecord } = item;
            return cRecord.id === record.id;
          });
          if (!isEmpty(currentValidateInfo)) {
            const { errors: validateErrors, record: validateRecord } = currentValidateInfo;
            if (!isEmpty(validateErrors)) {
              // 查找需校验的字段
              const errorField = validateErrors.find(item => {
                const { field: { name } = {} } = item || {};
                return name === fieldCode;
              });
              if (!isEmpty(errorField)) {
                const currentValidateRef = validateRecord.getState('fieldRef');
                if (currentValidateRef && currentValidateRef.current) {
                  const focusTimer = setTimeout(() => {
                    if (focusTimer) {
                      clearTimeout(focusTimer);
                    }
                    if (currentValidateRef.current.focus) {
                      currentValidateRef.current.focus();
                    }
                  }, 0);
                }
              }
            }
          }
        }
      }
    },
    [record]
  );

  const value = record.get(fieldCode);
  const kpiEvalTplIndRemind = record.get('kpiEvalTplIndRemind');
  const { remindDesc } = kpiEvalTplIndRemind || {};
  const showIcon = !isNil(value) && !isEmpty(kpiEvalTplIndRemind);

  return editable ? (
    <Form record={record}>
      <Row>
        <Tooltip title={isEmpty(kpiEvalTplIndRemind) ? '' : remindDesc}>
          <NumberField
            name={fieldCode}
            style={{ width: '90px', height: 28, marginBottom: '10px' }}
            ref={fieldRef}
          />
          {showIcon && (
            <Icon style={{ margin: '0 5px 10px', color: '#F05434', fontSize: 14 }} type="error" />
          )}
        </Tooltip>
      </Row>
    </Form>
  ) : (
    <Tooltip title={isEmpty(kpiEvalTplIndRemind) ? '' : remindDesc}>
      <span>{value}</span>
      {showIcon && (
        <Icon style={{ margin: '0 5px 5px', color: '#F05434', fontSize: 14 }} type="error" />
      )}
    </Tooltip>
  );
};

export default ScoreNumber;
