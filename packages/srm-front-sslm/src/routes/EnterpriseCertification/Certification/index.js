/*
 * Certification - 实名认证
 * @Date: 2022-06-13 11:12:49
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { head } from 'lodash';
import { Modal, DataSet, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';

import { queryRealNameAttestation } from '@/services/enterpriseCertificationService';
import Result from './Result';
import styles from '../index.less';
import ManualReview from './ManualReview';
import PhoneVerification from './PhoneVerification';
import ValidationSteps from '../components/ValidationSteps';
import ValidationMethod from '../components/ValidationMethod';
import { certificationMethod } from '../utils';
import { certificationDS } from '../stores/getCertificationDS';

const Index = ({ location, history, stepsObj = {} }) => {
  const [attestationInfo, setAttestationInfo] = useState({});
  const [spinning, setSpinning] = useState(false);
  const [attestationStatus, setAttestationStatus] = useState(null);
  const checkMethod = certificationMethod();

  useEffect(() => {
    queryAttestationInfo();
  }, []);

  // 查询认证信息
  const queryAttestationInfo = useCallback(() => {
    setSpinning(true);
    queryRealNameAttestation()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setAttestationInfo(res);
          setAttestationStatus(res.attestationStatus);
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  const getChildren = useCallback((key, dataSet) => {
    switch (key) {
      case 'ID':
        return <PhoneVerification dataSet={dataSet} />;
      default:
        return <ManualReview dataSet={dataSet} />;
    }
  }, []);

  // "开始认证"回调
  const handleCertification = useCallback(
    key => {
      const dataSet = new DataSet(certificationDS(key));
      dataSet.create(attestationInfo);
      const currentCheckMethod = head(checkMethod.filter(item => item.key === key)) || {};
      Modal.open({
        key: Modal.key(),
        border: false,
        okFirst: true,
        style: { width: 420 },
        bodyStyle: { padding: '5px 24px 24px' },
        okText: currentCheckMethod.okText,
        title: currentCheckMethod.title,
        children: getChildren(key, dataSet),
        okProps: {
          disabled: key === 'ID',
        },
        onOk: async () => {
          let closeFlag = false;
          if (key === 'ID') {
            const validateFlag = await dataSet.validate();
            const { authCode } = dataSet.current?.toJSONData() || {};
            if (validateFlag) {
              if (authCode) {
                closeFlag = await dataSet.submit();
              } else {
                notification.warning({
                  message: intl
                    .get('sslm.common.view.messgae.pleaseEnterVerifyCode')
                    .d('请输入验证码'),
                });
              }
            }
          } else {
            const validateFlag = await dataSet.validate();
            // 校验个人注册身份证附件
            const currentRecord = dataSet?.current;
            const idFrontField = dataSet.getField('idFrontUuid', currentRecord);
            const idFrontValidateFlag = await idFrontField.checkValidity(currentRecord);
            const idBackField = dataSet.getField('idBackUuid', currentRecord);
            const idBackValidateFlag = await idBackField.checkValidity(currentRecord);

            if (validateFlag) {
              closeFlag = await dataSet.submit();
            } else if (!idFrontValidateFlag || !idBackValidateFlag) {
              notification.error({
                message: intl
                  .get('spfm.enterpriseCertification.view.message.uploadIdAttachment')
                  .d('请上传身份证件'),
              });
            }
          }
          if (closeFlag) {
            history.push({
              pathname: '/sslm/enterprise-certification/certification-result',
            });
          }
          return closeFlag;
        },
      });
    },
    [attestationInfo]
  );

  const ContentComponent = (
    <Fragment>
      <Header
        title={intl
          .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
          .d('企业认证')}
      />
      <ValidationSteps location={location} stepsObj={stepsObj} />
      <Content wrapperClassName={styles['certification-wrap']}>
        <Spin spinning={spinning}>
          <div className={styles['certification-title']}>
            {intl
              .get('spfm.supplierRegister.view.title.certificationTips')
              .d('实名认证（任选一种方式）')}
          </div>
          <div className={styles['certification-relname-wrap']}>
            {checkMethod.map(method => (
              <ValidationMethod method={method} onHandleClick={handleCertification} />
            ))}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );

  return attestationStatus && attestationStatus !== 'NEW' ? (
    <Result
      history={history}
      location={location}
      stepsObj={stepsObj}
      changeParentState={setAttestationStatus}
    />
  ) : (
    ContentComponent
  );
};

export default Index;
