/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import { Form, TextArea, Button, DataSet, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Icon } from 'hzero-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';

import { Header } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { queryAuthorizedCode, updateAuthorizedCode } from '../../services/certificatesManageService';
import styles from './index.less';

enum AUTH_STATUS {
  normal = 'normal', // 正常
  unauthorized = 'unauthorized', // 未授权
  limit = 'limit', // 过期
  warn = 'warn', // 受限
}

function CertificatesManage() {
  const [state, setState] = useState<{
    editing: boolean;
    status?: AUTH_STATUS,
  }>({
    editing: false,
    status: undefined,
  });
  const formDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'authCode',
          required: true,
          label: intl.get('hpfm.certificatesManage.view.title.authCodeConfig').d('授权码维护'),
        },
        {
          name: 'status',
          label: intl.get('hpfm.certificatesManage.view.title.authStatus').d('授权状态'),
        },
        {
          name: 'unique',
          label: intl.get('hpfm.certificatesManage.view.title.authNum').d('授权编号'),
        },
        {
          name: 'endTime',
          label: intl.get('hpfm.certificatesManage.view.title.validDateFrom').d('有效期至'),
        },
        {
          name: 'limitTime',
          label: intl.get('hpfm.certificatesManage.view.title.deadLine').d('系统使用截止日期'),
        },
        {
          name: 'machineCodes',
          label: intl.get('hpfm.certificatesManage.view.title.machineCode').d('机器码'),
        },
      ],
    });
  }, []);
  const fetchData = () => {
    queryAuthorizedCode().then(res => {
      if (getResponse(res)) {
        formDs.loadData([res]);
        setState(prevState => ({
          ...prevState,
          status: res.status || AUTH_STATUS.unauthorized,
        }));
      }
    });
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleSave = useCallback(async () => {
    if (!formDs.current) {
      return;
    }
    const flag = await formDs.validate();
    if (!flag) {
      return;
    }
    const authCode = formDs.current.get('authCode');
    const res = await updateAuthorizedCode({ authCode });
    if (getResponse(res)) {
      notification.success({});
      setState(prevState => ({
        ...prevState,
        editing: false,
      }));
      fetchData();
    }
  }, [formDs]);

  const handleCancle = useCallback(() => {
    formDs.reset();
    setState(prevState => ({
      ...prevState,
      editing: false,
    }));
  }, []);

  const handleUpdate = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      editing: true,
    }));
  }, []);

  const renderStatus = useCallback(({ value, record }) => {
    if (!record) {
      return null;
    }
    switch (value) {
      case AUTH_STATUS.normal: {
        return <Tag color='green'>{intl.get('hpfm.certificatesManage.view.status.effective').d('有效')}</Tag>;
      }
      case AUTH_STATUS.warn: {
        return <Tag color='red'>{intl.get('hpfm.certificatesManage.view.status.expire').d('已过期')}</Tag>;
      }
      case AUTH_STATUS.limit: {
        const machineOut = record.get('machineOut');
        if (machineOut && machineOut.graceTime <= 0) {
          return <Tag color='orange'>{intl.get('hpfm.certificatesManage.view.status.unauthorized').d('未授权')}</Tag>;
        } else {
          return <Tag color='red'>{intl.get('hpfm.certificatesManage.view.status.expire').d('已过期')}</Tag>;
        }
      }
      case AUTH_STATUS.unauthorized:
      default: {
        return <Tag color='orange'>{intl.get('hpfm.certificatesManage.view.status.unauthorized').d('未授权')}</Tag>;
      }
    }
  }, []);

  const renderValidDate = useCallback(({ record }) => {
    if (!record) {
      return;
    }
    const { startTime, endTime } = record.get(['startTime', 'endTime']);
    return `${startTime || ''} ~ ${endTime || ''}`;
  }, []);

  const tipsRender = useMemo(() => {
    switch (state.status) {
      case AUTH_STATUS.unauthorized:
        return (
          <div className={styles['orange-tips']}>
            <Icon type="exclamation-circle" />
            <span>
              {intl.get('hpfm.certificatesManage.view.title.unauthorized').d('系统使用未授权，为了不影响您的使用，请尽快获取有效授权码')}
            </span>
          </div>
        );
      case AUTH_STATUS.warn:
        return (
          <div className={styles['red-tips']}>
            <Icon type="close-circle" />
            <span>
              {intl.get('hpfm.certificatesManage.view.title.authCodeExpire').d('当前授权码已过期，为了不影响您的使用，请尽快获取有效授权码')}
            </span>
          </div>
        );
      case AUTH_STATUS.limit: {
        const machineOut = formDs.current && formDs.current.get('machineOut');
        if (machineOut && machineOut.graceTime <= 0) {
          return (
            <div className={styles['orange-tips']}>
              <Icon type="exclamation-circle" />
              <span>
                {intl.get('hpfm.certificatesManage.view.title.unauthorized').d('系统使用未授权，为了不影响您的使用，请尽快获取有效授权码')}
              </span>
            </div>
          );
        } else {
          return (
            <div className={styles['red-tips']}>
              <Icon type="close-circle" />
              <span>
                {intl.get('hpfm.certificatesManage.view.title.authCodeExpire').d('当前授权码已过期，为了不影响您的使用，请尽快获取有效授权码')}
              </span>
            </div>
          );
        }
      }
      default: return null;
    }
  }, [state.status, formDs.current]);

  return (
    <>
      <Header
        title={intl.get('hpfm.certificatesManage.view.title.systemCertificatesManage').d('系统证书管理')}
      />
      <div className={styles.content}>
        <div className={styles.card}>
          {tipsRender}

          <label className={styles['card-title']}>
            {intl.get('hpfm.certificatesManage.view.title.certificatesManage').d('证书管理')}
          </label>
          <Form
            useColon={false}
            labelLayout={state.editing ? LabelLayout.float : LabelLayout.vertical}
            dataSet={formDs}
            columns={2}
            className={classnames(styles['edit-form'], {
              'c7n-pro-vertical-form-display': !state.editing,
            })}
          >
            {state.editing ? <TextArea rows={6} name='authCode' /> : <Output name='authCode' />}
          </Form>
          <div className={styles['edit-form-btn']}>
            {state.editing ? (
              <>
                <Button
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  onClick={handleSave}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  onClick={handleCancle}
                >
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>
              </>
            ) : (
                <Button
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  onClick={handleUpdate}
                >
                  {intl.get('hpfm.certificatesManage.view.button.updateCertificate').d('证书更新')}
                </Button>
              )
            }
            <span className={styles['card-label-item']}>
              {intl.get('hpfm.certificatesManage.view.button.updateCertificateTip').d('证书更新后，10分钟左右生效')}
            </span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles['card-title']}>
            {intl.get('hpfm.certificatesManage.view.title.authInfo').d('授权信息')}
          </label>
          <Form
            useColon={false}
            labelLayout={LabelLayout.vertical}
            dataSet={formDs}
            className={classnames('c7n-pro-vertical-form-display', styles['display-form'])}
          >
            <Output name='status' renderer={renderStatus} />
            <Output name='unique' />
            <Output
              name='endTime'
              label={intl.get('hpfm.certificatesManage.view.title.validDate').d('有效期')}
              renderer={renderValidDate}
            />
            <Output name='limitTime' />
            <Output
              name='machineCodes'
              renderer={({ value }) => {
                if (!value) {
                  return null;
                }
                return value.map(item => <div key={item}>{item}</div>);
              }}
            />
          </Form>
        </div>
      </div>
    </>
  );
}

export default formatterCollections({ code: ['hpfm.certificatesManage'] })(observer(CertificatesManage));