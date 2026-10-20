import React from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';
import { TextField, Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';

function SiglTitleConfig({ dispatch, mallHomeConfig: { personalTitle } }) {
  return (
    <div>
      <p className="p-style" style={{marginBottom: 16}}>
        {intl
          .get('small.mallHomeConfig.view.siglbuy.titledesc')
          .d('标题会应用至会员购专区LOGO图片旁边的位置')}
      </p>
      <div style={{ width: 340, marginBottom: 16 }}>
        <Form columns={1} labelLayout="float">
          <TextField
            value={personalTitle}
            onChange={(e) =>
              dispatch({
                type: 'mallHomeConfig/updateState',
                payload: {
                  personalTitle: e,
                },
              })
            }
            label={intl.get('small.mallHomeConfig.view.item.siglTitleConfig').d('会员购标题')}
          />
        </Form>
      </div>
    </div>
  );
}
export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(SiglTitleConfig);
