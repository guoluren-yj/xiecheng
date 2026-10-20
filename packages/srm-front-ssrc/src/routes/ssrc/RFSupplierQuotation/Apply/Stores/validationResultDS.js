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

const sectionBiddingPromptDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    primaryKey: 'rfxHeaderId',
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.common.sectionNum').d('标段编码'),
        name: 'sectionNum',
      },
      {
        label: intl.get('ssrc.common.sectionCode').d('标段名称'),
        name: 'sectionName',
      },
      {
        label: intl.get('ssrc.common.promptInfos').d('提示信息'),
        name: 'confirmContent',
      },
    ],
  };
};

export { validationResultDS, sectionBiddingPromptDataSet };
