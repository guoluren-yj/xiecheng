import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getFieldType = (termType) => {
  let type;
  switch (termType) {
    case 'VARCAHR':
      type = 'string';
      break;
    case 'TEXT':
      type = 'string';
      break;
    case 'DECIMAL':
      type = 'number';
      break;
    case 'DATE':
      type = 'date';
      break;
    case 'DATETIME':
      type = 'dateTime';
      break;
    case 'LOV':
      type = 'string';
      break;
    default:
      type = 'string';
      break;
  }
  return type;
};

// 业务条款
const businessTermsDS = (props) => {
  const { pcHeaderId, editable, data: termsData, currentMode, mainContractId, pcTypeId } = props;
  return {
    selection: editable && 'multiple',
    paging: !editable,
    primaryKey: 'termId',
    forceValidate: true,
    data: termsData,
    fields: [
      {
        name: 'termTypeCode',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeCode`).d('业务条款编码'),
      },
      {
        name: 'termTypeName',
        type: 'object',
        required: true,
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeName`).d('业务条款名称'),
        lovCode: 'SPCM.PC_TERM_TYPE',
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return {
              pcTypeId,
              excludeTermCodes: dataSet
                ?.toData()
                ?.filter((item) => item.termTypeCode)
                .map((item) => item.termTypeCode)
                .toString(),
            };
          },
        },
        transformResponse: (value, record) => {
          if (currentMode) {
            return value;
          }
          return value
            ? {
                termTypeName: record.termTypeName,
                termTypeCode: record.termTypeCode,
              }
            : null;
        },
        transformRequest: (value) => (currentMode ? value : value?.termTypeName),
      },
      {
        name: 'termContent',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termContent`).d('业务条款内容'),
        required: true,
        dynamicProps: {
          type: ({ record }) => getFieldType(record.get('termType')),
          required: ({ record }) => record.get('nullableFlag') === 0,
          lookupCode: ({ record }) =>
            record.get('termType') === 'LOV' ? record.get('termTypeLov') : undefined,
        },
        validator: (value, _, record) => {
          if (value && value.length > 480 && record.get('termType') === 'VARCAHR') {
            return intl.get('hzero.common.validation.max', { max: 480 });
          } else if (value && value.length > 2000 && record.get('termType') === 'TEXT') {
            return intl.get('hzero.common.validation.max', { max: 2000 });
          }
          return true;
        },
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`spcm.purchaseRequisitionCreation.model.termRemark`).d('业务条款说明'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { queryParams } = data;
        if (currentMode) {
          return {
            url: `${SRM_SPCM}/v1/${organizationId}/pc-compare/compare-terms?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
            method: 'GET',
            data: {
              ...params,
              pageFlag: true,
            },
            transformResponse: (res) => {
              let retrunData = '';
              try {
                const jsonData = JSON.parse(res);
                let content;
                if (currentMode === 'current') {
                  content = jsonData?.newTerms;
                } else {
                  content = jsonData?.oldTerms;
                }
                retrunData = content;
              } catch (error) {
                retrunData = res;
              }
              return retrunData;
            },
          };
        }
        const url = editable
          ? `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/list`
          : `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/page`;
        return {
          url,
          method: 'GET',
          data: queryParams,
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/updatePcTerm`,
          method: 'POST',
          data,
          params: {
            ...params,
            pcHeaderId,
            customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS',
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-term/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (editable) {
          const { length } = dataSet;
          for (let i = 0; i < length; i++) {
            const record = dataSet.get(i);
            const { termContent, termType } = record.toJSONData();
            if (termType === 'LOV' && termContent) {
              record
                .getField('termContent')
                .fetchLookup()
                .then((list) => {
                  if (!list.find((l) => l.value === termContent)) {
                    record.set('termContent', '');
                  }
                });
            }
          }
        }
      },
      update: ({ name, record, value }) => {
        if (name === 'termTypeName') {
          const {
            termTypeCode,
            termContentDefault: termContent,
            remark,
            termType,
            termTypeLov,
            termTypeId,
            termTypeList,
            nullableFlag,
          } = value || {};
          // 先修改termType,保证字段类型正确渲染
          record.set({ termType });
          record.set({
            termTypeCode,
            termContent,
            remark,
            termTypeLov,
            termTypeId,
            termTypeList,
            nullableFlag,
          });
          if (termType === 'LOV' && termContent) {
            record
              .getField('termContent')
              .fetchLookup()
              .then((list) => {
                if (!list.find((l) => l.value === termContent)) {
                  record.set('termContent', '');
                }
              });
          }
        }
      },
    },
  };
};

export default businessTermsDS;
