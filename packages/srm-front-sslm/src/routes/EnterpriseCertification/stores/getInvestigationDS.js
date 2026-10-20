/*
 * @Date: 2022-06-09 14:41:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { forEach } from 'lodash';
import { queryLov } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import {
  getDataSetType,
  getOperationUrl,
  rowKeys,
  getComponentProps,
} from '@/routes/EnterpriseCertification/Investigation/utils';

const organizationId = getCurrentOrganizationId();

const handleRequired = ({ record, line }) => {
  const { requiredFlag, fieldCode } = line;
  let required = Boolean(requiredFlag);
  switch (fieldCode) {
    case 'expirationDate': {
      required = !record.get('longEffectiveFlag');
      break;
    }
    default:
      break;
  }
  return required;
};

const getLovFields = lovConfigList => {
  const lovFields = [];
  forEach(lovConfigList, lovConfig => {
    const { lovCode, fieldCode, fieldDescription } = lovConfig;
    if (lovCode) {
      queryLov({ viewCode: lovCode }).then(response => {
        const res = getResponse(response);
        if (res) {
          const { displayField, valueField } = res;
          lovFields.push(
            {
              name: `${fieldCode}Lov`,
              label: fieldDescription,
              type: 'object',
              ignore: 'always',
              valueField,
              textField: displayField,
            },
            {
              name: displayField,
              bind: `${fieldCode}Lov.${displayField}`,
            },
            {
              name: valueField,
              bind: `${fieldCode}Lov.${valueField}`,
            }
          );
        }
      });
    }
  });
  return lovFields;
};

const getDataSetFields = lines => {
  const lovConfigList = lines.filter(n => n.componentType === 'Lov');
  const lovFields = getLovFields(lovConfigList);
  console.log('lovFields', lovFields);
  const fields = lines.map(line => {
    const { componentType, lovCode, tenantId } = line;
    console.log('line', line);
    const componentProps = getComponentProps(componentType, line);
    const type = getDataSetType(componentType);
    const { parentRelationField, relationParamName } = componentProps;

    console.log('componentProps', componentProps);

    return {
      label: line.fieldDescription,
      name: line.fieldCode,
      type,
      lookupCode: line.lovCode,
      computedProps: {
        required: ({ record }) => handleRequired({ record, line }),
        lovCode: () => (type === 'object' && lovCode ? lovCode : ''),
        lookupCode: () => (type === 'string' && lovCode ? lovCode : ''),
        lovPara: ({ record }) => {
          if (parentRelationField) {
            const parentId = record.get(parentRelationField);
            return {
              [relationParamName]: parentId,
            };
          }
          return { tenantId };
        },
      },
      ...componentProps,
    };
  });
  return fields;
};

export const getInvestigationDS = config => {
  const { configName, lines = [] } = config;
  return {
    paging: false,
    autoCreate: true,
    fields: getDataSetFields(lines),
    transport: {
      read: ({ data: { queryParam = {} } = {} }) => {
        const interfaceName = getOperationUrl(configName);
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${interfaceName}`,
          method: 'GET',
          data: queryParam,
        };
      },
      destroy: ({ data }) => {
        const interfaceName = getOperationUrl(configName, 'destroy');
        const rowKey = rowKeys[configName];
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${interfaceName}`,
          method: 'DELETE',
          data: data.map(n => n[rowKey]),
        };
      },
    },
  };
};
