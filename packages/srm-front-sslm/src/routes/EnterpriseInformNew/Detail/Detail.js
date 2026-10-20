/*
 * Detail - 企业信息变更详情
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { routerRedux } from 'dva/router';
import { Alert } from 'choerodon-ui';
import { useDataSet, Modal, Spin, Form, TextArea, DataSet } from 'choerodon-ui/pro';
import { compose, isEmpty, head, forEach, isUndefined } from 'lodash';
import React, { Fragment, useState, useCallback, useMemo, useEffect, useRef } from 'react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import remotes from 'utils/remote';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { getResponse } from 'utils/utils';
import { useSetState } from '@/routes/components/utils';
import {
  allSave,
  submitApplication,
  deleteApplication,
  queryInfoChangeApprovalDetail,
  fetchWeburl,
} from '@/services/enterpriseInformService';
import { checkBankAccountCommon, fetchBusinessRules } from '@/services/commonService';

import styles from '../styles.less';
import HeaderInfo from './HeaderInfo';
import EnterpriseBasicInfo from './EnterpriseBasicInfo';
import AttachmentInfo from './AttachmentInfo';
import Investiga from './Investiga';
import HeaderBtns from './HeaderBtns';
import { getPanelList } from './EnterpriseBasicInfo/utils/getPanel';
import { getHeaderDS, getAppealDS } from '../stores/getHeaderDS';
import { getHeaderTitle, getRenderFieldProps } from '../utils';

const customizeUnitCode = [
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.HEADER',
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS', // 登记信息 （境内外）
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL', // 登记信息（个人）
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BUSINESS_INFO', // 业务信息
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.ADDRESS', // 地址
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BANK', // 银行
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.CONTACT', // 联系人
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.INVOICE', // 开票
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.FINANCIAL', // 财务
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT', // 附件
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.CLASSIFY', // 分类
  'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.OTHER_INFO', // 其他信息
];

const Detail = ({
  remote,
  dispatch,
  location,
  routerParams,
  isAllPlatform,
  custLoading,
  customizeForm,
  customizeTable,
  customizeTabPane,
  match: {
    params: { status = 'view' },
  },
  queryUnitConfig,
  custConfig,
}) => {
  const enterpriseBasicRef = useRef(null); // 企业基础信息ref
  const investigRef = useRef(null); // 调查表信息ref
  const { changeReqId, partnerTenantId, openMenuType = '' } = routerParams;

  const [loading, setLoading] = useState(false);
  const [appealBtnFlag, setAppealBtnFlag] = useState(false);
  const [viewUpdate, setViewUpdate] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [enterpriseBasicPanels, setEnterpriseBasicPanels] = useState([]);
  const [state, setState] = useSetState({
    templateConfig: {}, // 模版配置
    mustLineTabObj: {}, // 业务规则页签必填行数
  });
  const { templateConfig, mustLineTabObj } = state;

  const isEditPage = useMemo(() => status === 'edit', [status]);
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location.pathname]);
  const headerDs = useDataSet(() => getHeaderDS({ partnerTenantId }), []);

  const { reqStatus, checkMode, appealFlag, configNames, domesticForeignRelation } = headerInfo;
  const isEdit = useMemo(
    () => ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(reqStatus) && isEditPage,
    [reqStatus, isEditPage]
  );

  const showAppealBtn =
    isEdit &&
    isAllPlatform &&
    (appealBtnFlag || appealFlag === 1 || ['REJECTED'].includes(reqStatus));

  const hiddenBackPath = isPub || ['openTab'].includes(openMenuType);

  useEffect(() => {
    hanldeQueryCuzUnit();
    handleQuery();
    handleQueryBusinessRules();
  }, [changeReqId]);

  // 查询个性化单元
  const hanldeQueryCuzUnit = () => {
    if (queryUnitConfig) {
      if (isAllPlatform) {
        // 取二级域名
        const { hostname } = window.location;
        fetchWeburl({ webUrl: hostname }).then(res => {
          if (getResponse(res)) {
            // 取二级域名的所属租户
            const { tenantId: purchaserTenantId = 0 } = res;
            queryUnitConfig({ customizeTenantId: purchaserTenantId });
          } else {
            queryUnitConfig({ customizeTenantId: partnerTenantId });
          }
        });
      } else {
        queryUnitConfig({ customizeTenantId: partnerTenantId });
      }
    }
  };

  // 处理查询
  const handleQuery = useCallback(
    async ({ investigQueryFlag = false } = {}) => {
      try {
        setLoading(true);
        headerDs.setQueryParameter('queryParmas', {
          changeReqId,
          newPageQuery: isEditPage ? 0 : 1,
          customizeUnitCode: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.HEADER',
        });
        const result = await Promise.all([headerDs.query(), queryConfig()]);
        const [headerResp, investgConfig] = result;
        let newEditFlag = isEditPage;
        let personalFlag = false;
        if (getResponse(headerResp)) {
          setHeaderInfo(headerResp);
          const {
            reqStatus: newReqStatus,
            domesticForeignRelation: newDomesticForeignRelation,
          } = headerResp;
          newEditFlag =
            ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(newReqStatus) && isEditPage;
          personalFlag = newDomesticForeignRelation === 2;
        } else {
          return;
        }
        let temptConfig = {};
        if (getResponse(investgConfig)) {
          temptConfig = investgConfig;
          setState({ templateConfig: temptConfig });
        }
        if (!investigQueryFlag) {
          setEnterpriseBasicPanels(
            getPanelList({
              remote,
              isAllPlatform,
              partnerTenantId,
              readOnlyFlag: !newEditFlag,
              personalFlag,
              temptConfig,
              changeReqId,
              cusCodeSuorce: 'function',
            })
          );
        }
        await Promise.all([
          enterpriseBasicRef.current && enterpriseBasicRef.current.handleQuery(),
          investigQueryFlag && investigRef.current && investigRef.current.handleQuery(), // 仅按钮回调查询调查表页签，初始化无需查询
        ]);
      } finally {
        setLoading(false);
      }
    },
    [isEditPage, changeReqId, enterpriseBasicRef.current, investigRef.current]
  );

  // 查询业务规则
  const handleQueryBusinessRules = () => {
    if (!isAllPlatform) {
      fetchBusinessRules({
        documentType: 1,
        partnerTenantId,
      }).then(resp => {
        const res = getResponse(resp);
        if (res) {
          setState({ mustLineTabObj: res });
        }
      });
    }
  };

  // 查询调查表配置
  const queryConfig = useCallback(async () => {
    // 查询模板配置
    const payload = {
      changeReqId,
      partnerTenantId,
    };
    return queryInfoChangeApprovalDetail(payload);
  }, [changeReqId, partnerTenantId]);

  /**
   * fieldName: 标红字段，没配置displayField则用fieldName取旧数据
   * displayField: 取旧数据
   */
  const getFieldProps = useCallback(
    ({ currentRecord, fieldName, type, displayField, hidden } = {}) => {
      const { hidden: formFeildHidden = {}, renderer } = getRenderFieldProps({
        currentRecord,
        fieldName,
        fieldType: type,
        displayField,
        hidden,
      });
      // 处理hidden
      const hiddenProps = viewUpdate ? formFeildHidden : { hidden };
      return isEdit
        ? hiddenProps
        : {
            renderer: ({
              value,
              record,
              name,
              type: renderType,
              displayField: renderDisplayField,
            }) => renderer({ value, record, name, renderType, renderDisplayField }),
            ...hiddenProps,
          };
    },
    [isEdit, viewUpdate]
  );

  // 处理只读表格渲染
  const handleFieldRender = useCallback(({ value, record, name, type, displayField } = {}) => {
    const { renderer } = getRenderFieldProps({
      currentRecord: record,
      fieldName: name,
      fieldType: type,
      displayField,
    });
    return renderer({ value, record, name, renderType: type, renderDisplayField: displayField });
  }, []);

  // 获取保存所需参数
  const getSaveParams = useCallback(async () => {
    try {
      setLoading(true);
      const validateFlag = await headerDs.current.validate(true);
      if (validateFlag) {
        let payload = {
          customizeUnitCode: !isAllPlatform ? customizeUnitCode : [],
          customizeTenantId: partnerTenantId,
          tenantId: !isAllPlatform ? partnerTenantId : undefined,
          desensitize: false,
          changeReqId,
        };
        payload.firmChangeReq = {
          ...headerDs.current.toJSONData(),
          isAppeal: 0,
        };
        // 企业基础信息
        if (enterpriseBasicRef.current) {
          const supplierBasicParams = await enterpriseBasicRef.current.handleSaveParams();
          if (supplierBasicParams) {
            payload = {
              ...payload,
              ...supplierBasicParams,
            };
          } else {
            return false;
          }
        }
        // 调查表信息
        if (investigRef.current) {
          const investigParams = await investigRef.current.handleSaveParams();
          if (investigParams) {
            payload = {
              ...payload,
              ...investigParams,
            };
          } else {
            return false;
          }
        }
        return payload;
      } else {
        const errorsMsg = [];
        const { errors = [] } = head(headerDs.getValidationErrors()) || {};
        if (!isEmpty(errors)) {
          forEach(errors, curent => {
            const { validationMessage } = head(curent?.errors) || {};
            if (validationMessage) {
              errorsMsg.push(<div>{validationMessage}</div>);
            }
          });
        }
        notification.warning({
          message: intl
            .get('sslm.enterpriseInform.view.warn.basicInfoNotFilled')
            .d('【申请单基础信息】信息未填写'),
          description: errorsMsg,
        });
        return false;
      }
    } finally {
      setLoading(false);
    }
  }, [enterpriseBasicRef.current, investigRef.current, changeReqId]);

  // 保存回调
  const handleSave = useCallback(async () => {
    const payload = await getSaveParams();
    if (payload) {
      setLoading(true);
      return allSave(payload)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleQuery({ investigQueryFlag: true });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // 提交回调
  const handleCheckSubmit = useCallback(async () => {
    const payload = await getSaveParams();
    if (!isEmpty(payload)) {
      // 区分平台级和租户级提交
      if (isAllPlatform) {
        return handleCheckBankInfo({ saveParam: payload });
      } else {
        // 针对采购方变更
        return handleCheckBankInfo({ saveParam: payload });
      }
    }
  }, [changeReqId, checkMode, isAllPlatform]);

  // 校验银行账号等信息
  const handleCheckBankInfo = useCallback(
    ({ saveParam = {} } = {}) => {
      // 登记信息企业名称
      const { companyName } =
        (isAllPlatform
          ? saveParam.comBasicReq
          : saveParam.supBasicReq || saveParam.sslmInvestgBankAccount) || {};
      // 取开票信息
      const invoiceInfo = isAllPlatform ? saveParam.invoiceReq : saveParam.supInvoiceReq;
      const { invoiceHeader } = invoiceInfo || {};
      let invoiceHeaderDifferentFlag = false;
      if (!isEmpty(invoiceInfo)) {
        invoiceHeaderDifferentFlag = invoiceHeader !== companyName;
      }
      // 银行信息
      const bankData = isAllPlatform ? saveParam.comBankAccReqs : saveParam.supBankAccReqs;
      const formatBankData = (bankData || []).map(n => {
        const {
          investgBankAccountId,
          bankAccReqId,
          comBankAccReqId,
          bankAccountName,
          ...other
        } = n;
        return {
          bankAccountId: investgBankAccountId || bankAccReqId || comBankAccReqId,
          bankAccountName,
          ...other,
        };
      });
      const payload = {
        bankAccountList: formatBankData,
        documentId: changeReqId,
        documentSource: 'FIRM_CHANGE',
        companyName,
        purchaseTenantId: isAllPlatform ? null : partnerTenantId,
      };
      return new Promise(resolve => {
        setLoading(true);
        checkBankAccountCommon(payload)
          .then(async res => {
            if (getResponse(res)) {
              let invoiceHeaderMsg = '';
              let bankRepeatMsg = '';
              let bankAccountDifferentMsg = '';
              const {
                bankDataFlag = true,
                bankNameFlag = true,
                firmChangeWritePlatformFlag = false,
              } = res || {};
              // 全平台，或者租户级开启了校验，开票头信息不一致需提示
              if (invoiceHeaderDifferentFlag) {
                if (isAllPlatform || firmChangeWritePlatformFlag) {
                  invoiceHeaderMsg = intl
                    .get('sslm.supplierInform.view.message.invoiceHeaderAtypismTips')
                    .d('企业名称与发票头不一致');
                }
              }
              // 银行名称不一致需要前端校验的场景
              const bankAccountNameFlag =
                !bankNameFlag && (checkMode === 'weakCheck' || isAllPlatform);
              if (!bankDataFlag || bankAccountNameFlag) {
                bankRepeatMsg =
                  !isUndefined(bankDataFlag) && !bankDataFlag
                    ? intl
                        .get('sslm.supplierInform.view.message.bankDuplicateToolTips')
                        .d('存在银行账户重复的数据，请检查数据，确认是否继续提交')
                    : '';
                bankAccountDifferentMsg =
                  !isUndefined(bankNameFlag) && bankAccountNameFlag
                    ? intl
                        .get('sslm.supplierInform.view.message.bankToolTips')
                        .d('银行账户名称与公司名称不一致，请确认是否继续提交')
                    : '';
              }
              // 弹窗提示
              if (invoiceHeaderMsg || bankRepeatMsg || bankAccountDifferentMsg) {
                Modal.confirm({
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: (
                    <Fragment>
                      <div>{bankRepeatMsg}</div>
                      <div>{bankAccountDifferentMsg}</div>
                      <div>{invoiceHeaderMsg}</div>
                    </Fragment>
                  ),
                  onOk: () => {
                    // 提交
                    return classifyRepeatCheck(saveParam);
                  },
                });
                resolve(true);
              } else {
                const result = await classifyRepeatCheck(saveParam);
                resolve(result);
              }
            } else {
              resolve(false);
            }
          })
          .finally(() => setLoading(false));
      });
    },
    [changeReqId, isAllPlatform, checkMode]
  );

  // 供应商分类弱校验，产品要求单独校验，不可合并校验
  // 公司级变更，对比供应商分类是否变更，如有变更，弹框确认
  const classifyRepeatCheck = (payload = {}) => {
    const { firmChangeReq: { supplierCategoryChangeFlag } = {} } = payload;
    if (supplierCategoryChangeFlag) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.common.classfiy.repeatMsg')
          .d('当前为公司级供应商信息变更，供应商分类变更会同步至全集团，请确认是否变更'),
        onOk: () => {
          handleSubmit(payload);
        },
      });
    } else {
      handleSubmit(payload);
    }
  };

  // 提交
  const handleSubmit = useCallback((saveParam = {}) => {
    return new Promise(resolve => {
      setLoading(true);
      submitApplication(saveParam)
        .then(async res => {
          if (getResponse(res)) {
            if (res.reqStatus === 'FAIL') {
              // 报错了显示出申诉按钮
              if (res.code === 'authentication.failed.notknown.firm') {
                setAppealBtnFlag(true);
              }
              notification.error({ description: res.remark });
              await handleQuery({ investigQueryFlag: true });
            } else {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sslm/enterprise-inform-change-new/list',
                })
              );
            }
            resolve(true);
          } else {
            // 避免saga调用失败造成回滚版本号变化，提交失败进行一次数据刷新
            await handleQuery({ investigQueryFlag: true });
            resolve(true);
          }
        })
        .finally(() => setLoading(false));
    });
  }, []);

  // 删除回调
  const handleDelete = useCallback(() => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      onOk: () => {
        return new Promise(resolve => {
          setLoading(true);
          const payload = {
            changeReqIdList: [changeReqId],
          };
          deleteApplication(payload)
            .then(res => {
              if (getResponse(res)) {
                resolve(true);
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: '/sslm/enterprise-inform-change-new/list',
                  })
                );
              } else {
                resolve(false);
              }
            })
            .finally(() => setLoading(false));
        });
      },
    });
  }, [changeReqId]);

  // 申诉
  const handleAppeal = useCallback(() => {
    const appealDs = new DataSet(getAppealDS());
    const currentRecord = appealDs.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.enterpriseInform.model.view.appealReasonB').d('申诉原因'),
      okFirst: true,
      okText: intl.get('sslm.enterpriseInform.button.submit').d('提交'),
      children: (
        <Fragment>
          <Alert
            banner
            showIcon
            closable
            type="info"
            iconType="help"
            message={intl
              .get('sslm.enterpriseInform.view.alert.createWarning')
              .d('如您对审批拒绝的原因有疑义可提出申诉，提交后将转至人工审批，需等待0-1个工作日。')}
          />
          <Form record={currentRecord} labelLayout="float">
            <TextArea name="appealReason" />
          </Form>
        </Fragment>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await currentRecord.validate();
          const payload = await getSaveParams();
          if (validateFlag && !isEmpty(payload)) {
            const data = currentRecord.toJSONData();
            const { appealReason } = data;
            const { firmChangeReq = {} } = payload;
            const saveParam = {
              ...payload,
              firmChangeReq: {
                ...firmChangeReq,
                appealReason,
                isAppeal: 1,
              },
            };
            const result = await handleCheckBankInfo({ saveParam });
            resolve(result);
          } else {
            resolve(false);
          }
        }),
    });
  }, [changeReqId]);

  // 查看变更内容
  const handleViewUpdate = (viewUpdateFlag = false) => {
    // 已经激活的按钮再次点击无效果
    if (viewUpdateFlag === viewUpdate) {
      return;
    }
    handleOnlyUpdateQuery({ operateType: !viewUpdateFlag ? '' : 'MODIFY' });
  };

  // 查询变更后数据
  const handleOnlyUpdateQuery = async ({ operateType } = {}) => {
    try {
      setLoading(true);
      const panelList = getPanelList({
        remote,
        isAllPlatform,
        partnerTenantId,
        readOnlyFlag: true,
        operateType,
        configNames,
        personalFlag: domesticForeignRelation === 2,
        temptConfig: templateConfig,
        changeReqId,
        cusCodeSuorce: 'function',
      });
      await Promise.all(
        panelList.map(item => {
          const { dataSet } = item;
          dataSet.setState('dsState', headerInfo);
          return dataSet.query();
        })
      );
      // 查询报错不执行下边代码
      // 获取变更后激活的第一个key
      const activeKey = isEmpty(panelList) ? '' : panelList[0].key;
      setViewUpdate(!viewUpdate);
      setEnterpriseBasicPanels(panelList);
      // eslint-disable-next-line no-unused-expressions
      enterpriseBasicRef.current && enterpriseBasicRef.current.setActiveKey(activeKey);
    } finally {
      setLoading(false);
    }
  };

  const ViewUpdateBtn = () => {
    return !isEdit ? (
      <Spin spinning={loading} wrapperClassName={styles['enterprise-info-header-center-btn']}>
        <div className={!viewUpdate ? styles.active : ''} onClick={() => handleViewUpdate(false)}>
          <span>{intl.get('sslm.enterpriseInform.button.viewAllInfo').d('展示全部内容')}</span>
        </div>
        <div className={viewUpdate ? styles.active : ''} onClick={() => handleViewUpdate(true)}>
          <span>{intl.get('sslm.enterpriseInform.button.onlyViewUpdate').d('仅展示变更内容')}</span>
        </div>
      </Spin>
    ) : null;
  };

  return (
    <Fragment>
      <Header
        title={getHeaderTitle(status)}
        backPath={hiddenBackPath ? '' : '/sslm/enterprise-inform-change-new/list'}
      >
        <HeaderBtns
          isEdit={isEdit}
          remote={remote}
          loading={loading}
          changeReqId={changeReqId}
          showAppealBtn={showAppealBtn}
          onSave={handleSave}
          onAppeal={handleAppeal}
          onDelete={handleDelete}
          onSubmit={handleCheckSubmit}
        />
        <ViewUpdateBtn />
      </Header>
      {!isEdit ? (
        <Alert
          banner
          showIcon
          closable
          type="info"
          iconType="help"
          message={intl
            .get('sslm.enterpriseInform.view.message.readOnlyTips')
            .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
          className={styles['enterprise-info-detail-alert-banner']}
        />
      ) : null}
      <Content wrapperClassName={styles['enterprise-info-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              customizeForm={customizeForm}
              custLoading={custLoading}
              isEdit={isEdit}
              viewUpdate={viewUpdate}
              code={isAllPlatform ? '' : 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.HEADER'}
            />
            <EnterpriseBasicInfo
              remote={remote}
              isAllPlatform={isAllPlatform}
              partnerTenantId={partnerTenantId}
              headerInfo={headerInfo}
              mustLineTabObj={mustLineTabObj}
              panelList={enterpriseBasicPanels}
              ref={enterpriseBasicRef}
              customizeTabPane={customizeTabPane}
              customizeForm={customizeForm}
              customizeTable={customizeTable}
              custConfig={custConfig}
              getFieldProps={getFieldProps}
              isEdit={isEdit}
              handleFieldRender={handleFieldRender}
              changeReqId={changeReqId}
              pageSource="enterpriseInform"
              tabCode={
                isAllPlatform
                  ? 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL_PLATFORM.TABS'
                  : 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BASIC_TABS'
              }
            />
            <Investiga
              headerInfo={headerInfo}
              changeReqId={changeReqId}
              partnerTenantId={partnerTenantId}
              investigRef={investigRef}
              getFieldProps={getFieldProps}
              isEdit={isEdit}
              viewUpdate={viewUpdate}
              templateConfig={templateConfig}
            />
            <AttachmentInfo dataSet={headerDs} isEdit={isEdit} viewUpdate={viewUpdate} />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

const DetailWrapper = props => {
  const { partnerTenantNum } = props;
  const Wrapper = compose(
    formatterCollections({
      code: [
        'sslm.common',
        'sslm.enterpriseInform',
        'sslm.supplierInform',
        'sslm.supplierDetail',
        'hptl.portalAssign',
        'spfm.enterprise',
        'spfm.address',
        'spfm.certificationApproval',
        'spfm.bank',
      ],
    }),
    withCustomize({
      unitCode: [
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.HEADER',
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS', // 登记信息 （境内外）
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL', // 登记信息（个人）
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BUSINESS_INFO', // 业务信息
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.ADDRESS', // 地址
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BANK', // 银行
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.CONTACT', // 联系人
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.INVOICE', // 开票
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.FINANCIAL', // 财务
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT', // 附件
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.CLASSIFY', // 分类
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.OTHER_INFO', // 其他信息
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BASIC_TABS', // 基本信息-tab页
        'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL_PLATFORM.TABS', // 平台级变更-tab页
      ],
      manualQuery: true,
    }),
    remotes({
      code: 'SSLM_ENTERPRISE_INFO_NEW_DETAIL',
      name: 'remote',
      tenantNum: partnerTenantNum,
    })
  )(Detail);
  return <Wrapper {...props} />;
};

export default DetailWrapper;
