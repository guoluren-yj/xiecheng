import intl from 'utils/intl';

const listDs = () => {
  return {
    paging: false,
    autoQuery: false,
    // autoCreate: true,
    selection: false,
    fields: [
      {
        name: 'displayPrNum',
        label: intl.get(`sprm.common.model.common.prNum`).d('单据编号'),
      },
      {
        label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
        name: 'lineNum',
      },
      {
        name: 'errorMessage',
        label: intl.get('hzero.common.message.confirm.title').d('提示'),
      },
    ],
  };
};

export { listDs };
