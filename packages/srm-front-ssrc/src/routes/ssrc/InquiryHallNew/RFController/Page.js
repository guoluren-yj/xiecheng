/*
 * @Descripttion: 寻源过程控制--页面
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 15:21:00
 * @LastEditors: Please set LastEditors
 */
import React, { useContext, useEffect, useState, useRef } from 'react';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import classNames from 'classnames';
import { Button, Modal } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';

import {
  submit,
  controllerQuery,
  controllerSave,
  validateSubmit,
  discardRfAdjust,
  createBeforeDirectControllerRF,
  fetchConfigSheet,
} from '@/services/inquiryHallNewService';

import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';
import BasicInfo from './CardMessage/BasicInfo';
import InquiryScope from './CardMessage/InquiryScope';
import RuleSetting from './CardMessage/RuleSetting';
import Purchasing from './CardMessage/Purchasing';
import AttachmentInfo from './CardMessage/AttachmentInfo';
import Store from './store';
import style from './index.less';

const Page = (props) => {
  const {
    commonDs: {
      basicFormDs,
      consultationDs,
      inquiryScopeDs,
      buyerDs,
      sourcingTeamDs,
      expertDs,
      attachmentDs,
      businessIndicateDs,
      techIndicateDs,
      noneIndicateDs,
    },
    routerParams: { adjustRecordId, rfHeaderId },
  } = useContext(Store);
  const ruleSettingRef = useRef(null);
  const [header, setHeader] = useState({});
  const [loading, setLoading] = useState(false);
  // 供应商360查询配置表是否是新用户
  const [sslmLifeCycleFlag, setSslmLifeCycleFlag] = useState(true);
  const attachmentHiddenFlag = attachmentDs?.current?.get?.('hiddenFlag');
  useEffect(() => {
    fetchQuery();
    fetchSslmLifeCycleConfig();
  }, []);

  // 基本查询
  const basicQuery = async () => {
    try {
      const result = await controllerQuery({
        adjustRecordId,
        customizeUnitCode:
          'SSRC.INQUIRY_HALL.RF_CONTROL.BASE_INFO,SSRC.INQUIRY_HALL.RF_CONTROL.ORG_STAFF,SSRC.INQUIRY_HALL.RF_CONTROL.QUOTATION_STAGE,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_TEMPLATE,SSRC.INQUIRY_HALL.RF_CONTROL.ATTACHMENT_INFO',
      });
      const res = getResponse(result);
      if (res) {
        setHeader(res);
        basicFormDs.create(res?.rfHeaderBaseInfoAdjustDTO);
        consultationDs.create(res?.rfConfRuleAdjustDTO);
        // 刷新后重新初始化信息
        if (ruleSettingRef?.current?.initDSFields) {
          ruleSettingRef.current.initDSFields(res?.rfConfRuleAdjustDTO);
        }
        buyerDs.create(res?.rfPurchaseAdjustDTO);
        attachmentDs.create(res?.rfAttachmentAdjustDTO || {});
        // consultationDs
        //   .getField('quotationStartDate')
        //   .set('disabled', Boolean(res?.rfConfRuleAdjustDTO?.fieldPropertyDTOList[0].disabled));
        // consultationDs
        //   .getField('quotationEndDate')
        //   .set('disabled', Boolean(res?.rfConfRuleAdjustDTO?.fieldPropertyDTOList[1].disabled));
        // consultationDs
        //   .getField('quotationStartDate')
        //   .set('required', Boolean(res?.rfConfRuleAdjustDTO?.fieldPropertyDTOList[0].required));
        // consultationDs
        //   .getField('quotationEndDate')
        //   .set('required', Boolean(res?.rfConfRuleAdjustDTO?.fieldPropertyDTOList[1].required));
        return res;
      }
    } catch (e) {
      throw e;
    }
  };

  // 供应商360查询配置表
  const fetchSslmLifeCycleConfig = async () => {
    let data = null;
    if (!rfHeaderId) {
      return;
    }
    try {
      data = await fetchConfigSheet({
        configCode: 'sslm_life_cycle_new_360_bk',
        organizationId: getCurrentOrganizationId(),
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

  // 总查询
  const fetchQuery = async () => {
    // console.log('总查询')

    setLoading(true);
    const res = await basicQuery();

    const sourceTeam = sourcingTeamDs.query();

    const fetchList = [sourceTeam];
    if (res) {
      if (res?.rfHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE') {
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
    setLoading(false);
  };

  // 必输校验
  const validate = () => {
    const list = [basicFormDs.validate(), sourcingTeamDs.validate()];
    if (!attachmentHiddenFlag) {
      list.push(attachmentDs.validate());
    }
    if (header?.rfHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE') {
      list.push(inquiryScopeDs.validate());
    }
    if (consultationDs.length) {
      list.push(consultationDs.validate());
    }
    if (consultationDs?.current?.get('expertScoreFlag')) {
      list.push(expertDs.validate());
      if (consultationDs?.current?.get('bidRuleType') === 'DIFF') {
        list.push(businessIndicateDs.validate());
        list.push(techIndicateDs.validate());
      } else {
        list.push(noneIndicateDs.validate());
      }
    }
    return Promise.all(list).then((ele) => ele.every((e) => e));
  };

  // 处理评分要素数据
  const dealIndicateData = (ds, scoreCategory) => {
    const newData = ds.toData()?.map((i) => {
      const { rfIndicateAdjustId, parentRfIndicateId, ...others } = i;
      if (i.tempIndicateId) {
        return { ...others, scoreCategory };
      }
      return { ...i, scoreCategory };
    });
    return newData;
  };

  // 保存提交数据
  const getData = () => {
    const { adjustNum, sourceFrom, sourceHeaderId, tenantId } = header;
    return {
      adjustNum,
      adjustRecordId,
      sourceFrom,
      sourceHeaderId,
      tenantId,
      rfHeaderBaseInfoAdjustDTO: basicFormDs.current.toData(),
      rfConfRuleAdjustDTO: consultationDs.current.toData(),
      rfPurchaseAdjustDTO: buyerDs.current.toData(),
      rfLineSupplierAdjustInfoDTO: { rfLineSupplierAdjustList: inquiryScopeDs.toData() },
      rfMemberAdjustList: sourcingTeamDs.toData(),
      rfExpertAdjustList: expertDs.toData(),
      rfAttachmentAdjustDTO: attachmentDs.current.toData(),
      businessIndicateAdjustList: dealIndicateData(businessIndicateDs, 'BUSINESS'),
      techIndicateAdjustList: dealIndicateData(techIndicateDs, 'TECHNOLOGY'),
      noneIndicateAdjustList: dealIndicateData(noneIndicateDs, 'BUSINESS_TECHNOLOGY'),
    };
  };

  // 保存
  const handleSave = async () => {
    const params = {
      param: getData(),
      customizeUnitCode:
        'SSRC.INQUIRY_HALL.RF_CONTROL.BASE_INFO,SSRC.INQUIRY_HALL.RF_CONTROL.ORG_STAFF,SSRC.INQUIRY_HALL.RF_CONTROL.SUPPLIER,SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER,SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER,SSRC.INQUIRY_HALL.RF_CONTROL.QUOTATION_STAGE,SSRC.INQUIRY_HALL.RF_CONTROL.EXPERT.GROUP,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_TECH,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_BUSI,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_TEMPLATE,SSRC.INQUIRY_HALL.RF_CONTROL.ATTACHMENT_INFO',
    };
    const allValidate = await validate();
    if (!allValidate) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputCorrectInformation')
          .d('请正确填写信息后，再进行下一步操作'),
      });
      return;
    }
    try {
      setLoading(true);
      const res = await controllerSave(params);
      if (res && !res.failed) {
        notification.success();
        await fetchQuery();
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 删除当前寻源过程单据
  const handleDelete = () => {
    const { history } = props;
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('ssrc.quoController.view.deleteQuoController.tipMessage')
        .d('是否废弃当前寻源过程控制单据'),
      onOk: async () => {
        setLoading(true);
        discardRfAdjust({ organizationId: getCurrentOrganizationId(), adjustRecordId })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push(`/ssrc/new-inquiry-hall/list?sourceCategory=${header.sourceFrom}`);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  // 重新发起寻源过程控制
  const createCopyAgain = async () => {
    const { sourceFrom, sourceHeaderId } = header;
    const { history } = props;
    const params = {
      rfHeaderId: sourceHeaderId,
      sourceCategory: sourceFrom,
    };
    try {
      const res = await createBeforeDirectControllerRF(params);
      if (res && !res.failed) {
        history.push({
          pathname: `/ssrc/new-inquiry-hall/rf-detail-controller/${sourceHeaderId}/${sourceFrom}/${adjustRecordId}`,
        });
      } else {
        notification.warning({
          message: res.message,
        });
        return false;
      }
    } catch (e) {
      throw e;
    }
  };

  // 提交
  const handleSubmit = async () => {
    const { sourceFrom } = header;
    const { history } = props;
    const params = {
      param: getData(),
      customizeUnitCode:
        'SSRC.INQUIRY_HALL.RF_CONTROL.BASE_INFO,SSRC.INQUIRY_HALL.RF_CONTROL.ORG_STAFF,SSRC.INQUIRY_HALL.RF_CONTROL.SUPPLIER,SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER,SSRC.INQUIRY_HALL.RF_CONTROL.QUOTATION_STAGE,SSRC.INQUIRY_HALL.RF_CONTROL.EXPERT.GROUP,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_TECH,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_BUSI,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES,SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_TEMPLATE,SSRC.INQUIRY_HALL.RF_CONTROL.ATTACHMENT_INFO',
    };
    const allValidate = await validate();
    if (!allValidate) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputCorrectInformation')
          .d('请正确填写信息后，再进行下一步操作'),
      });
      return;
    }
    try {
      const res = getResponse(await validateSubmit(params));
      if (res && res?.createAdjustAgain === 1) {
        Modal.confirm({
          key: Modal.key(),
          title: intl
            .get(`ssrc.inquiryHall.view.message.title.adjustAgain`)
            .d('征询单中的部分信息已变更，是否重新发起寻源过程控制？'),
          onOk: () => createCopyAgain(),
        });
      } else if (res && res?.validateResults?.length) {
        const description = res.validateResults?.map?.((i, index) => {
          return <div>{`${index + 1}、${i.message}`}</div>;
        });
        notification.error({
          message: intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
          description,
        });
      } else if (res) {
        const result = getResponse(await submit(params));
        if (result && !result.failed) {
          notification.success();
          history.push({
            pathname: `/ssrc/new-inquiry-hall/list`,
            search: querystring.stringify({
              sourceCategory: sourceFrom,
            }),
          });
        } else if (!Array.isArray(result)) {
          fetchQuery();
        }
      }
    } catch (e) {
      throw e;
    }
  };

  const basicFormProps = {
    basicFormDs,
  };

  const ruleSettingProps = {
    header,
    consultationDs,
    ref: ruleSettingRef,
  };
  const inquiryScoreProps = {
    sslmLifeCycleFlag,
  };

  const attachmentProps = {
    header,
    attachmentDs,
  };

  return (
    <React.Fragment>
      <Spin spinning={loading} wrapperClassName={style['opening-height-wrapper']}>
        <Header
          title={`${intl
            .get(`ssrc.inquiryHall.model.inquiryHall.RFxProcessControl`)
            .d('寻源过程控制')}-${header?.rfHeaderBaseInfoAdjustDTO?.rfNum || ''}`}
          backPath={`/ssrc/new-inquiry-hall/list?sourceCategory=${header.sourceFrom}`}
        >
          <Button icon="check" color="primary" onClick={handleSubmit}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" onClick={handleSave} funcType="flat">
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="delete" onClick={handleDelete} funcType="flat">
            {intl.get('ssrc.common.button.discard').d('废弃')}
          </Button>
        </Header>
        <div className={classNames(styles['rf-page-container'])}>
          <Spin spinning={false}>
            <div
              className={classNames('rf-page-content-warp', styles['rf-page-content'])}
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
                  component={<Purchasing buyerDs={buyerDs} />}
                />
                {header?.rfHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE' && (
                  <Card
                    title={intl.get(`ssrc.rfController.model.inquiry.scope`).d('征询范围')}
                    component={<InquiryScope header={header} {...inquiryScoreProps} />}
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
                {/* <div className={styles['bottom-line']} /> */}
              </div>
            </div>
          </Spin>
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default Page;
