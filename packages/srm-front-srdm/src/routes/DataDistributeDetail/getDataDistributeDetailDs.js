import intl from 'utils/intl';

function getDataDistributeDetailDs() {
  return {
    selection: false,
    paging: false,
    autoQuery: false,
    fields: [
      {
        type: 'string',
        name: 'fieldName',
        label: intl.get('hpdm.data-distribute.model.fieldName').d('字段名'),
      },
      {
        type: 'string',
        name: 'fieldDesc',
        label: intl.get('hpdm.data-distribute.model.fieldDesc').d('字段描述'),
      },
      {
        type: 'string',
        name: 'fieldValue',
        label: intl.get('hpdm.data-distribute.model.fieldValue').d('字段值'),
      },
      {
        type: 'string',
        name: 'fieldType',
        label: intl.get('hpdm.data-distribute.model.fieldType').d('字段类型'),
      },
      {
        type: 'string',
        name: 'fieldSeq',
        label: intl.get('hpdm.data-distribute.model.fieldSeq').d('字段序号'),
      },
      {
        type: 'string',
        name: 'numFlag',
        label: intl.get('hpdm.data-distribute.model.numFlag').d('是否转换标识'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
  };
}

export default getDataDistributeDetailDs;
