import intl from 'utils/intl';

const TableDS = (data, isCompany) => {
  return {
    primaryKey: 'dataId',
    selection: false,
    autoQuery: false,
    cacheSelection: true,
    pageSize: 10,
    data,
    fields: [
      {
        label: isCompany
          ? intl.get('spcm.common.model.common.companyName').d('公司名称')
          : intl.get('spcm.common.model.invOrganizationName').d('库存组织名称'),
        name: 'dataName',
        type: 'string',
      },
      {
        label: isCompany
          ? intl.get('spcm.common.model.companyCode').d('公司编码')
          : intl.get('spcm.common.model.invOrganizationCode').d('库存组织编码'),
        name: 'dataCode',
        type: 'string',
      },
      {
        label: intl.get('spcm.common.model.ouType.ouCode').d('业务实体编码'),
        name: 'ouCode',
        type: 'string',
      },
      {
        name: 'ouName',
        label: intl.get('spcm.common.model.ouType.ouName').d('业务实体名称'),
        type: 'string',
      },
      {
        label: intl.get('spcm.common.model.companyCode').d('公司编码'),
        name: 'companyName',
        type: 'string',
      },
      {
        name: 'companyNum',
        label: intl.get('spcm.common.model.common.companyName').d('公司名称'),
        type: 'string',
      },
    ],
  };
};

export { TableDS };
