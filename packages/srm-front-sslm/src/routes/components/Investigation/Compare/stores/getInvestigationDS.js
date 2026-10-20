/*
 * @Date: 2022-06-09 14:41:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { forEach } from 'lodash';
import { getComponentProps } from '../../utils';

// 获取ds的fields
const getDataSetFields = lines => {
  const fields = [];
  forEach(lines, line => {
    const { fieldDescription, fieldCode, componentType } = line;
    const componentProps = getComponentProps(componentType, line);
    const { mobilephoneFlag } = componentProps;

    fields.push({
      name: fieldCode,
      label: fieldDescription,
    });

    if (mobilephoneFlag) {
      fields.push({
        name: 'internationalTelCode',
        defaultValue: '+86',
        lookupCode: 'HPFM.IDD',
      });
    }
  });
  return fields;
};

// 获取ds
export const getInvestigationDS = config => {
  const { lines = [] } = config;
  return {
    selection: false,
    paging: false,
    fields: getDataSetFields(lines),
  };
};
