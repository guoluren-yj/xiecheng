import React, { useMemo, useRef, useImperativeHandle, useEffect } from 'react';
import classNames from 'classnames';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { hocIndex } from './entranceHoc';
import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';
import BasicInfo from './CardMessage/BasicInfo';
import InquiryScope from './CardMessage/InquiryScope';
import RuleSetting from './CardMessage/RuleSetting';
import Purchasing from './CardMessage/Purchasing';
import AttachmentInfo from './CardMessage/AttachmentInfo';

import {
  basicFormDS,
  inquiryScopeDS,
  consultationDS,
  sourcingTeamDS,
  expertDS,
  scoreDS,
  // evaluationDS,
  expertModalDS,
  attachmentDS,
} from './storeDS';

// import style from './index.less';

const PageContentWrapper = (props) => {
  const {
    customizeForm,
    customizeTable,
    customizeCollapseForm,
    onRef,
    // match,
    match: {
      path,
      params: { rfHeaderId, sourceCategory, adjustRecordId },
    },
    getCustomizeUnitCode,
    viewType,
    header,
    approvalPage,
  } = props;

  // 基本信息
  const basicFormDs = useMemo(() => new DataSet(basicFormDS()), [path]);

  // 供应商
  const inquiryScopeDs = useMemo(
    () =>
      new DataSet(
        inquiryScopeDS({
          adjustRecordId,
          customizeUnitCode: getCustomizeUnitCode('supplier', viewType),
        })
      ),
    [path]
  );

  // 征询时间
  const consultationDs = useMemo(
    () =>
      new DataSet(
        consultationDS({
          rfHeaderId,
          adjustRecordId,
          customizeUnitCode: getCustomizeUnitCode(['scoreTemp', 'stage'], viewType),
        })
      ),
    [path]
  );

  // 寻源小组
  const sourcingTeamDs = useMemo(
    () =>
      new DataSet(
        sourcingTeamDS({
          adjustRecordId,
          customizeUnitCode: getCustomizeUnitCode('member', viewType),
        })
      ),
    [path]
  );

  // 专家
  const expertDs = useMemo(
    () =>
      new DataSet(
        expertDS({
          consultationDs,
          adjustRecordId,
          customizeUnitCode: getCustomizeUnitCode('expertGroup', viewType),
        })
      ),
    [consultationDs, path]
  );

  const techIndicateDs = useMemo(
    () =>
      new DataSet(
        scoreDS({
          expertCategory: 'TECHNOLOGY',
          consultationDs,
          adjustRecordId,
          rfHeaderId,
          customizeUnitCode: getCustomizeUnitCode('tech', viewType),
        })
      ),
    [consultationDs, path]
  );

  const businessIndicateDs = useMemo(
    () =>
      new DataSet(
        scoreDS({
          expertCategory: 'BUSINESS',
          consultationDs,
          adjustRecordId,
          rfHeaderId,
          customizeUnitCode: getCustomizeUnitCode('business', viewType),
        })
      ),
    [consultationDs, path]
  );

  const noneIndicateDs = useMemo(
    () =>
      new DataSet(
        scoreDS({
          expertCategory: 'BUSINESS_TECHNOLOGY',
          consultationDs,
          adjustRecordId,
          customizeUnitCode: getCustomizeUnitCode('indicate', viewType),
        })
      ),
    [consultationDs, path]
  );

  const expertModalDs = useMemo(
    () =>
      new DataSet(
        expertModalDS({
          customizeUnitCode: getCustomizeUnitCode('indicateAssign', viewType),
        })
      ),
    [path]
  );

  const attachmentDs = useMemo(() => new DataSet(attachmentDS()), [path]);

  const ruleSettingRef = useRef(null);

  const attachmentHiddenFlag = attachmentDs?.current?.get?.('hiddenFlag');

  // 总查询
  const fetchQuery = async (res = {}) => {
    // const res = await basicQuery(header);

    const { rfHeaderBaseInfoAdjustDTO, adjustRecordId: currentAdjustRecordId, rfConfRuleAdjustDTO } = res || {};

    if (!currentAdjustRecordId) {
      return;
    }

    // basicFormDs.create(rfHeaderBaseInfoAdjustDTO || {}, 0);
    // consultationDs.create(res?.rfConfRuleAdjustDTO, 0);

    basicFormDs.loadData([ rfHeaderBaseInfoAdjustDTO || {} ]);
    consultationDs.loadData([ rfConfRuleAdjustDTO || {} ]);

    // 刷新后重新初始化信息
    if (ruleSettingRef?.current?.initDSFields) {
      ruleSettingRef.current.initDSFields(res?.rfConfRuleAdjustDTO);
    }
    attachmentDs.create(res?.rfAttachmentAdjustDTO || {});

    const sourceTeam = sourcingTeamDs.query();

    const fetchList = [sourceTeam];
    if (res) {
      if (rfHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE') {
        fetchList.push(inquiryScopeDs.query());
      }
      // expertScoreFlag判断专家&评分要素显隐逻辑
      if (res?.rfConfRuleAdjustDTO?.expertScoreFlag) {
        fetchList.push(expertDs.query());
        if (consultationDs?.current?.get('bidRuleType') === 'DIFF') {
          fetchList.push(businessIndicateDs.query());
          fetchList.push(techIndicateDs.query());
        } else {
          fetchList.push(noneIndicateDs.query());
        }
      }
    }

    await Promise.all(fetchList);
  };

  useEffect(() => {
    fetchQuery(header);
  }, [header, header.adjustRecordId, path]);

  useImperativeHandle(
    onRef,
    () => ({
      fetchQuery,
    }),
    [onRef?.current, header, path]
  );

  const commonProps = {
    ...props,
    header,
    basicFormDs,
    customizeForm,
    customizeTable,
    customizeCollapseForm,
    rfHeaderId,
    sourceCategory,
    adjustRecordId,
    expertModalDs,
    getCustomizeUnitCode,
    inquiryScopeDs,
    consultationDs,
    expertDs,
    noneIndicateDs,
    businessIndicateDs,
    techIndicateDs,
  };

  const basicFormProps = {
    ...commonProps,
  };

  const PurchasingProps = {
    ...commonProps,
    sourcingTeamDs,
  };

  const ruleSettingProps = {
    ref: ruleSettingRef,
    ...commonProps,
  };
  const inquiryScoreProps = {
    ...commonProps,
  };

  const attachmentProps = {
    attachmentDs,
    ...commonProps,
  };

  return (
    <React.Fragment>
      <div
        className={classNames('rf-page-content-warp', styles['rf-page-content'], {
          [styles['ssrc-rf-approval-page-content']]: approvalPage, // approval
        })}
        style={{ height: '100%' }}
      >
        <div className={styles['rf-card-content-wrapper']}>
          <Card
            title={intl.get(`ssrc.inquiryHall.view.message.tab.baseInfos`).d('基本信息')}
            component={<BasicInfo {...basicFormProps} />}
          />
          <Card
            title={intl
              .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
              .d('采购组织及人员')}
            component={<Purchasing {...PurchasingProps} />}
          />
          {header?.rfHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE' && (
            <Card
              title={intl.get(`ssrc.rfController.model.inquiry.scope`).d('征询范围')}
              component={<InquiryScope {...inquiryScoreProps} />}
            />
          )}
          <Card
            title={intl.get(`ssrc.rfController.model.rule.setting`).d('规则设置')}
            component={<RuleSetting {...ruleSettingProps} />}
          />
          {!attachmentHiddenFlag && (
            <Card
              title={intl.get('ssrc.common.model.common.attachment').d('附件')}
              component={<AttachmentInfo {...attachmentProps} />}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const Update = hocIndex(PageContentWrapper, { sourceCategory: 'RFP' });

export { PageContentWrapper, hocIndex };

export default Update;
