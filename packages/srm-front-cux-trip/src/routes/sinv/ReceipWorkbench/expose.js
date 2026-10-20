import qs from 'qs';

import { Expose } from 'utils/remote';

export default new Expose({
  events: {
    beforeMultipleSearch: (eventProps) => {
      const { that: { props: { location, waitTableDs } = {} } = {} } = eventProps || {};
      const { poNum } = qs.parse(location?.search?.substr(1) || '');
      if (
        poNum &&
        waitTableDs &&
        waitTableDs.queryDataSet &&
        !waitTableDs.queryDataSet?.getState('cuxMountedFlag')
      ) {
        if (waitTableDs.queryDataSet.current) {
          waitTableDs.queryDataSet.current.set({
            allSource: poNum,
          });
        } else {
          waitTableDs.queryDataSet.create({
            allSource: poNum,
          });
        }
        waitTableDs.queryDataSet.setState('cuxMountedFlag', true);
      }
    },
  },
});
