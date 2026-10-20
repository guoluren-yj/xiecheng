/*
 * @Date: 2022-12-30 10:27:11
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head, concat, isEmpty } from 'lodash';
import { Button, Icon, Spin } from 'choerodon-ui/pro';
import React, { useCallback, useEffect, useState } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  fetchPrivacyPolicy,
  fetchPrivacyPolicyText,
  fetchSinglePrivacyPolicyText,
} from '@/services/commonService';

const AgreementDetail = ({
  record,
  modal,
  onAgree = () => {},
  isEdit = true,
  protocolList = [],
  showWelcomeMsg = true,
}) => {
  // 隐私协议集合
  const [agreementList, setAgreementList] = useState([]);
  // 当前展示的协议
  const [currentAgreement, setCurrentAgreement] = useState({});
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (isEmpty(protocolList)) {
      queryAgreement();
    } else {
      setAgreementList(protocolList);
      setCurrentAgreement(protocolList[0]);
    }
  }, [record]);

  // 查询隐私协议
  const queryAgreement = useCallback(async () => {
    const { companyId, tenantId } = record?.get(['companyId', 'tenantId']) || {};
    // 平台隐私协议
    const platformAgreements = [];
    const platformQueryParams = {
      partnerTenantId: 0,
      companyId: 0,
      textCode: 'SRM.SHARE.PERSONAL.INFORMATION',
    };
    // 租户隐私协议
    let tenantAgreements = [];
    const queryParams = {
      companyId,
      partnerTenantId: tenantId,
      textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
    };
    setSpinning(true);
    const config = await fetchPrivacyPolicy({ tenantId }).then(response => {
      return getResponse(response);
    });
    if (config) {
      await Promise.all([
        config.settingValue === '1' ? fetchPrivacyPolicyText(queryParams) : null,
        fetchSinglePrivacyPolicyText(platformQueryParams),
      ])
        .then(response => {
          const [tenantResponse, personalResponse] = response;
          if (getResponse(tenantResponse)) {
            tenantAgreements = tenantResponse;
          }
          if (getResponse(personalResponse)) {
            platformAgreements.push(personalResponse);
          }
        })
        .finally(() => {
          setSpinning(false);
        });
    }
    const finallyAgreements = concat(platformAgreements, tenantAgreements);
    setAgreementList(finallyAgreements);
    setCurrentAgreement(head(finallyAgreements) || {});
  }, [record]);

  // 关闭弹框
  const handleClose = useCallback(() => {
    modal.close(true);
  }, []);

  // 同意并进入下一页
  const handleAgreeAndNext = useCallback(
    currentAgreementIndex => {
      setCurrentAgreement(agreementList[currentAgreementIndex + 1] || {});
    },
    [agreementList]
  );

  // 上一页回调
  const handlePreviousPage = useCallback(
    currentAgreementIndex => {
      setCurrentAgreement(agreementList[currentAgreementIndex - 1] || {});
    },
    [agreementList]
  );

  // 同意关闭弹窗
  const handleAgreeAndCloseMoal = useCallback(() => {
    handleClose();
    onAgree();
  }, []);

  // 获取弹框按钮
  const GetButtons = () => {
    const agreementListLength = agreementList.length - 1;
    const currentAgreementIndex = agreementList.findIndex(
      n => n.textId === currentAgreement.textId
    );
    const buttons = [
      isEdit && (
        <Button onClick={handleClose}>{intl.get('hzero.common.button.cancel').d('取消')} </Button>
      ),
      currentAgreementIndex > 0 && (
        <Button onClick={() => handlePreviousPage(currentAgreementIndex)}>
          {intl.get('sslm.common.view.btn.previousPage').d('上一页')}
        </Button>
      ),
      currentAgreementIndex < agreementListLength && !isEdit && (
        <Button onClick={() => handleAgreeAndNext(currentAgreementIndex)}>
          {intl.get('sslm.common.button.nextPage').d('下一页')}
        </Button>
      ),
      currentAgreementIndex < agreementListLength && isEdit && (
        <Button color="primary" onClick={() => handleAgreeAndNext(currentAgreementIndex)}>
          {intl.get('sslm.common.button.agreeAndNext').d('同意并进入下一页')}
        </Button>
      ),
      currentAgreementIndex === agreementListLength && isEdit && (
        <Button color="primary" onClick={() => handleAgreeAndCloseMoal()}>
          {intl.get('hzero.common.button.agree').d('同意')}
        </Button>
      ),
      !isEdit && (
        <Button onClick={handleClose} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    ].filter(Boolean);
    return <div className="agreement-footer">{buttons}</div>;
  };

  return (
    <Spin spinning={spinning}>
      <div className="agreement-wrap">
        <div className="agreement-header">
          <div className="agreement-header-title">
            {currentAgreement.title}
            {isEdit && <Icon type="close" onClick={handleClose} />}
          </div>
          <div className="agreement-header-welcome">
            <div style={{ marginBottom: 8 }}>
              {intl.get('sslm.common.modal.agreement.useWelcome').d('尊敬的用户，您好：')}
            </div>
            {showWelcomeMsg && (
              <div>
                {intl
                  .get('sslm.common.modal.agreement.readAgreement')
                  .d('填写调查表前请阅读并同意以下说明')}
              </div>
            )}
          </div>
        </div>
        <div className="agreement-body">
          <div
            className="agreement-body-detail"
            dangerouslySetInnerHTML={{ __html: currentAgreement.text || '' }}
          />
        </div>
        <GetButtons />
      </div>
    </Spin>
  );
};

export default AgreementDetail;
