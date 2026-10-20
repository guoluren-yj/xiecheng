/*
 * MobilePhone - 国别码手机号
 * @Date: 2022-07-01 13:22:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { Form, Row, Select, TextField } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import styles from './index.less';

const MobilePhone = ({ record, fieldCode, editable }) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    record.setState('fieldRef', fieldRef);
    record.dataSet.addEventListener('validate', handleValidate);
    return () => {
      record.dataSet.removeEventListener('validate', handleValidate);
    };
  }, [record]);

  const handleValidate = useCallback(
    (props) => {
      const { valid, noLocate, errors } = props;
      if (!valid && !noLocate) {
        if (!isEmpty(errors)) {
          // 获取当前校验行信息
          const currentValidateInfo = errors.find((item) => {
            const { record: cRecord } = item;
            return cRecord.id === record.id;
          });
          if (!isEmpty(currentValidateInfo)) {
            const { errors: validateErrors, record: validateRecord } = currentValidateInfo;
            if (!isEmpty(validateErrors)) {
              // 查找需校验的字段
              const errorField = validateErrors.find((item) => {
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

  const phoneValue = record.get(fieldCode);
  const renderText = phoneValue ? `${record.get('internationalTelCode') || ''} ${phoneValue}` : '';
  console.log(record.getField(fieldCode).get('readOnly'));

  return editable ? (
    <Form record={record} className={styles['sprm-line-form']}>
      <Row>
        <Select
          clearButton={false}
          name="internationalTelCode"
          style={{ width: '55%', height: 26 }}
          showValidation="tooltip"
          disabled={record.getField(fieldCode).get('readOnly')}
        />
        <TextField
          name={fieldCode}
          restrict="a-zA-Z0-9-_"
          showValidation="tooltip"
          disabled={record.getField(fieldCode).get('readOnly')}
          style={{ width: '45%', height: 26, marginLeft: '-0.01rem' }}
          ref={fieldRef}
        />
      </Row>
    </Form>
  ) : (
    renderText
  );
};

export default MobilePhone;
