import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import { isNil } from 'lodash';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SSTA}/v1/${organizationId}`;

// 计算结果
export const progressDetailDS = ({ fields, queryFields, ruleId, executeRecordId }): DataSetProps => {
  return {
    fields,
    queryFields,
    paging: 'server',
    selection: false,
    idField: 'executeDataId',
    parentField: 'parentExecuteDataId',
    queryParameter: { ruleId, executeRecordId },
    transport: {
      read: ({ data, params }) => {
        const { parentExecuteDataId } = data;
        if(isNil(parentExecuteDataId)) {
          Object.assign(data, { parentExecuteDataId: 0 });
        } else {
          Object.assign(params, { size: 0 });
        }
        return {
          url: `${urlPrefix}/rebates-execute-data/page`,
          method: 'GET',
          transformResponse: (res) => {
            try {
              const response = JSON.parse(res);
              const { content } = response || {};
              return {
                ...response,
                content: (content || []).map(itemArr => {
                  const data = {};
                  (itemArr || []).forEach(obj => {
                    const { dimensionCode, dimensionValue } = obj || {};
                    if (dimensionCode) {
                      data[dimensionCode] = dimensionValue;
                    }
                  });
                  return data;
                }),
              };
            } catch (err) {
              return {};
            }
          },
        };
      },
    },
  };
};

export const executionDetailDS = (data): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    selection: false,
    data,
    fields: [
      {
        name: 'calculateParamCode',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.fieldCode').d('字段编码'),
      },
      {
        name: 'calculateParamName',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.fieldName').d('字段名称'),
      },
      {
        name: 'calculateFormula',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.calculationFormula').d('计算公式'),
      },
      {
        name: 'calculateProcess',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.writeLogic').d('写入逻辑'),
      },
      {
        name: 'calculateResult',
        type: FieldType.number,
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.executionResult').d('执行结果'),
      },
    ],
  };
};

export const sourceDocumentDS = (data): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    selection: false,
    data,
    fields: [
      {
        name: 'displayDocNum',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.displayDocNums').d('展示来源单据号'),
      },
      {
        name: 'displayLineNum',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.displayLineNums').d('展示来源单据行号'),
      },
      {
        name: 'docNum',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.docNums').d('来源单据号'),
      },
      {
        name: 'lineNum',
        label: intl.get('spfp.rebateOrderCaculate.model.calcExecutionDetail.lineNums').d('来源单据行号'),
      },
    ],
  };
};
