import intl from 'utils/intl';

const validationResultDS = () => {
  return {
    autoQuery: false,
    paging: false,
    primaryKey: 'validateKey',
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.common.view.title.pointstoNote').d('注意点'),
        name: 'message',
      },
      {
        label: intl.get('ssrc.common.relativeSectionItem').d('对应标段'),
        name: 'messageDetails',
      },
    ],
  };
};

export { validationResultDS };
