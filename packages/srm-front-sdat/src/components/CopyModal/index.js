import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Row, Col, TextField, Button } from 'choerodon-ui/pro';
import { copyDataRow } from './commonService';

export default function PrefixEditModal(props) {
  const {
    localRecord = null,
    onCreate = () => {},
    onCancel = () => {},
    requestUrl = '',
    requestField = '',
  } = props;
  const [inputVal, setInput] = useState('');
  const [tableAlias, setAlias] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localRecord) {
      setInput(localRecord?.get(requestField) ?? '');
    }
  }, [localRecord]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleInputTableAlias = (e) => {
    setAlias(e?.target?.value?.trim() ?? '');
    setAlertMsg('');
    setRefresh(true);
  };

  const handleCreate = () => {
    if (tableAlias) {
      const fieldName = requestField
        ? `${requestField.slice(0, 1).toUpperCase()}${requestField.slice(1)}`
        : '';
      const obj = localRecord?.toData() ?? {};

      setLoading(true);
      copyDataRow({
        ...obj,
        requestUrl,
        [`newTemplate${fieldName}`]: tableAlias,
      }).then((res) => {
        setLoading(false);
        if (getResponse(res)) {
          onCreate();
        } else {
          setAlertMsg(res?.message?.trim() ?? '');
        }
      });
    } else {
      setAlertMsg(intl.get('sdat.templateManage.view.title.codeMustInput').d('请输入编码'));
    }
  };

  /**
   * 取消操作
   */
  const handleClose = () => {
    onCancel();
  };

  return (
    <>
      <Row style={{ marginTop: '20px', lineHeight: '38px', height: '38px' }}>
        <Col span={6} style={{ paddingLeft: '20px' }}>
          {intl.get('sdat.templateManage.view.title.originalCode').d('原编码')}:
        </Col>
        <Col span={18}>
          <TextField style={{ width: '300px' }} value={inputVal} disabled />
        </Col>
      </Row>

      <Row style={{ marginTop: '20px', lineHeight: '38px', height: '38px' }}>
        <Col span={6} style={{ paddingLeft: '20px' }}>
          {intl.get('sdat.templateManage.view.title.').d('新编码')}:
        </Col>
        <Col span={18}>
          <TextField
            style={{ width: '300px' }}
            value={tableAlias}
            onInput={handleInputTableAlias}
          />
        </Col>
      </Row>
      <Row style={{ color: 'red' }}>
        <Col span={18} offset={6}>
          {alertMsg}
        </Col>
      </Row>

      <Row style={{ marginTop: '35px' }}>
        <Col span={18} offset={6}>
          <Button color="primary" loading={loading} onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
        </Col>
      </Row>
    </>
  );
}
