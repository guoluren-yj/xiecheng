/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { notification } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Form, Button, TextField, EmailField, Icon } from 'choerodon-ui/pro';

// import // fetchAddBusiness,
// '@/services/supplierBlacklistService';

import styles from './index.less';

const ManualEntryModal = (props) => {
  const { dataSet, onClose = () => {}, customizeForm } = props;

  const [loading, setLoading] = useState(false);
  const [showMsg, setShowMsg] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const showFields = dataSet?.current?.get('payFlag') !== 1;

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleClose = () => {
    dataSet.data = [];
    dataSet.reset();

    if (props.modal) {
      props.modal.close();
    }
  };

  // 手工录入数据
  const addBusiness = async () => {
    const isValid = await dataSet.validate();
    if (isValid) {
      setLoading(true);
      setRefresh(true);
      dataSet
        .submit()
        .then((res) => {
          setLoading(false);
          const failedList = res?.content?.[0]?.failedList;
          if (failedList?.length && !showFields) {
            notification.error({
              message: intl.get('sdat.monitorBusiness.view.message.failInsert').d('添加失败'),
              description: intl
                .get('sdat.monitorBusiness.view.message.hasUnsCodeNullCount', {
                  count: failedList.length,
                })
                .d(
                  `所添加企业中有${failedList.length}家添加失败，失败原因可能为企业名称与国家企业信用信息公示系统登记名称不一致、接口调用异常，请检查后重试。`
                ),
            });
          }
          setRefresh(true);
          if (getResponse(res)) {
            onClose();
          }
        })
        .catch(() => {
          setLoading(false);
          setRefresh(true);
        });
    }
  };

  const handleCloseMsg = () => {
    setShowMsg(false);
    setRefresh(true);
  };

  return (
    <div className={styles['manual-entry-modal']}>
      {showMsg ? (
        <div
          style={{
            display: 'flex',
            background: 'rgba(48,149,242,.1)',
            borderRadius: '2px',
            padding: '10px 20px',
            color: '#3095f2',
          }}
        >
          <div>
            <Icon type="help" />
          </div>
          <div>
            {intl
              .get('sdat.monitorBusiness.view.message.mustInputOne')
              .d(
                '请正确完整地填写真实有效的企业信息，并且企业信息中统一社会信用代码、组织机构代码、企业注册登记号、邓白氏编码至少填写一项'
              )}
          </div>
          <div>
            <Icon style={{ cursor: 'pointer' }} type="close" onClick={handleCloseMsg} />
          </div>
        </div>
      ) : null}
      <div
        className={styles['manual-entry-modal-content']}
        style={{ height: showMsg ? 'calc(100vh - 175px)' : 'calc(100vh - 100px)' }}
      >
        {customizeForm &&
          customizeForm(
            { code: 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_MANUAL_ENTRY_CREATE' },
            <Form dataSet={dataSet} labelLayout="float" columns={1}>
              <TextField name="enterpriseName" />
              <TextField name="socialCode" />
              {showFields && <TextField name="orgNo" />}
              {showFields && <TextField name="businessNo" />}
              {showFields && <TextField name="dunsNumber" />}
              <TextField name="businessStatus" />
              <TextField name="address" />
              <TextField name="website" />
              <TextField name="link" />
              <TextField name="phone" />
              <EmailField name="email" />
              <TextField name="remark" />
            </Form>
          )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '0',
          width: '100%',
          height: '60px',
          lineHeight: '60px',
          background: 'transparent',
          zIndex: 100,
          padding: '0 20px',
        }}
      >
        <Button color="primary" loading={loading} onClick={addBusiness}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button onClick={handleClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </div>
  );
};

export default withCustomize({
  unitCode: ['SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_MANUAL_ENTRY_CREATE'],
})(ManualEntryModal);
