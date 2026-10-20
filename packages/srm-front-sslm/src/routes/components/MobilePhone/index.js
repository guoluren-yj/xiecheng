/*
 * MobilePhone - 国别码手机号
 * @Date: 2022-07-01 13:22:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { Form, Row, Select, Output, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { getCurrentUser } from 'utils/utils';

import FormField from '../FormField';
import styles from './index.less';
import { formatInternationalTel } from '../utils';

const { additionInfo: { enableDesensitize } = {} } = getCurrentUser();

const MobilePhone = ({
  record,
  fieldCode,
  editable,
  componentType = 'TextField',
  showTips = false,
  toolTipText = '',
}) => {
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

  const internationalTelMeaning = record.get('internationalTelMeaning');

  const phoneValue = record.get(fieldCode);

  // 脱敏展示组件 enableDesensitize = true 脱敏
  const secretFieldFlag = componentType === 'SECRETFIELD';
  const showComponentFlag = secretFieldFlag ? enableDesensitize || editable : editable;
  // 只读
  const readOnly = secretFieldFlag ? enableDesensitize && !editable : false;

  const TelCompontent = readOnly ? Output : Select;

  return showComponentFlag ? (
    <Form record={record} className={styles['line-form']}>
      <Row>
        <TelCompontent
          clearButton={false}
          name="internationalTelCode"
          style={{ width: '50%', height: 26 }}
        />
        <Tooltip placement="top" title={toolTipText}>
          <FormField
            name={fieldCode}
            isEdit
            displayOutput={readOnly}
            componentType={componentType}
            restrict="a-zA-Z0-9-_"
            style={{ width: '50%', height: 26, marginLeft: '-0.01rem', color: showTips && 'red' }}
            ref={fieldRef}
          />
        </Tooltip>
      </Row>
    </Form>
  ) : (
    <Tooltip placement="top" title={toolTipText}>
      <span style={{ color: showTips && 'red' }}>
        {formatInternationalTel(internationalTelMeaning, phoneValue)}
      </span>
    </Tooltip>
  );
};

export default MobilePhone;
