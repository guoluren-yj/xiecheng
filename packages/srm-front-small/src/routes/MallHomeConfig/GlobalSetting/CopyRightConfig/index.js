import React from 'react';
import { CheckBox } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { connect } from 'dva';

import intl from 'utils/intl';

import WYSIWYGEditor from '@/routes/Components/WYSIWYGEditor';

function BootomInfoConfig(props) {
  const {
    dispatch,
    mallHomeConfig: { recordEnable, recordInformation },
  } = props;

  return (
    <div>
      <CheckBox
        defaultChecked={recordEnable}
        style={{
          margin: '8px 0 16px',
        }}
        onChange={value => {
          dispatch({
            type: 'mallHomeConfig/updateState',
            payload: {
              recordEnable: Number(value),
            },
          });
        }}
      >
        {intl.get('small.common.model.isornoEnabledFlag').d('启用')}
      </CheckBox>
      {recordEnable === 1 && (
        <div>
          <WYSIWYGEditor
            value={
              recordInformation
                ? (() => {
                    try {
                      return JSON.parse(recordInformation || '');
                    } catch {
                      return null;
                    }
                  })()
                : ''
            }
            style={{ width: '100%', height: 250 }}
            onChange={value => {
              if (value && JSON.stringify(value).length <= 150) {
                dispatch({
                  type: 'mallHomeConfig/updateState',
                  payload: {
                    recordInformation: JSON.stringify(value),
                  },
                });
              }
            }}
            saveRef={e => e}
            setValue={e => e}
            handleSave={e => e}
          />
        </div>
      )}
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(BootomInfoConfig);
