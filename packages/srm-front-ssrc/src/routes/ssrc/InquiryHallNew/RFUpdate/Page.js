import React, { Fragment, useContext, useState, useMemo, useEffect } from 'react';
import { Spin, Modal } from 'choerodon-ui/pro';
import classNames from 'classnames';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import {
  save,
  releaseUpdate,
  checkUpdate,
  cancelRelease,
  querySourceMethodConfig,
} from '@/services/rfService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText } from '@/utils/utils';
import Store from './store/index';
import BasicInfo from './CardManage/BasicInfo';
import OrganizationAndStaff from './CardManage/OrganizationAndStaff';
import RfItemLine from './CardManage/RfItemLine';
import Programme from './CardManage/Programme';
import InviteRange from './CardManage/InviteRange';
import Rule from './CardManage/Rule';
import Attachment from './CardManage/Attachment';
import Anchor from './Anchor';
import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';

const { tenantNum } = getCurrentTenant();

const Index = () => {
  const {
    routerParams: { sourceCategory, noBack, rfHeaderId },
    ref: { basicInfoRef, organizationRef, programmeRef, inviteRangeRef, attachmentRef },
    commonDs: {
      basicFormDs,
      sourceGroupDs,
      rfItemLineDs,
      supplierTableDs,
      noticeDs,
      ruleFormDs,
      rfFormDs,
      expertTableDs,
      businessIndicateDs,
      techIndicateDs,
      noneIndicateDs,
    },
    commonCode: { customizeUnitCode },
    history,
    customizeBtnGroup,
  } = useContext(Store);

  const [validateObj, setValidateObj] = useState({
    // 卡片校验绿钩钩
    basicCardValidate: false,
    organizationCardValidate: false,
    rfItemLineCardValidate: false,
    programmeCardValidate: false,
    inviteRangeCardValidate: false,
    ruleCardValidate: false,
  });

  const [operateLoading, setOperateLoading] = useState(false);
  const [allOpenSelectable, setAllOpenSelectable] = useState(false); // 寻源方式是否可以选择 `全平台公开`
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 双精度标志
  const [configSheet, setConfigSheet] = useState({});
  // 供应商360查询配置表是否是新用户
  const [sslmLifeCycleFlag, setSslmLifeCycleFlag] = useState(true);

  // 查询配置性数据
  useEffect(() => {
    initConfig();
  }, []);

  const initConfig = async () => {
    const res = getResponse(await querySourceMethodConfig({ tenantNum }));
    if (res) {
      setAllOpenSelectable(!isEmpty(res));
    }
    queryDoubleUnit();
    fetchConfig();
    fetchSslmLifeCycleConfig();
    queryNewScoreSheetConfig();
  };

  const queryDoubleUnit = () => {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        setDoubleUnitFlag(!!Number(res));
        rfItemLineDs.setState('doubleUnitFlag', !!Number(res));
      }
    });
  };

  // 查询配置表
  const fetchConfig = async () => {
    let data = null;
    if (!rfHeaderId) {
      return;
    }
    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      setConfigSheet({ ...configSheet, sprmOldUiConfig: !isEmpty(data) });
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

  // 查询新分值法配置表
  const queryNewScoreSheetConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_new_score_type_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (isEmpty(data)) {
        // eslint-disable-next-line no-unused-expressions
        ruleFormDs?.setState('newScoreFlag', true);
      }
    } catch (e) {
      throw e;
    }
  };

  // 大查询
  const fetchUpdate = async () => {
    const basic = basicFormDs.query();
    const source = sourceGroupDs.query();
    const rfItemLine = rfItemLineDs.query();
    const supplierTable = supplierTableDs.query();
    const ruleForm = ruleFormDs.query();
    const rfForm = rfFormDs.query();
    const notice = noticeDs.query();
    const expertTable = expertTableDs.query();
    const techIndicate = techIndicateDs.query();
    const businessIndicate = businessIndicateDs.query();
    const noneIndicate = noneIndicateDs.query();
    const fetchList = [basic, source, rfItemLine, supplierTable, ruleForm, rfForm, notice];
    if (ruleFormDs?.current?.get('expertScoreType') === 'ONLINE') {
      fetchList.push(expertTable);
      if (ruleFormDs?.current?.get('bidRuleType') === 'DIFF') {
        fetchList.push(techIndicate);
        fetchList.push(businessIndicate);
      } else {
        fetchList.push(noneIndicate);
      }
    }

    await Promise.all(fetchList);
  };

  // 校验form fields
  const validateFormRefFields = async (formRef = {}) => {
    const { fields = [] } = formRef || {};
    return Promise.all(fields?.map((i) => i.validate())).then((res) => {
      return res.every((item) => item);
    });
  };

  // 校验体
  const validateMultiple = (params = []) => {
    return Promise.all([...params]).then((res) => {
      if (res) {
        return res.every((i) => i);
      } else {
        return false;
      }
    });
  };

  // 校验条件逻辑判断
  const getResult = async (props) => {
    const { ruleForm, expertTable, businessIndicate, techIndicate, noneIndicate } = props;
    let flag;
    if (ruleFormDs?.current?.get('expertScoreType') === 'NONE') {
      flag = await validateMultiple([ruleForm]);
    } else if (ruleFormDs?.current?.get('bidRuleType') === 'DIFF') {
      flag = await validateMultiple([ruleForm, expertTable, businessIndicate, techIndicate]);
    } else {
      flag = await validateMultiple([ruleForm, expertTable, noneIndicate]);
    }
    return flag;
  };

  // 校验数据(ps: 保存返回完成率， 发布返回校验结果)
  const checkPage = async (type) => {
    const basicInfoCard = validateFormRefFields(basicInfoRef.current);
    const attachmentCard = validateFormRefFields(attachmentRef.current);
    const organizationAndStaffCard = await validateMultiple([
      validateFormRefFields(organizationRef.current),
      sourceGroupDs.validate(),
    ]);
    const rfItemLineCard = rfItemLineDs.validate();
    const programmeCard = validateFormRefFields(programmeRef.current);
    const inviteRangeCard = !basicFormDs.current?.get('sourceMethod')
      ? validateFormRefFields(inviteRangeRef.current)
      : basicFormDs.current?.get('sourceMethod') === 'INVITE'
      ? await validateMultiple([
          validateFormRefFields(inviteRangeRef.current),
          supplierTableDs.validate(),
        ])
      : await validateMultiple([
          validateFormRefFields(inviteRangeRef.current),
          noticeDs.validate(),
        ]);

    const ruleForm = ruleFormDs.validate();
    const expertTable = expertTableDs.validate();
    const businessIndicate = businessIndicateDs.validate();
    const techIndicate = techIndicateDs.validate();
    const noneIndicate = noneIndicateDs.validate();

    const ruleCard = await getResult({
      ruleForm,
      expertTable,
      businessIndicate,
      techIndicate,
      noneIndicate,
    });

    const list = [
      basicInfoCard,
      attachmentCard,
      organizationAndStaffCard,
      programmeCard,
      inviteRangeCard,
      ruleCard,
    ];

    // 有物料
    if (ruleFormDs?.current?.get('lineItemsFlag')) {
      list.push(rfItemLineCard);
    }

    return Promise.all(list).then((res) => {
      if (type === 'release') {
        return res?.every((i) => i);
      } else {
        const validate = {};
        const _list = [
          'basicCardValidate',
          'organizationCardValidate',
          'programmeCardValidate',
          'inviteRangeCardValidate',
          'ruleCardValidate',
        ];

        // 有物料
        if (ruleFormDs?.current?.get('lineItemsFlag')) {
          _list.push('rfItemLineCardValidate');
        }

        _list.forEach((i, index) => {
          validate[i] = res[index];
        });
        setValidateObj(validate);
        // 设置完成率
        const finishingRate = res.reduce((prev, cur) => prev + cur);
        return finishingRate;
      }
    });
  };

  // 处理评分要素数据
  const dealIndicateData = (ds, expertCategory) => {
    const newData = ds.toData()?.map((i) => {
      const { rfIndicateId, parentRfIndicateId, ...others } = i;
      if (i.tempIndicateId) {
        return { ...others, scoreCategory: expertCategory };
      }
      return { ...i, scoreCategory: expertCategory };
    });
    return newData;
  };

  // 获取保存、发布data
  const getData = (rate = 0) => {
    return {
      rfHeader: { ...basicFormDs.current?.toData(), finishingRate: rate },
      rfConfRule: ruleFormDs?.current?.toData(),
      rfForm: rfFormDs?.current?.toData(),
      rfMembers: sourceGroupDs?.toData(),
      rfLineItems: rfItemLineDs?.toData(),
      rfLineSuppliers: supplierTableDs?.toData(),
      rfExperts: expertTableDs?.toData(),
      sourceNotice: noticeDs?.current?.toData(),
      businessIndicates: dealIndicateData(businessIndicateDs, 'BUSINESS'),
      techIndicates: dealIndicateData(techIndicateDs, 'TECHNOLOGY'),
      noneIndicates: dealIndicateData(noneIndicateDs, 'BUSINESS_TECHNOLOGY'),
    };
  };

  // 保存 校验绿钩钩和保存数据(ps: 校验结果不影响保存操作)
  const handleSave = async () => {
    const finishingRate = await checkPage();
    const data = getData(finishingRate) || {};
    const params = {
      ...data,
      customizeUnitCode: customizeUnitCode.current,
    };
    setOperateLoading(true);
    return save(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          await fetchUpdate();
        }
      })
      .finally(() => setOperateLoading(false));
  };

  // 第二步
  const onOk = () => {
    const data = getData(6) || {};
    const params = {
      ...data,
      customizeUnitCode: customizeUnitCode.current,
      confirmFlag: 1,
    };
    return releaseUpdate(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        history.push({
          pathname: '/ssrc/new-inquiry-hall/list',
          search: querystring.stringify({
            releaseFinishFlag: 1, // 发布后的单据自动跳转到全部tab标识
            sourceCategory,
          }),
        });
      }
    });
  };

  // 发布 校验数据和发布(ps: 校验结果影响发布)
  const handleRelease = async () => {
    setOperateLoading(true);
    const flag = await checkPage('release');
    if (!flag) {
      notification.warning({
        message: intl.get('ssrc.rf.view.rf.inputSubmitRfxUpdate').d('提交前请填写完整相关信息'),
      });
      setOperateLoading(false);
      return;
    }
    const data = getData(6) || {};
    const params = {
      ...data,
      customizeUnitCode: customizeUnitCode.current,
    };

    // 第一步
    const res = await checkUpdate(params);
    const result = getResponse(res);
    if (result && !result.failed) {
      // 校验通过
      if (result?.body === true) {
        notification.success();
        setOperateLoading(false);
        history.push({
          pathname: '/ssrc/new-inquiry-hall/list',
          search: querystring.stringify({
            releaseFinishFlag: 1, // 发布后的单据自动跳转到全部tab标识
            sourceCategory,
          }),
        });
      } else if (result?.highestValidatorType === 'ERROR') {
        // 校验失败
        const { validateResults = [] } = result;

        const description = validateResults?.map?.((i, index) => {
          return <div>{`${index + 1}、${i.message}`}</div>;
        });

        notification.error({
          message: intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
          description,
          duration: null,
        });
        setOperateLoading(false);
      } else if (result?.highestValidatorType === 'WARNING') {
        // 校验警告
        const { validateResults = [] } = result;

        const description = validateResults?.map?.((i, index) => {
          return <div>{`${index + 1}、${i.message}`}</div>;
        });

        Modal.confirm({
          title: intl.get('ssrc.rf.view.title.warningInfo').d('以下验证未通过，确认发布吗？'),
          children: description,
          onOk: () => onOk(),
          onCancel: () => {},
        });
        setOperateLoading(false);
      }
    } else {
      setOperateLoading(false);
    }
  };

  const cancel = async () => {
    const res = getResponse(await cancelRelease({ rfHeaderId }));
    if (res) {
      history.push('/ssrc/new-inquiry-hall/list');
    }
  };

  const handleCancelRelease = () => {
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.cancelChange`)
        .d('是否确认取消并关闭该单据？'),
      onOk: () => cancel(),
      onCancel: () => {},
    });
  };

  // 渲染标题
  const Title = observer(({ ds, source }) => {
    const { current = {} } = ds || {};
    const title = current?.get?.('rfNum') ? `-${current?.get?.('rfNum')}` : '';
    if (source === 'RFP') {
      return intl.get('ssrc.rf.view.card.title.rfpTitle').d('编辑方案征询书') + title;
    } else if (sourceCategory === 'RFI') {
      return intl.get('ssrc.rf.view.card.title.rfiEditTitle').d('编辑征询书') + title;
    }
  });

  const getBackPath = useMemo(
    () => (noBack ? null : `/ssrc/new-inquiry-hall/list?sourceCategory=${sourceCategory}`),
    [sourceCategory, noBack]
  );

  const getButtons = useMemo(() => {
    return [
      {
        name: 'cancel',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          loading: operateLoading,
          onClick: handleCancelRelease,
        },
        child: intl.get('hzero.common.button.cancel').d('取消'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          loading: operateLoading,
          onClick: handleSave,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'publish',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          loading: operateLoading,
          onClick: handleRelease,
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
    ];
  }, [operateLoading]);

  const inviteRangeProps = {
    allOpenSelectable,
    customizeBtnGroup,
    sslmLifeCycleFlag,
  };

  const rfItemLineProps = {
    doubleUnitFlag,
    configSheet,
  };

  return (
    <Fragment>
      <Header title={<Title ds={basicFormDs} source={sourceCategory} />} backPath={getBackPath}>
        {customizeBtnGroup(
          { code: `SSRC.INQUIRY_HALL.RF_EDIT.HEADER_BUTTONS_${sourceCategory}`, pro: true },
          <DynamicButtons buttons={getButtons} />
        )}
      </Header>
      <div className={classNames('rf-page-content-warp', styles['rf-page-content'])}>
        <Anchor
          sourceCategory={sourceCategory}
          lineItemFlag={ruleFormDs?.current?.get('lineItemsFlag')}
        />
        {/** to do 考虑通用卡片样式设置 */}
        <Spin dataSet={basicFormDs}>
          <div className={styles['rf-card-content-wrapper']}>
            <Card
              id="basicInfoCard"
              title={intl.get('ssrc.rf.view.card.title.basicInfos').d('基本信息')}
              component={<BasicInfo />}
              validateFlag={validateObj?.basicCardValidate}
            />
            <Card
              id="organizationAndStaffCard"
              title={intl.get('ssrc.rf.view.card.title.purPeople').d('采购组织及人员')}
              component={<OrganizationAndStaff />}
              validateFlag={validateObj?.organizationCardValidate}
            />
            {ruleFormDs?.current?.get('lineItemsFlag') ? (
              <Card
                id="rfItemLineCard"
                title={intl.get('ssrc.rf.view.card.title.item').d('标的物')}
                component={<RfItemLine {...rfItemLineProps} />}
                validateFlag={validateObj?.rfItemLineCardValidate}
              />
            ) : null}
            <Programme />
            <Card
              id="inviteRangeCard"
              title={intl.get('ssrc.rf.view.card.title.inviteRange').d('邀请范围')}
              component={<InviteRange {...inviteRangeProps} />}
              validateFlag={validateObj?.inviteRangeCardValidate}
            />
            <Card
              id="ruleCard"
              title={intl.get('ssrc.rf.view.card.title.rule').d('规则设置')}
              component={<Rule />}
              validateFlag={validateObj?.ruleCardValidate}
            />
            <Card
              id="attachmentCard"
              title={intl.get('ssrc.rf.view.card.title.attachmentUuid').d('附件')}
              component={<Attachment />}
            />
          </div>
        </Spin>
      </div>
    </Fragment>
  );
};

export default observer(Index);
