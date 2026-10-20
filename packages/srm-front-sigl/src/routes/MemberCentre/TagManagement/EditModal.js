/**
 * 会员标签管理 - 新建或编辑标签
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { TextField, Form, TextArea } from 'choerodon-ui/pro';

const EditModal = observer((props) => {
  const { dataSet } = props;

  useEffect(() => {
    return () => {
      dataSet.queryParameter = {};
    };
  }, []);

  const handleInputRemarks = (e) => {
    if (dataSet.current) {
      dataSet.current.set('remarks', e.target.value);
    }
  };

  return (
    <>
      <Form labelLayout="float" dataSet={dataSet} columns={1}>
        <TextField name="labelCode" disabled={dataSet.current?.get('labelId')} />
        <TextField name="labelName" />
        <TextArea
          name="remarks"
          resize="vertical"
          rows={3}
          maxLength={30}
          label={intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注')}
          placeholder={intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注')}
          onChange={handleInputRemarks}
          value={dataSet.current ? dataSet.current.get('remarks') : ''}
        />
      </Form>
    </>
  );
});

export default EditModal;
