import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import { Modal, Button as C7nButton, SelectBox } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { connect } from 'dva';

import intl from 'utils/intl';
import catalogA from '@/assets/MallHomeConfig/catalog_A.png';
import catalogB from '@/assets/MallHomeConfig/catalog_B.png';

import Catalog from './Catalog';

const { Option } = SelectBox;

function CatalogConfig(props) {
  const {
    mallHomeConfig: { catalogType },
    dispatch,
  } = props;

  // 编辑自定义栏
  function openCatalog() {
    Modal.open({
      destroyOnClose: true,
      title: intl.get(`small.mallHomePlate.view.catalog.edit`).d('编辑目录'),
      mask: true,
      closable: true,
      style: { width: catalogType === 0 ? 742 : 1090 },
      drawer: true,
      // onOk: () => this.handleReject(status),
      // okProps: { loading: true },
      // afterClose: () => {
      //   this.rejectFormDs.reset();
      // },
      children: <Catalog />,
    });
  }

  function handleRadioChange(value) {
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        catalogType: value,
      },
    });
  }

  return (
    <div>
      <p className="p-style" style={{ marginTop: 8, marginBottom: 16 }}>
        {intl
          .get('small.mallHomeConfig.view.catalogConfig.desc')
          .d('可配置商品目录，区分纯文字目录和带图标目录')}
      </p>
      <div className="p-style" style={{ marginBottom: 4 }}>
        <span className='p-style-label'>
          {intl.get('small.common.view.choose.muban').d('选择模板')}
        </span>
        <span style={{ color: 'red' }}>*</span>
        <Tooltip
          title={
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: 20 }}>
                <p>{intl.get('small.common.view.all.word').d('纯文字')}</p>
                <img style={{ width: 36, height: 76, display: 'initial' }} src={catalogA} alt="" />
              </div>
              <div>
                <p>{intl.get('small.common.view.icon.word').d('图标+文字')}</p>
                <img style={{ width: 36, height: 76, display: 'initial' }} src={catalogB} alt="" />
              </div>
            </div>
          }
        >
          <Icon
            style={{ color: '#868D9C', fontSize: 14, marginTop: -2, marginLeft: 4 }}
            type="help"
          />
        </Tooltip>
      </div>
      <SelectBox value={catalogType} name="catalogType" onChange={v => handleRadioChange(v)}>
        <Option value={0}>{intl.get('small.common.view.all.word').d('纯文字')}</Option>
        <Option value={1}>{intl.get('small.common.view.icon.word').d('图标+文字')}</Option>
      </SelectBox>
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
          {intl.get('small.common.view.edit.catalog').d('编辑目录')}
        </C7nButton>
      </div>
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(CatalogConfig);
