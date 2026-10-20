// 在这里使用配置表区分新供应商组件
import React, { useEffect, useMemo } from 'react';
import { Lov } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import useRuleConfig from '@/hooks/useRuleConfig';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

// dataSet必传
export default function SupplierHocLov(props) {
  const { name, dataSet, oldLovFieldsProps = [], onChange = (e) => e, ...editorProps } = props;

  const [supplierLovConfig] = useRuleConfig({
    code: 'supplierLov',
    defaultValue: [],
  });

  const isNewSupplierLov = useMemo(() => isEmpty(supplierLovConfig), [supplierLovConfig]);

  useEffect(() => {
    const lovField = dataSet.getField(name);
    if (lovField) lovField.set('lovCode', 'SSLM.SUPPLIER');
    if (!isNewSupplierLov) {
      updateFieldProps(dataSet);
    }
  }, [isNewSupplierLov]);

  // 更新ds fieldProps,将新的换成旧的
  function updateFieldProps(fieldRef) {
    // 设置fieldProps
    oldLovFieldsProps.forEach((field) => {
      const { name: fieldName, ...otherProps } = field;
      const dsField = fieldRef.getField(fieldName);
      if (dsField) {
        Object.keys(otherProps).forEach((fieldPropKey) => {
          dsField.set(fieldPropKey, otherProps[fieldPropKey]);
        });
      } else {
        fieldRef.addField(fieldName, otherProps);
      }
    });
  }

  // 供应商组件field
  return !isNewSupplierLov ? (
    <Lov name={name} {...editorProps} onChange={onChange} />
  ) : (
    <SupplierLov
      name={name}
      dataSet={dataSet}
      {...editorProps}
      queryData={{ srmFlag: 1 }}
      onClear={() => {
        onChange(null);
      }}
      modalProps={{
        onOk: () => {
          if (dataSet?.current) {
            onChange(dataSet.current.get(name));
          }
        },
      }}
    />
  );
}
