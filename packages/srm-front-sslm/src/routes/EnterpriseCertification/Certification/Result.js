/*
 * Result - 实名认证结果页
 * @Date: 2022-07-15 13:30:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useCallback, useEffect, useState, useMemo } from 'react';
import { head } from 'lodash';
import { Button, Spin, DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import {
  queryRealNameAttestation,
  reAuthenticate,
  queryEnterprisesInfo,
} from '@/services/enterpriseCertificationService';
import ValidationSteps from '../components/ValidationSteps';

import styles from '../index.less';
import ManualReview from './ManualReview';
import { certificationResult, certificationMethod, ocrRecognition } from '../utils';
import ValidationResult from '../components/ValidationResult';
import { certificationDS } from '../stores/getCertificationDS';
import { getEnterprisesInfoDS } from '../stores/getAffiliatedEnterprisesDS';

const Result = ({ history, location, stepsObj = {}, changeParentState = () => {} }) => {
  const [spinning, setSpinning] = useState(false);
  const [verifyInfom, setVerifyInfo] = useState({});
  const { remark, attestationStatus, attestationType } = verifyInfom;

  const { ocrFlag, noRelieve } = stepsObj;
  // 不解绑;
  const noRelieveFlag = noRelieve === 1;

  const orcBtttonHidden = attestationStatus !== 'SUCCESS' || !ocrFlag || noRelieveFlag;

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
          const { attestationStatus: newAttestationStatus } = res;
          setVerifyInfo(res);
          // 如果在认证页面重新实名认证，需要刷新认证页面的状态，不然不能重新渲染
          changeParentState(newAttestationStatus);
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  // 重新填写
  const handleRefill = useCallback(() => {
    const dataSet = new DataSet(certificationDS(attestationType));
    dataSet.create(verifyInfom);
    const currentCheckMethod = head(checkMethod.filter(item => item.key === attestationType)) || {};
    Modal.open({
      key: Modal.key(),
      border: false,
      okFirst: true,
      style: { width: 420 },
      bodyStyle: { padding: '5px 24px 24px' },
      okText: currentCheckMethod.okText,
      title: currentCheckMethod.title,
      children: <ManualReview dataSet={dataSet} />,
      onOk: async () => {
        let closeFlag = false;
        const validateFlag = await dataSet.validate();
        if (validateFlag) {
          closeFlag = await dataSet.submit();
        }
        if (closeFlag) {
          queryAttestationInfo();
        }
        return closeFlag;
      },
    });
  }, [verifyInfom]);

  // ocr识别
  const handleOcrDiscern = () => {
    const dataSet = new DataSet(getEnterprisesInfoDS({ isOcr: true }));
    ocrRecognition({ dataSet, handleJumpDetail: handleManualEntry });
  };

  // 更换验证方式
  const changeVerificationMethod = useCallback(() => {
    setSpinning(true);
    reAuthenticate()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          queryAttestationInfo();
          history.push({
            pathname: '/sslm/enterprise-certification/certification',
          });
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  const result = useMemo(
    () =>
      head(
        certificationResult(remark, orcBtttonHidden).filter(
          item => item.status === attestationStatus
        )
      ),
    [attestationStatus]
  );

  // 手工录入
  const handleManualEntry = useCallback(() => {
    setSpinning(true);
    queryEnterprisesInfo()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { companyAttestation: { attestationStatus: newAttestationStatus } = {} } = res;
          if (newAttestationStatus && newAttestationStatus !== 'NEW') {
            history.push({
              pathname: '/sslm/enterprise-certification/affiliated-result',
            });
          } else {
            history.push({
              pathname: '/sslm/enterprise-certification/affiliated',
            });
          }
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  return (
    <Fragment>
      <Header
        title={intl
          .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
          .d('企业认证')}
      />
      <ValidationSteps location={location} stepsObj={stepsObj} />
      <Content wrapperClassName={styles['certification-wrap']}>
        <Spin spinning={spinning}>
          <div className={styles['certification-result']}>
            <div className={styles['certification-result-item']}>
              <ValidationResult result={result} />
              <div className={styles['certification-result-item-btn']}>
                <Button
                  color="primary"
                  hidden={attestationStatus !== 'REJECT'}
                  onClick={() => handleRefill(attestationType)}
                >
                  {intl.get('spfm.supplierRegister.view.btn.refill').d('重新填写')}
                </Button>
                <Button hidden={attestationStatus !== 'REJECT'} onClick={changeVerificationMethod}>
                  {intl
                    .get('spfm.supplierRegister.view.btn.replaceVerificationMethod')
                    .d('更换验证方式')}
                </Button>
                <Button
                  onClick={handleManualEntry}
                  hidden={attestationStatus !== 'SUCCESS'}
                  loading={spinning}
                >
                  {intl.get('spfm.supplierRegister.button.manualEntry').d('手工录入')}
                </Button>
                <Button
                  color="primary"
                  onClick={handleOcrDiscern}
                  hidden={orcBtttonHidden}
                  loading={spinning}
                >
                  {intl.get('spfm.supplierRegister.view.btn.automatic').d('营业执照识别')}
                </Button>
              </div>
            </div>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default Result;
