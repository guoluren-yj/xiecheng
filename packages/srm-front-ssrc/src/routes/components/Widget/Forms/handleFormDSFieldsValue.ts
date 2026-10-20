// 获取表单中字段值

import { DataSet } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';

import { FieldNullAndUndefined } from '@/routes/components/Widget/Types';

interface FuncProps {
  ds: DataSet,
};

function handleFormDSFieldsValue(props: FuncProps) {
  const { ds } = props;
  const { current, fields } = ds || {};
  const data: object = {};
  const dsAllFields = fields.toJS(); // ds all fields

  for (const [index] of dsAllFields) {
    const dsCurrentFiels: FieldNullAndUndefined = ds.getField(index);
    if (!dsCurrentFiels) {
      return;
    }

    const { type, name } = dsCurrentFiels;
    const currentFieldValue = current?.get(name);
    const isValueExist = !isNil(currentFieldValue);

    const lovValueFlag: boolean = type === 'object' && isValueExist && !isEmpty(currentFieldValue);
    if (lovValueFlag) {
      const currentTextField = dsCurrentFiels.get('textField');
      const currentValueField = dsCurrentFiels.get('valueField');

      const standardFields = ['expandCompany', 'expandInvOrganization']; // 批量多选字段：暂且处理 【拓展公司】、【拓展库存组织】
      const lovValue = currentFieldValue[currentValueField];
      const lovText = currentFieldValue[currentTextField];
      const lovMultipleFieldsFlag = dsCurrentFiels.get('multiple') && standardFields && !isNil(dsCurrentFiels);
      const lovAnyValueExistFlag = !isNil(lovValue) || !isNil(lovText);
      if (lovMultipleFieldsFlag) {
        data[name] = (currentFieldValue || []).map(i => ({
          [currentValueField]: i[currentValueField],
          [currentTextField]: i[currentTextField],
        }));
      } else if (lovAnyValueExistFlag) {
        data[name] = {
          ...currentFieldValue,
          [currentValueField]: lovValue,
          [currentTextField]: lovText,
        };
      }
    }

    if (type !== 'object' && isValueExist) {
      data[name] = currentFieldValue;
    }
  }

  return data;
};

export { handleFormDSFieldsValue };
