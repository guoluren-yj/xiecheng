import React, { useState, useEffect, memo } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { fetchChangeFields } from '@/services/orderCancel';

export function ChangeFieldsComponent(Comp) {
  return memo(function (props) {
    const [changeFields, setChangeFields] = useState();
    // 行可修改字段查询
    const fetchChangeField = async () => {
      const subStr = (str) => {
        const re = /_(\w)/g;
        return str.replace(re, ($0, $1) => {
          return $1.toUpperCase();
        });
      };
      const res = await fetchChangeFields();
      if (res && !res.failed) {
        const canChangeFields = res.filter((item) => item.canModifyFlag === 1);
        const changeField = canChangeFields.map((item) => {
          const { fieldName = '', tableName = '' } = item;
          if (tableName === 'SODR_PO_HEADER' && fieldName === 'remark') {
            return 'headerRemark';
          } else if (tableName === 'SODR_PO_LINE' && fieldName === 'attachment_uuid') {
            return 'lineAttachmentUuid';
          } else {
            return subStr(item.fieldName);
          }
        });
        setChangeFields([...changeField]);
      }
    };
    useEffect(() => {
      fetchChangeField();
    }, []);

    if (changeFields) {
      return <Comp {...props} changeFields={changeFields} />;
    }
    return <Spin />;
  });
}
