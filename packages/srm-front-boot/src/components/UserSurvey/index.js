/**
 * PrivacyPolicies.js
 * 隐私政策条款
 * @date: 2021-10-25
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useContext, useCallback, useState, useMemo } from 'react';
import { CheckBox, Modal, useDataSet, Icon, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentUser,
} from 'utils/utils';
import request from 'utils/request';
import intl from 'utils/intl';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import UserStatusContext from '../LeadLink/UserStatusContext';
import UserSurveySvg from './SurveySvg';
import SurveyBackgroundSvg from '../../assets/survey-background.svg';
import SurveyBackgroundSvg2 from '../../assets/survey-background2.svg';

const pStyle = {
  color: '#4E5769',
  fontSize: '14px',
  lineHeight: '24px',
  whiteSpace: 'pre-line',
  marginBottom: '12px',
};
const en = {
  title: '甄云SRM 2023年满意度调研问卷',
  content1: '各位新老客户，感谢您又一年的信任和陪伴！',
  content2:
    '这一年，甄云的客户都在各领域引领和创造着未来，对于甄云来说，能够在这过程中帮助大家打造更智能的供应链体系是我们的愿景，长久地陪伴并持续给大家带来价值是我们的初心。我们时刻提醒自己守护住这份愿景和初心，也很感激，在这过程中我们的员工始终坚定不移地解决问题，我们的客户始终坚定不移地包容和支持。',
  content3:
    '但我们深知，甄云的产品和服务仍有许多不足之处，所以今年，我们再一次发起用户满意度调研，期望得到大家新的反馈和建议，也期望检验我们一年来的改进工作是否切实地改善了用户的痛点。',
};
const changeZIndex = (flag) => {
  const c7nModalContainer = document.querySelector('.c7n-pro-modal-container');
  if (c7nModalContainer) {
    c7nModalContainer.style.zIndex = flag ? 1100000 : 1000;
  }
};
function UserSurvey(props) {
  const userStatus = useContext(UserStatusContext);
  const ds = useDataSet(
    () => ({
      autoCreate: true,
      fields: [{ name: 'forceFinish', type: 'boolean', defaultValue: false }],
    }),
    []
  );
  const modalInstance = useMemo(() => ({}), []);
  useEffect(() => {
    if (userStatus) {
      userStatus.then((res) => {
        const lastTenantNum = sessionStorage.getItem('surveyRead');
        if (
          res &&
          res.purchaserUserSurveyFilledCode !== undefined &&
          isTenantRoleLevel() &&
          lastTenantNum !== getCurrentUser().tenantNum
        ) {
          request(
            `/marmot/v1/${getCurrentOrganizationId()}/marmot-organization-api/INFORMATION_OPERATION_SURVEY_FETCH?userEnd=SRM-PC`
          ).then((info) => {
            if (getResponse(info)) {
              if (
                res.purchaserUserSurveyFilledCode &&
                res.purchaserUserSurveyFilledCode !== info.code
              ) {
                props.lock.promise.then(() => {
                  const openSurvey = () => {
                    Modal.open({
                      title: intl.get('srm.common.title.survey').d('问卷调查'),
                      closable: true,
                      keyboardClosable: false,
                      fullScreen: true,
                      bodyStyle: {
                        padding: '5px 24px',
                      },
                      children: (
                        <iframe
                          src={info.link}
                          title="survey"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block',
                          }}
                        />
                      ),
                      onOk: () => finishUserSurvey(res.purchaserUserSurveyFilledCode, info.code),
                      onClose: () => finishUserSurvey(res.purchaserUserSurveyFilledCode, info.code),
                      okText: intl.get('srm.common.button.survey.close').d('关闭'),
                      cancelButton: false,
                      movable: false,
                      style: {
                        width: '100%',
                      },
                    });
                  };

                  const { themeConfigVO } = getCurrentUser() || {};
                  modalInstance.current = Modal.open({
                    closeOnLocationChange: false,
                    keyboardClosable: false,
                    style: {
                      width: '600px',
                    },
                    bodyStyle: {
                      padding: '48px 24px 24px',
                      maxHeight: 'calc(100vh - 172px)',
                      backgroundImage: `url(${SurveyBackgroundSvg}), url(${SurveyBackgroundSvg2})`,
                    },
                    closable: false,
                    contentStyle: {
                      borderRadius: '8px',
                    },
                    children: (
                      <div>
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                          <UserSurveySvg
                            color={(themeConfigVO && themeConfigVO.colorCode) || '#00B8CC'}
                          />
                        </div>
                        <h2
                          style={{
                            color: '#1D2129',
                            fontWeight: 500,
                            fontSize: '24px',
                            textAlign: 'center',
                          }}
                        >
                          {intl.get('srm.common.title.survey.invitationText').d(en.title)}
                        </h2>
                        {intl.get('srm.common.title.survey.paragraph1').d('no-visible') !==
                          'no-visible' && (
                          <p style={pStyle}>
                            {intl.get('srm.common.title.survey.paragraph1').d(en.content1)}
                          </p>
                        )}
                        {intl.get('srm.common.title.survey.paragraph2').d('no-visible') !==
                          'no-visible' && (
                          <p style={pStyle}>
                            {intl.get('srm.common.title.survey.paragraph2').d(en.content2)}
                          </p>
                        )}
                        {intl.get('srm.common.title.survey.paragraph3').d('no-visible') !==
                          'no-visible' && (
                          <p style={{ ...pStyle, marginBottom: 0 }}>
                            {intl.get('srm.common.title.survey.paragraph3').d(en.content3)}
                          </p>
                        )}
                      </div>
                    ),
                    header: null,
                    footer: (
                      <div
                        style={{
                          textAlign: 'right',
                          margin: '-13px -24px -12px',
                          padding: '24px',
                          backgroundImage: `url(${SurveyBackgroundSvg}), url(${SurveyBackgroundSvg2})`,
                        }}
                      >
                        <CheckBox dataSet={ds} name="forceFinish">
                          {intl.get('srm.common.button.survey.noTip').d('不再提示')}
                        </CheckBox>
                        <Button
                          color="default"
                          onClick={() =>
                            finishUserSurvey(res.purchaserUserSurveyFilledCode, info.code)
                          }
                        >
                          {intl.get('srm.common.button.survey.refuse').d('暂不参加')}
                        </Button>
                        <Button color="primary" onClick={openSurvey}>
                          {intl.get('srm.common.button.survey.accept').d('接受邀请')}
                        </Button>
                      </div>
                    ),
                  });
                  changeZIndex(true);
                });
              }
            }
          });
        }
      });
    }
  }, [userStatus, modalInstance]);

  /**
   * 点击同意，改变用户的状态
   */
  const finishUserSurvey = useCallback(
    (originValue, newValue) => {
      sessionStorage.setItem('surveyRead', getCurrentUser().tenantNum);
      const forceFinish = ds.current.get('forceFinish');
      if (forceFinish) {
        return request(
          `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/user-status?userEnd=SRM-PC&&statusCode=purchaserUserSurveyFilledCode&fromValue=${originValue}&toValue=${newValue}`,
          {
            method: 'POST',
            body: {},
          }
        )
          .then((res) => {
            if (getResponse(res)) {
              return true;
            }
            return false;
          })
          .finally(() => {
            if (modalInstance.current) modalInstance.current.close();
            changeZIndex(false);
          });
      } else {
        if (modalInstance.current) modalInstance.current.close();
        changeZIndex(false);
      }
    },
    [ds]
  );

  return null;
}

UserSurvey.displayName = 'UserSurvey';
export default formatterCollections({ code: 'srm.common' })(UserSurvey);
// trigger-ci
