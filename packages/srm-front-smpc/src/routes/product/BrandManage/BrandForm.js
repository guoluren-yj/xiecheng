import React from 'react';
import { Icon, Form, Output, Button, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import './index.less';

export default function (props) {
  const { dataSet, imgModal } = props;
  const renderLogo = ({ record, value }) => {
    return (
      <div>
        <Button
          style={{ marginBottom: '10px' }}
          onClick={() => {
            if (imgModal && typeof imgModal.toggle === 'function') imgModal.toggle();
          }}
        >
          <Icon type="insert_drive_file" />
          {intl.get('smpc.product.button.chooseFile').d('选择文件')}
        </Button>
        {value && (
          <p className="logo-url">
            <img src={value} alt="" />
            <Icon type="close" className="icon" onClick={() => record.set('logoUrl', null)} />
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="brand-manage-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <TextField name="brandNameZh" />
        <TextField name="brandNameEn" />
        <TextField name="officialUrl" />
        <TextField name="serverPhone" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={95}>
        <Output
          name="logoUrl"
          renderer={renderLogo}
          help={intl
            .get('smpc.brandManage.model.uploadIconSize')
            .d('上传格式：*.png;*.jpeg;*jpg;*tif;*tiff，上传大小：160x90px')}
        />
      </Form>
    </div>
  );
}
