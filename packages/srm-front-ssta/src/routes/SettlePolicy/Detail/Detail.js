/*
 * @Description: 结算策略详情
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useContext, useCallback, useMemo } from 'react';
import { Button, Tabs, Dropdown, Icon, Modal, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isArray, isEmpty, isUndefined } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { Header } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import StatusTag from '@/routes/Components/StatusTag';
import {
  validateStrategy,
  getPayOprPermission,
  getToleAutoAdjust,
  editSettleStrategy,
} from '@/services/settleStrategyServices';
import styles from './index.less';
import BasicInfo from './BasicInfo';
import BillRuleConfig from './BillRuleConfig';
import InvSettleConfig from './InvSettleConfig';
import PaySettleConfig from './PaySettleConfig';
import { Store } from './StoreProvider';
import { setErrorsMap } from './hooks';
import SettleAffairConfig from './SettleAffairConfig';
import VersionRecord from '@/components/HistoryRecord/VersionRecord';

const { TabPane } = Tabs;

/**
 * @description: 结算策略详情
 * @param {*}
 * @return {*}
 */
const SettleStrategyDetail = () => {
  const {
    state,
    search,
    pathname,
    allFlag,
    refsMap,
    history,
    editFlag,
    headerDs,
    activeKey,
    setActiveKey,
    emitErrorsMap,
    settleConfigId,
    getTagProps,
    historyFlag,
    componentFlag,
    titleMap,
    emitChangeModals,
    platModalFlag,
    payApproveMethodDs,
    payDimensionDs,
  } = useContext(Store);
  const createFlag = settleConfigId === 'create';
  const loading = headerDs.status !== 'ready' || !headerDs.current;
  const { snapshotFlag, configStatus, versionNumber, settleConfigNum, parentDisplayStatus } =
    headerDs.current?.get([
      'snapshotFlag',
      'configStatus',
      'displayStatus',
      'versionNumber',
      'settleConfigNum',
      'parentDisplayStatus',
    ]) || {};
  const { settleMode, enablePaymentFlag } =
    headerDs.current?.get(['settleMode', 'enablePaymentFlag']) || {};

  const msgSuffix = intl
    .get('ssta.settleStrategy.view.message.notCompleteAndJumpTo')
    .d('暂未配置完成,可以通过右侧按钮查看及定位至未配置项');

  const invMatchRuleValitionItem = useMemo(
    () => ({
      code: 'invMatchRule',
      message:
        intl.get('ssta.settleStrategy.view.title.invMatchRule').d('发票匹配规则') + msgSuffix,
    }),
    [msgSuffix]
  );

  const eSignRuleValitionItem = useMemo(
    () => ({
      code: 'eSignFlag',
      message:
        intl.get('ssta.settleStrategy.model.settleStrategy.electronicealRule').d('电子签章规则') +
        msgSuffix,
    }),
    [msgSuffix]
  );

  const chargeDebitValitionItem = useMemo(
    () => ({
      code: 'enableChargeDebitFlag',
      message:
        intl.get(`ssta.settleStrategy.model.settleStrategy.autoIssueCode`).d('自动出单') +
        msgSuffix,
    }),
    [msgSuffix]
  );

  const headerTitle = useMemo(() => {
    const titlePrefix = editFlag
      ? intl.get('ssta.settleStrategy.view.title.editSettleStrategy').d('编辑结算策略')
      : intl.get('ssta.settleStrategy.view.title.viewSettleStrategy').d('查看结算策略');
    const titleSuffix = historyFlag
      ? intl
          .get('ssta.common.view.message.versionVNumber', { versionNumber })
          .d('版本v{versionNumber}')
      : '';
    return `${titlePrefix} ${titleSuffix}`;
  }, [editFlag, historyFlag, versionNumber]);

  const backPath = useMemo(() => {
    return state?.backPath || '/ssta/settle-strategy/list';
  }, [state]);

  /**
   * @description: 设置tabs的activekey
   * @param {*} value 当前activekey
   * @return {Function} setActiveKey
   */
  const handleSetActiveKey = useCallback((value) => setActiveKey(value), [setActiveKey]);

  /**
   * @description: 返回列表页面
   * @param {*}
   * @return {*}
   */
  const handleBackList = useCallback(() => {
    history.push({ pathname: `/ssta/settle-strategy/list` });
  }, [history]);

  /**
   * @description: 跳转详情页面
   * @param {String} 详情页id参数（结算策略id/create）
   * @param {String} 详情页操作类型参数
   * @return {*}
   */
  const handleToDetail = useCallback(
    (versionId, operate) => {
      history.push({
        pathname: `/ssta/settle-strategy/${operate}/${versionId}`,
      });
    },
    [history]
  );

  const handleEdit = useCallback(async () => {
    const res = getResponse(await editSettleStrategy(settleConfigId));
    const { settleConfigId: newSettleConfigId } = res || {};
    if (!newSettleConfigId) return;
    history.push({
      pathname: `/ssta/settle-strategy/edit/${newSettleConfigId}`,
      state: { backPath: `${pathname}${search}` },
    });
    // tabListen 不替换 state
    updateTab({
      key: getActiveTabKey(),
      state: { backPath: `${pathname}${search}` },
    });
  }, [search, history, pathname, settleConfigId]);

  const handleBack = useCallback(() => {
    if (state?.backPath) {
      updateTab({
        key: getActiveTabKey(),
        search: state?.backPath.split('?')[1],
        state: { backPath: null },
      });
    }
  }, [state]);

  const handleValidationLocate = useCallback(
    async (errors) => {
      if (!isEmpty(errors[activeKey])) {
        const code = errors[activeKey][0]?.code;
        const errNode = refsMap.current[code];
        if (errNode) {
          errNode.parentNode.scrollTop = errNode.offsetTop - 60;
        }
      } else {
        const firstErrKeyObj = Object.entries(errors).find((item) => !isEmpty(item[1]));
        if (firstErrKeyObj?.[0]) {
          const firstErrKey = firstErrKeyObj[0];
          handleSetActiveKey(firstErrKey);
          const errNode = refsMap.current[errors[firstErrKey][0]?.code];
          if (errNode) {
            errNode.parentNode.scrollTop = errNode.offsetTop - 60;
          }
        }
      }
    },
    [activeKey, handleSetActiveKey, refsMap]
  );

  /**
   * @description: 结算策略保存发布前端校验
   * @param {*}
   * @return {Promise} 校验结果
   */
  const handleDsValidate = useCallback(() => {
    return new Promise(async (resolve) => {
      const isValid = await headerDs.validate();
      if (isValid) {
        emitErrorsMap({ type: 'init' });
        resolve(true);
      } else {
        const initialErrors = setErrorsMap();
        // 平铺表格children校验，校验后会滚动到最后一个ds的第一条error记录，注意ds顺序
        Object.entries(headerDs.children)
          .reverse()
          .forEach(([key, value]) => {
            if (!isEmpty(value.getValidationErrors())) {
              const { validationGroup, validationTitle } = value.props;
              initialErrors[validationGroup].push({
                code: key,
                message: validationTitle + msgSuffix,
              });
            }
          });
        // 头校验，需要提示的在dsFieldProps里面添加validationGroup并修改校验方法，单选默认不提示
        headerDs.current.getValidationErrors().forEach(({ field }) => {
          const validationGroup = field.get('validationGroup');
          if (validationGroup === invMatchRuleValitionItem.code) {
            initialErrors.invoice.push(invMatchRuleValitionItem);
          } else if (validationGroup === eSignRuleValitionItem.code) {
            initialErrors.bill.push(eSignRuleValitionItem);
          } else if (validationGroup === chargeDebitValitionItem.code) {
            initialErrors.invoice.push(chargeDebitValitionItem);
          } else if (validationGroup) {
            initialErrors[validationGroup].push({
              code: field.get('name'),
              message: field.get('label') + msgSuffix,
            });
          }
        });
        // 4、结算模式仅对账不校验开票付款，仅结算不校验对账，未启用付款不校验付款
        if (settleMode === 'ONLY_BILL') {
          delete initialErrors.invoice;
          delete initialErrors.payment;
        } else if (settleMode === 'ONLY_SETTLE') {
          delete initialErrors.bill;
        } else if (Number(enablePaymentFlag) !== 1) {
          delete initialErrors.payment;
        }
        const hasError = Object.values(initialErrors).some((item) => !isEmpty(item));
        if (hasError) {
          emitErrorsMap({ type: 'set', payload: initialErrors });
          handleValidationLocate(initialErrors);
          resolve(false);
        } else {
          resolve(isValid);
        }
      }
    });
  }, [
    headerDs,
    emitErrorsMap,
    settleMode,
    enablePaymentFlag,
    invMatchRuleValitionItem,
    eSignRuleValitionItem,
    msgSuffix,
    handleValidationLocate,
    chargeDebitValitionItem,
  ]);

  /**
   * @description: 结算策略保存发布后端校验
   * @param {*}
   * @return {Promise} 校验结果
   */
  const handleBackValidate = useCallback(async () => {
    return new Promise(async (resolve) => {
      const validationRes = getResponse(await validateStrategy(headerDs.current.toJSONData()));
      if (isUndefined(validationRes)) resolve(false);
      if (isEmpty(validationRes)) {
        emitErrorsMap({ type: 'init' });
        resolve(true);
      } else {
        // 后端把头ds级联children的key按照BILL,INVOICE,PAYMNET分组传回
        const {
          BASIC: base = [],
          AFFARE: affair = [],
          BILL: bill = [],
          INVOICE: invoice = [],
          PAYMENT: payment = [],
          TAX_INVOICE: taxInvoice = [],
        } = validationRes || {};
        const backErrsMap = { bill, invoice: [...invoice, ...taxInvoice], payment, base, affair };
        emitErrorsMap({ type: 'set', payload: backErrsMap });
        handleValidationLocate(backErrsMap);
        resolve(false);
      }
    });
  }, [headerDs, emitErrorsMap, handleValidationLocate]);

  /**
   * @description: 结算策略保存发布回调
   * @param {String} 保存/发布
   * @return {*}
   */
  const handleSubmit = useCallback(
    async (submitType) => {
      const check = async () => {
        const isDsValid = await handleDsValidate();
        if (!isDsValid) return;
        // 新建无需后端校验，后端校验成功返回空对象
        const isBackValid = createFlag || (await handleBackValidate());
        if (!isBackValid) return;
        if (submitType === 'release' && parentDisplayStatus === 'DISABLE') {
          const feedback = await Modal.confirm({
            title: intl.get('ssta.common.view.title.tip').d('提示'),
            children: intl
              .get('ssta.settleStrategy.view.message.disabledParentStrategyReleaseTip')
              .d('当前策略为禁用状态，发布后将直接生效变为“已发布”，请确认是否发布'),
          });
          if (feedback !== 'ok') return;
        }
        const res = await headerDs.setState('submitType', submitType).submit();
        if (!res?.success) return;
        emitChangeModals([]);
        if (createFlag && isArray(res.content)) {
          handleToDetail(res.content[0]?.settleConfigId, 'edit');
        } else if (submitType === 'release') {
          handleBackList();
        } else {
          headerDs.query();
        }
      };
      // 平台级结算策略只有保存，没有发布
      if (submitType === 'release') {
        let payOprPermission = getResponse(
          await getPayOprPermission(platModalFlag, settleConfigId)
        );
        const toleAutoAdjust = getResponse(await getToleAutoAdjust(platModalFlag, settleConfigId));
        payOprPermission = (payOprPermission?.content || []).filter(
          (item) => item.documentType === 'INVOICE'
        );
        const permissionTypeFlag = payOprPermission.some((item) => item.permissionType === 'EDIT');
        const { stepAdjustFlag } = toleAutoAdjust?.content[0] || {};
        const amountAdjustFlag = headerDs.current?.get('amountAdjustFlag');
        const paymentApprovalFlag = payApproveMethodDs?.some(
          (item) =>
            item?.get('typeCode') === 'CONFIRM' &&
            Number(item?.get('enableCondFlag')) === 1 &&
            item?.get('approvedMethodCode') === 'BATCH_WORKFLOW_APPROVAL'
        );
        const paySettleDimensionFlag = payDimensionDs?.some(
          (item) =>
            item?.get('docType') === 'PAYMENT' &&
            item?.get('dimensionType') === 'SPLITE' &&
            item?.get('dimension') === 'DOC_MERGE'
        );
        if (
          permissionTypeFlag ||
          (Number(amountAdjustFlag) === 1 && stepAdjustFlag === 1) ||
          (paySettleDimensionFlag && paymentApprovalFlag)
        ) {
          Modal.open({
            key: Modal.key(),
            title: intl
              .get('ssta.settleStrategy.view.message.title.settlement.strategy.release')
              .d('结算策略发布提醒'),
            children: (
              <div>
                <p>
                  {intl
                    .get(`ssta.settleStrategy.view.message.title.InvSettleConfig`)
                    .d('当前策略启用如下特殊场景配置，请确认是否发布该策略？')}
                </p>
                {permissionTypeFlag && (
                  <p>
                    {intl
                      .get(`ssta.settleStrategy.view.message.pperation.authority.error`)
                      .d(
                        '【付款申请（含发票）配置，付款操作权限配置「编辑」】该配置启用后，可创建含发票信息的付款申请，对应结算事务仅可在[采购方/销售方结算单工作台-新建付款申请-付款申请（含发票）-基于事务]路径中查询并创建，[结算池-可开票/可付款]路径均无法进行该事务的结算（配置路径：发票申请结算单配置-付款申请（含发票）配置-付款操作权限）'
                      )}
                  </p>
                )}
                {Number(amountAdjustFlag) === 1 && stepAdjustFlag === 1 && (
                  <p>
                    {intl
                      .get(`ssta.settleStrategy.view.message.step.node.error`)
                      .d(
                        '【step节点自动调整=是】该配置启用后，非直连开票场景，在发票申请创建step环节中，系统将自动按照用户填写的税务发票金额对系统发票金额进行尾差调整，故要求业务上在step中需填写完整准确的税务发票，否则符合允差范围的尾差，系统将在用户无感知情况下进行系统发票金额调整。（配置路径：发票申请结算单配置-尾差自动调整）'
                      )}
                  </p>
                )}
                {paySettleDimensionFlag && paymentApprovalFlag && (
                  <p>
                    {intl
                      .get(`ssta.settleStrategy.view.message.pay.split.tips`)
                      .d(
                        '【付款申请-确认审批方式】中配置有「工作流审批（以结算单批次发起）」，且【付款申请-结算维度-拆分规则】中启用了拆分规则，则付款申请创建并拆分为多笔付款申请时，任意一单的确认审批方式匹配至「工作流审批（以结算单批次发起）」，整组结算单均以该方式触发审批。若拆单组下存在无需走批次审批的单据，可通过页面上的【移除】按钮，将对应结算单从批次审批中移除'
                      )}
                  </p>
                )}
              </div>
            ),
            okText: intl.get('hzero.common.message.confirm.releases').d('确认发布'),
            onOk: () => check(),
          });
        } else {
          return check();
        }
      } else {
        return check();
      }
    },
    [
      handleDsValidate,
      handleBackValidate,
      headerDs,
      createFlag,
      handleToDetail,
      handleBackList,
      emitChangeModals,
      platModalFlag,
      settleConfigId,
      parentDisplayStatus,
      payApproveMethodDs,
      payDimensionDs,
    ]
  );

  const handleViewHistory = useCallback(
    ({ record }) => {
      const settleConfigId = record.get('settleConfigId');
      const newLocation = historyFlag ? { state } : { state: { backPath: `${pathname}${search}` } };
      history.push({
        pathname: `/ssta/settle-strategy/history/${settleConfigId}`,
        ...newLocation,
      });
      updateTab({ key: getActiveTabKey(), ...newLocation });
    },
    [state, search, pathname, history, historyFlag]
  );

  const getTabTitle = useCallback(
    (tabKey) => {
      return (
        <div className={styles['tab-title-wrapper']}>
          <div className={styles['tab-title-text']}>{titleMap[tabKey]}</div>
          {editFlag && !createFlag && (
            <StatusTag size="small" {...getTagProps(tabKey)} className={styles['tab-title-tag']} />
          )}
        </div>
      );
    },
    [titleMap, editFlag, createFlag, getTagProps]
  );

  return (
    <Fragment>
      {!componentFlag && (
        <Header title={headerTitle} backPath={backPath} onBack={handleBack}>
          {allFlag && Number(snapshotFlag) === 1 && (
            <Button icon="mode_edit" funcType="flat" onClick={handleEdit}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
          )}
          {editFlag && [
            !createFlag && (
              <Button icon="publish2" color="primary" onClick={() => handleSubmit('release')}>
                {intl.get('hzero.common.button.publish').d('发布')}
              </Button>
            ),
            <Button
              icon="save"
              color={createFlag ? 'primary' : 'normal'}
              funcType={createFlag ? 'raised' : 'flat'}
              onClick={() => handleSubmit('save')}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>,
          ]}
          {!createFlag &&
            configStatus === 'PUBLISHED' &&
            (Number(versionNumber) > 1 || historyFlag) && (
              <Dropdown
                placement="bottomRight"
                overlay={
                  <VersionRecord
                    primaryKey="settleConfigId"
                    currentKey={settleConfigId}
                    onClick={handleViewHistory}
                    fieldsConfig={{
                      userName: { alias: 'publishedByName' },
                      time: { alias: 'publishedDate' },
                    }}
                    readTransport={{
                      url: `${SRM_SSTA}/v1/${
                        isTenantRoleLevel() ? getCurrentOrganizationId() : 'site'
                      }/settle-config/history/page`,
                      method: 'GET',
                      params: { settleConfigNum },
                    }}
                  />
                }
              >
                <Button funcType="flat" icon="schedule">
                  {intl.get('hzero.common.button.historyVersion').d('历史版本')}
                  <Icon type="expand_more" />
                </Button>
              </Dropdown>
            )}
        </Header>
      )}
      <div
        className={`${
          styles[componentFlag ? 'strategy-detail-modal-content' : 'settle-strategy-detail']
        }`}
      >
        <Spin spinning={loading} wrapperClassName="full-height-spinning">
          <Tabs tabPosition="left" activeKey={activeKey} onChange={handleSetActiveKey}>
            <TabPane key="base" tab={getTabTitle('base')}>
              <BasicInfo />
            </TabPane>
            <TabPane key="affair" tab={getTabTitle('affair')}>
              <SettleAffairConfig />
            </TabPane>
            {settleMode !== 'ONLY_SETTLE' && (
              <TabPane key="bill" tab={getTabTitle('bill')}>
                <BillRuleConfig />
              </TabPane>
            )}
            {settleMode !== 'ONLY_BILL' && [
              <TabPane key="invoice" tab={getTabTitle('invoice')}>
                <InvSettleConfig />
              </TabPane>,
              <TabPane key="payment" tab={getTabTitle('payment')}>
                <PaySettleConfig />
              </TabPane>,
            ]}
          </Tabs>
        </Spin>
      </div>
    </Fragment>
  );
};

export default observer(SettleStrategyDetail);
