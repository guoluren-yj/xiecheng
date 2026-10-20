import React from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';
import { Tooltip, Icon } from 'choerodon-ui';
import { SelectBox, Modal, Button as C7nButton, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import BootomInfoImg from '@/assets/MallHomeConfig/bottomInfo.png';
import BootomInfoImgCode from '@/assets/MallHomeConfig/bottomInfoAndQrCode.png';
import EditBottomInfo from './EditBottomInfo/index.js';

const { Option } = SelectBox;

function BootomInfoConfig(props) {
  const {
    dispatch,
    mallHomeConfig: { bottomEnable, bottomType },
  } = props;

  const openCatalog = () => {
    Modal.open({
      title: intl.get('small.mallHomeConfig.view.edit.bootomInfo').d('编辑底部信息栏'),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { padding: 0 },
      okText: intl.get('small.common.button.save').d('保存'),
      children: <EditBottomInfo />,
    });
  };

  function handleRadioChange(value) {
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        bottomType: value,
      },
    });
  }

  return (
    <>
      <div>
        <div className="p-style" style={{ marginTop: 8 }}>
          {intl.get('small.common.model.edit.tab.info').d('可配置与企业相关的跳转链接或服务')}
        </div>
        <CheckBox
          style={{ margin: '16px 0' }}
          defaultChecked={bottomEnable}
          onChange={value => {
            dispatch({
              type: 'mallHomeConfig/updateState',
              payload: {
                bottomEnable: Number(value),
              },
            });
          }}
        >
          {intl.get('small.common.model.isornoEnabledFlag').d('启用')}
        </CheckBox>
        {bottomEnable === 1 && (
          <>
            <div className="p-style" style={{ marginBottom: 4 }}>
              <span className='p-style-label'>
                {intl.get('small.common.view.choose.muban').d('选择模板')}
              </span>
              <span style={{ color: 'red' }}>*</span>
              <Tooltip
                title={
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <p>{intl.get('small.common.view.all.word').d('纯文字')}</p>
                      <img style={{ width: 226, height: 50, display: 'initial' }} src={BootomInfoImg} alt="" />
                    </div>
                    <div>
                      <p>{intl.get('small.common.view.word.qrCode').d('文字+二维码')}</p>
                      <img style={{ width: 226, height: 50, display: 'initial' }} src={BootomInfoImgCode} alt="" />
                    </div>
                  </div>
                }
              >
                <Icon
                  style={{
                    color: '#868D9C',
                    fontSize: 14,
                    marginTop: -2,
                    marginLeft: 4,
                  }}
                  type="help"
                />
              </Tooltip>
            </div>
            <SelectBox value={bottomType} name="bottomType" onChange={v => handleRadioChange(v)}>
              <Option value={0}>{intl.get('small.common.view.all.word').d('纯文字')}</Option>
              <Option value={1}>{intl.get('small.common.view.word.qrCode').d('文字+二维码')}</Option>
            </SelectBox>
          </>
        )}
      </div>
      {bottomEnable === 1 && (
        <div style={{ marginTop: 16 }}>
          <C7nButton
            style={{ height: 24 }}
            className="primary-color"
            icon="mode_edit"
            color="primary"
            funcType="flat"
            onClick={() => {
              openCatalog();
            }}
          >
            {intl.get('small.mallHomeConfig.view.edit.bootomInfo').d('编辑底部信息栏')}
          </C7nButton>
        </div>
      )}
    </>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(BootomInfoConfig);
