// time control DS
import intl from 'utils/intl';

const TimeControlDS = (options = {}) => {
  const { watchDSDynamicEvent = () => {} } = options;
  return {
    fields: [],
    events: {
      update: (data) => {
        watchDSDynamicEvent(data);
      },
    },
  };
};

const promptInfoDS = () => {
  return {
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.quoController.model.controller.messageDesc').d('问题列表'),
        name: 'messageDesc',
      },
      {
        label: intl.get('ssrc.quoController.model.controller.validateValue').d('对应标段'),
        name: 'validateValue',
      },
    ],
  };
};

export { TimeControlDS, promptInfoDS };
