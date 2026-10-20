/**
 * i/p 过程控制审批
 *
 * SSRC.RF_ADJUST_APPROVE
 *
 * include://pub/ssrc/new-inquiry-hall/rf-detail-controller/approval/:rfHeaderId/:sourceCategory/:adjustRecordId
 *
 * 代码来源自
 * srm-front-ssrc/src/routes/ssrc/InquiryHallNew/RFController
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { Spin } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react';

import { Header } from 'components/Page';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';

import { fetchConfigSheet, controllerQuery } from '@/services/inquiryHallNewService';

import { idValidations } from '@/routes/components/Widget/dataVerification';
import styles from '../rfComponents/common.less';

import RFPPageWrapper from './RFPPageWrapper';
import RFIPageWrapper from './RFIPageWrapper';

// import style from './index.less';

const Page = (props) => {
  const {
    match: {
      path,
      params: { rfHeaderId, sourceCategory, adjustRecordId },
    },
  } = props;

  // 是否是审批页面
  const approvalPage = useMemo(() => {
    return path && path.includes('/approval/');
  }, [path]);

  const organizationId = getCurrentOrganizationId();

  const currentContentRef = useRef(null);

  const [header, setHeader] = useState({});
  const [loading, setLoading] = useState(false);
  // 供应商360查询配置表是否是新用户
  const [sslmLifeCycleFlag, setSslmLifeCycleFlag] = useState(true);

  /**
   * unit code
   *
   * viewType string 当前还是历史
   * */
  const getCustomizeUnitCode = (type = null, viewType = 'current') => {
    if (!type || isEmpty(type) || !viewType) {
      return null;
    }

    const historyCodeType = viewType === 'history';

    const preFix = !historyCodeType
      ? `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.`
      : `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.HIS_`;

    const currentCodeMap = new Map([
      ['base', `${preFix}BASE_INFO`],
      ['orgStaff', `${preFix}ORG_STAFF`],
      ['member', `${preFix}MEMBER`],
      ['supplier', `${preFix}SUPPLIER`],
      ['stage', `${preFix}QUOTATION_STAGE`],
      ['expertGroup', `${preFix}EXPERT.GROUP`],
      ['tech', `${preFix}SCORE_INDICATES_TECH`],
      ['business', `${preFix}SCORE_INDICATES_BUSI`],
      ['indicate', `${preFix}SCORE_INDICATES`],
      ['indicateAssign', `${preFix}SCORE_INDICATES_ASSIGN`],
      ['scoreTemp', `${preFix}SCORE_TEMPLATE`],
      ['attachment', `${preFix}ATTACHMENT_INFO`],
    ]);

    const CodeDataMap = currentCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        const currentCode = CodeDataMap.get(unitCode);
        if (!currentCode) {
          return;
        }
        codeSet.add(currentCode);
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  useEffect(() => {
    fetchSslmLifeCycleConfig();
    fetchHeaderAndInitPage();

    return () => {};
  }, [path]);

  // fetchHeader
  const fetchHeaderAndInitPage = async () => {
    idValidations([rfHeaderId, adjustRecordId]);

    setLoading(true);
    let result = null;
    try {
      result = await controllerQuery({
        getCurrentOrganizationId,
        adjustRecordId,
        rfHeaderId,
        customizeUnitCode: getCustomizeUnitCode([
          'base',
          'orgStaff',
          'stage',
          'scoreTemp',
          'attachment',
        ]),
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      setHeader(result);
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 供应商360查询配置表
  const fetchSslmLifeCycleConfig = async () => {
    idValidations([rfHeaderId, adjustRecordId]);

    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'sslm_life_cycle_new_360_bk',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        setSslmLifeCycleFlag(false);
      }
    } catch (e) {
      throw e;
    }
  };

  const contentProps = {
    ...props,
    sslmLifeCycleFlag,
    sourceCategory,
    onRef: currentContentRef,
    getCustomizeUnitCode,
    header,
    getCurrentOrganizationId,
    loading,
    approvalPage,
  };

  return (
    <React.Fragment>
      <Header
        title={`${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.RFxProcessControl`)
          .d('寻源过程控制')}-${header.rfHeaderBaseInfoAdjustDTO?.rfNum || ''}`}
        backPath=""
      >
        {/* <Button icon="check" color="primary" onClick={handleSubmit}>
          {intl.get('hzero.common.button.submit').d('提交')}
        </Button> */}
      </Header>
      <div
        className={classNames(styles['rf-page-container'], {
          [styles['ssrc-rf-approval-page-wrapper']]: approvalPage,
        })}
      >
        <Spin spinning={loading}>
          {sourceCategory === 'RFP' ? (
            <RFPPageWrapper {...contentProps} />
          ) : (
            <RFIPageWrapper {...contentProps} />
          )}
        </Spin>
      </div>
    </React.Fragment>
  );
};

export default observer(Page);
