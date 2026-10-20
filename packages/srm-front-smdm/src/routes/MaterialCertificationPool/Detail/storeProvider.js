/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import { isEmpty, isArray, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
  // getCurrentTenant,
} from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
import { queryRoleAuthority } from '@/services/materialCertificationPoolService';
// import Anchor from '../components/Anchor';
import { getCuszTemplate } from '@/utils/api';
import { headerInfoDS, detailInfoDS, stageInfoDS, sampleInfoDS } from '../stores/detailDs';

export const Store = createContext();

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const editUnitCode = [
  // 认证中
  'SMDM.ITEM_PENDING_AUTH.DETAIL_BASEINFO', // 基本信息0
  'SMDM.ITEM_PENDING_AUTH.DETAIL_LINEINFO', // 明细信息1
  'SMDM.ITEM_PENDING_AUTH.DETAIL_STAGEINFO', // 阶段信息2
  'SMDM.ITEM_PENDING_AUTH.DETAL_SAMPLE', // 样品信息3
  'SMDM.ITEM_PENDING_AUTH.DETAIL_HEADBTN', // 头按钮组4
  'SMDM.ITEM_PENDING_AUTH.DETAIL_BTN', // 编辑页面的头按钮组5
  'SMDM.ITEM_PENDING_AUTH.DETAIL_LINE_BTN', // 编辑页面的行按钮组6
  'SMDM.ITEM_PENDING_AUTH.DETAIL_STAGE_BTN', // 编辑页面的阶段行按钮组7
  'SMDM.ITEM_PENDING_AUTH.DETAL_SAMPLE_BTN', // 8
  'SMDM.ITEM_PENDING_AUTH.COLLAPSE', // 编辑界面的折叠面板9
];

const modalUnitCode = [
  'SMDM.ITEM_PENDING_AUTH.EARLYEND_MODAL',
  'SMDM.ITEM_PENDING_AUTH.CANCEL_MODAL',
  'SMDM.ITEM_PENDING_AUTH.SKIP_MODAL',
];

const readUnitCode = [
  // 已认证，预审中，审批中，
  'SMDM.ITEM_CERTIFIED.DETAIL_BASEINFO', // 基本信息0
  'SMDM.ITEM_CERTIFIED.DETAIL_LINEINFO', // 明细信息1
  'SMDM.ITEM_CERTIFIED.DETAIL_STAGEINFO', // 阶段信息2
  'SMDM.ITEM_CERTIFIED.DETAIL_SAMPLE', // 样品信息3
  'SMDM.ITEM_CERTIFIED.HEAD_BTN', // 头按钮组4
  'SMDM.ITEM_PENDING_AUTH.DETAIL_BTN', // 页面的行按钮组5
  'SMDM.ITEM_PENDING_AUTH.DETAL_SAMPLE_BTN', // 6
  'SMDM.ITEM_CERTIFIED.COLLAPSE', // 界面的折叠面板7
];

const StoreProvider = function StoreProvider(props) {
  const {
    node,
    source,
    cuxDom,
    history,
    children,
    readOnly,
    pubPathFlag,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    customizeCollapse,
    queryUnitConfig,
    queryTemplateConfig,
    itemAuthReqHeaderId,
    remote,
    location,
  } = props;
  const {
    cuxButtonsListFc,
    processStageDsProps,
    renderAttachColumns,
    handleWorkFlowCheck,
    renderApproveBaseInfo,
    renderApproveDetailColumns,
    renderApproveStageColumns,
    detailListTimeLimit,
    submitParams,
    setHeaderDefaultValue,
    handleCuxRequired,
    handleCuxSubmitCheck,
    handleCuxTextResultSubmit,
  } = remote?.props?.process || {};
  const userId = getCurrentUserId();
  const organizationId = getCurrentOrganizationId();
  const [init, setInit] = useState(false);
  const [nodeList, setNodeList] = useState([]);
  const [queryFlag, setQueryFlag] = useState(0);
  const [operateFlag, setOperateFlag] = useState(0);
  const [testingResultEnterFlag, setTestingResultEnterFlag] = useState(0); // 反馈后是否录入检测结果标识
  const [nodeSkipFlag, setNodeSkipFlag] = useState(0);
  const [nodeEarlyTerminationFlag, setNodeEarlyTerminationFlag] = useState(0);
  const [closedFlag, setClosedFlag] = useState(0); // 阶段可关闭
  const [sourcePlatform, setSourcePlatform] = useState('SRM');
  const [authReqStatusCode, setAuthReqStatusCode] = useState('PENDING');
  const [isFirstNode, setIsFirstNode] = useState(true);
  const [latestNode, setLatestNode] = useState(true);
  const [templateInfo, setTemplateInfo] = useState({});
  const unitCode = useMemo(
    () =>
      (pubPathFlag ||
      ['certified', 'canceled', 'prequalification', 'testResultEntry'].includes(source)
        ? readUnitCode
        : editUnitCode
      ).join(','),
    [source, pubPathFlag]
  );

  const stageListDs = useDataSet(() => {
    const normalDsProps = stageInfoDS({
      source,
      itemAuthReqHeaderId,
      isFirstNode,
      readOnly,
      pubPathFlag,
    });
    return isFunction(processStageDsProps) ? processStageDsProps(normalDsProps, {}) : normalDsProps;
  }, [
    itemAuthReqHeaderId,
    readOnly,
    pubPathFlag,
    isFirstNode,
    nodeList,
    templateInfo,
    source,
    processStageDsProps,
  ]); 

  const listDsProps = remote.process("SMDM_ITEMCA_REMOTE_DETAIL_LIST_DS_PROPS",detailInfoDS({
    source,
    itemAuthReqHeaderId,
    isFirstNode,
    readOnly,
    pubPathFlag,
    detailListTimeLimit,
  }),{readOnly})
  const detailListDs = useDataSet(
    () =>listDsProps,
    [itemAuthReqHeaderId, readOnly, pubPathFlag, isFirstNode, nodeList, templateInfo, source]
  );

  const sampleInfoDs = useDataSet(
    () =>
      sampleInfoDS({
        itemAuthReqHeaderId,
        readOnly,
        source,
        pubPathFlag,
      }),
    [itemAuthReqHeaderId, readOnly, pubPathFlag, nodeList, templateInfo, source]
  );

  const headerDs = useDataSet(
    () =>
      headerInfoDS({
        itemAuthReqHeaderId,
        isFirstNode,
        readOnly,
        source,
      }),
    [itemAuthReqHeaderId, organizationId, readOnly, isFirstNode, nodeList, templateInfo, source]
  );

  const header = headerDs.current;

  // 获取阶段数据
  const getNodeList = () => {
    queryRoleAuthority(itemAuthReqHeaderId).then((res) => {
      if (getResponse(res)) {
        const currentNode = [...res].find((ele) => ele.nodeCode === node) || {};
        setQueryFlag(currentNode?.queryFlag);
        setOperateFlag(currentNode?.operateFlag);
        setNodeSkipFlag(currentNode?.nodeSkipFlag);
        setTestingResultEnterFlag(currentNode?.testingResultEnterFlag || 0);
        setNodeEarlyTerminationFlag(currentNode?.nodeEarlyTerminationFlag);
        setClosedFlag(currentNode?.nodeClosedFlag || 0);

        if (currentNode?.queryFlag || pubPathFlag) {
          initCustomizeTemplate();
        }
        if (!currentNode?.queryFlag && !pubPathFlag) {
          notification.error({
            message: intl
              .get(`${commonPrompt}.nodeNoQueryFlagTip`, { value: currentNode?.nodeCodeMeaning })
              .d(
                `数据查询失败，失败原因是“没有该单据【${currentNode?.nodeCodeMeaning}】的查询权限，导致无法查询数据，请在策略配置中检查权限后再执行该操作”`
              ),
          });
        }
        if (res[0]?.nodeCode === node) {
          setIsFirstNode(true);
        } else {
          setIsFirstNode(false);
        }

        if (res[res.findIndex((ele) => ele.nodeCode === node) + 1]?.itemAuthReqHeaderId) {
          setLatestNode(false);
        } else {
          setLatestNode(true);
        }
        setNodeList(res);
      }
    });
  };

  // 更新页面信息
  const commonUpdate = useCallback(() => {
    if (itemAuthReqHeaderId) {
      headerDs.query().then((res) => {
        if (getResponse(res)) {
          setAuthReqStatusCode(res?.authReqStatusCode);
          setSourcePlatform(res?.sourcePlatform);
          if (isFunction(setHeaderDefaultValue)) {
            setHeaderDefaultValue(headerDs, location);
          }
          if (cuxDom) {
            /* eslint-disable no-unused-expressions */
            headerDs?.current?.set({ cuxAttributeDom: cuxDom });
          }
          // 给行信息附加头信息的一些状态
          detailListDs.setState('headerDs', headerDs);
          detailListDs.setState('sourcePlatform', res?.sourcePlatform);
          sampleInfoDs.setState('sourcePlatform', res?.sourcePlatform);
        }
      });
      if (testingResultEnterFlag === 1) {
        sampleInfoDs.query();
      }
      detailListDs.query();
      stageListDs.query();
    }
  }, [
    itemAuthReqHeaderId,
    stageListDs,
    detailListDs,
    sampleInfoDs,
    headerDs,
    testingResultEnterFlag,
    location,
  ]);

  // 获取头信息
  const getHeaderInfo = async () => {
    if (header && header?.status && !readOnly) {
      header.status = 'update';
    }

    const errorMessage = [];
    const headerFlag = await headerDs?.validate();

    if (headerFlag) {
      const { adjustValidityDate = {}, validityDate = {}, ...other } = header.toData();
      return {
        ...other,
        ...adjustValidityDate,
        ...validityDate,
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.materialCA.baseInfo`).d('基本信息'));
      return errorMessage;
    }
  };

  // 获取样品信息
  const getSampleInfo = async () => {
    const errorMessage = [];
    const lineFlag = await sampleInfoDs.validate();

    if (lineFlag) {
      return {
        itemAuthReqSampleVOList: sampleInfoDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.materialCA.sampleInfo`).d('样品信息'));
      return errorMessage;
    }
  };

  // 获取明细信息
  const getDetailInfo = async () => {
    const errorMessage = [];
    const lineFlag = await detailListDs.validate();

    if (lineFlag) {
      return {
        itemAuthReqLineVOList: detailListDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.materialCA.detailInfo`).d('明细信息'));
      return errorMessage;
    }
  };

  // 获取阶段信息
  const getStageInfo = async () => {
    const errorMessage = [];
    const lineFlag = await stageListDs.validate();

    if (lineFlag) {
      return {
        itemAuthReqHeaderAttVOList: stageListDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.materialCA.nodeInfo`).d('阶段附件信息'));
      return errorMessage;
    }
  };

  // 获取页面单据信息
  const handleGetInfo = useCallback(
    async (skipCheckFlag = false) => {
      const errorTipMsg = [];
      const headerInfo = await getHeaderInfo();
      const detailInfo = await getDetailInfo();
      const stageInfo = await getStageInfo();
      const sampleInfo = await getSampleInfo();

      if (isArray(headerInfo)) errorTipMsg.push(...headerInfo);

      if (isArray(detailInfo)) errorTipMsg.push(...detailInfo);

      if (isArray(stageInfo)) errorTipMsg.push(...stageInfo);

      if (isArray(sampleInfo)) errorTipMsg.push(...sampleInfo);

      if (errorTipMsg.length === 0 || skipCheckFlag) {
        return {
          ...headerInfo,
          ...detailInfo,
          ...stageInfo,
          ...sampleInfo,
        };
      } else {
        const allErrorMsg = [];
        const headerError = await header.getValidationErrors();
        const lineError = await detailListDs.getValidationErrors();
        const stageError = await stageListDs.getValidationErrors();
        const sampleError = await sampleInfoDs.getValidationErrors();
        const langUnit = intl.get(`${commonPrompt}.unit`).d('单元');
        const langLine = intl.get(`${commonPrompt}.line`).d('行');
        const theFirst = intl.get(`${commonPrompt}.theFirst`).d('第');

        if (!isEmpty(headerError)) {
          const headerErrorMsg = [];
          const requiredFields = [];
          headerError.forEach((ele) => {
            const item = ele.errors.toJS()[0];
            if (item.ruleName === 'valueMissing') {
              requiredFields.push(`【${item.injectionOptions.label}】`);
            } else {
              headerErrorMsg.push(item.validationMessage);
            }
          });
          if (!isEmpty(requiredFields)) {
            headerErrorMsg.unshift(
              intl
                .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
            );
          }
          allErrorMsg.push(`【${headerInfo[0]}】${langUnit}: ${headerErrorMsg.join('、')}`);
        }

        if (!isEmpty(lineError)) {
          const linesErrorMsg = [];
          lineError.forEach((ele) => {
            const lineErrorMsg = [];
            const requiredFields = [];
            ele.errors.forEach((data) => {
              const item = data.errors.toJS()[0];
              if (item.ruleName === 'valueMissing') {
                requiredFields.push(`【${item.injectionOptions.label}】`);
              } else {
                lineErrorMsg.push(item.validationMessage);
              }
            });
            if (!isEmpty(requiredFields)) {
              lineErrorMsg.unshift(
                intl
                  .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                  .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
              );
            }
            linesErrorMsg.push(
              ele?.record?.get('reqLineNum')
                ? `${intl.get(`${commonPrompt}.lineNum`).d('行号')}【${ele?.record?.get(
                    'reqLineNum'
                  )}】, ${lineErrorMsg.join('')}`
                : ` ${theFirst} ${
                    detailListDs.indexOf(ele.record) + 1
                  } ${langLine} ${lineErrorMsg.join('')}`
            );
          });
          allErrorMsg.push(`【${detailInfo[0]}】${langUnit}: ${linesErrorMsg.join(' ')}`);
        }

        if (!isEmpty(stageError)) {
          const stageErrorMsg = [];
          stageError.forEach((ele) => {
            const lineErrorMsg = [];
            const requiredFields = [];
            ele.errors.forEach((data) => {
              const item = data.errors.toJS()[0];
              if (item.ruleName === 'valueMissing') {
                requiredFields.push(`【${item.injectionOptions.label}】`);
              } else {
                lineErrorMsg.push(item.validationMessage);
              }
            });
            if (!isEmpty(requiredFields)) {
              lineErrorMsg.unshift(
                intl
                  .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                  .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
              );
            }
            stageErrorMsg.push(
              ele?.record?.get('attachmentCode')
                ? `${intl.get(`${commonPrompt}.attachmentCode`).d('附件编码')}【${ele?.record?.get(
                    'attachmentCode'
                  )}】, ${lineErrorMsg.join('')}`
                : ` ${theFirst} ${
                    stageListDs.indexOf(ele.record) + 1
                  } ${langLine} ${lineErrorMsg.join('')}`
            );
          });
          allErrorMsg.push(`【${stageInfo[0]}】${langUnit}: ${stageErrorMsg.join(' ')}`);
        }

        if (!isEmpty(sampleError)) {
          const sampleErrorMsg = [];
          sampleError.forEach((ele) => {
            const lineErrorMsg = [];
            const requiredFields = [];
            ele.errors.forEach((data) => {
              const item = data.errors.toJS()[0];
              if (item.ruleName === 'valueMissing') {
                requiredFields.push(`【${item.injectionOptions.label}】`);
              } else {
                lineErrorMsg.push(item.validationMessage);
              }
            });
            if (!isEmpty(requiredFields)) {
              lineErrorMsg.unshift(
                intl
                  .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                  .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
              );
            }
            sampleErrorMsg.push(
              ele?.record?.get('reqSampleNum')
                ? `${intl.get(`${commonPrompt}.lineNum`).d('行号')}【${ele?.record?.get(
                    'reqSampleNum'
                  )}】, ${lineErrorMsg.join('')}`
                : ` ${theFirst} ${
                    sampleInfoDs.indexOf(ele.record) + 1
                  } ${langLine} ${lineErrorMsg.join('')}`
            );
          });
          allErrorMsg.push(`【${sampleInfo[0]}】${langUnit}: ${sampleErrorMsg.join(' ')}`);
        }

        notification.error({
          message: `${allErrorMsg.join(';')}`,
        });
        return false;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [header]
  );

  const queryCuszFunc = (templateInfoRes) => {
    const { templateCode, templateVersion, useTemplateCusz } = templateInfoRes;
    if (useTemplateCusz) {
      const newTemplateInfo = {
        cuszTplTemplateCode: templateCode,
        cuszTplVersion: templateVersion,
        cuszTplStageCode: pubPathFlag
          ? 'APPROVEING'
          : ['certified', 'canceled', 'prequalification'].includes(source)
          ? source?.toUpperCase()
          : source === 'testResultEntry'
          ? 'TEST_RESULT_ENTRY'
          : 'PENDING_AUTHS',
        cuszTplPageCode: node,
      };

      return queryTemplateConfig(templateInfoRes, {
        stageCode: newTemplateInfo.cuszTplStageCode,
        pageCode: newTemplateInfo.cuszTplPageCode,
      }).then(() => {
        setTemplateInfo({
          ...newTemplateInfo,
          stageCode: newTemplateInfo.cuszTplStageCode,
          pageCode: newTemplateInfo.cuszTplPageCode,
        });
        headerDs.setState('templateInfo', {
          ...newTemplateInfo,
          stageCode: newTemplateInfo.cuszTplStageCode,
          pageCode: newTemplateInfo.cuszTplPageCode,
        });
        setInit(false);
      });
    } else {
      return queryUnitConfig(
        undefined,
        undefined,
        pubPathFlag ||
          ['certified', 'canceled', 'testResultEntry', 'prequalification'].includes(source)
          ? readUnitCode
          : [...editUnitCode, ...modalUnitCode]
      ).then(() => {
        setTemplateInfo({});
        setInit(false);
      });
    }
  };

  // 初始化模版
  const initCustomizeTemplate = () => {
    setInit(true);
    getCuszTemplate({
      templateCuszMethodCode: 'SMDM_ITEM_AUTH_CUSZ_TEMPLATE',
      businessParam: { itemAuthReqHeaderId },
    }).then((templateInfoRes) => {
      if (getResponse(templateInfoRes)) {
        queryCuszFunc(templateInfoRes);
      } else {
        setInit(false);
      }
    });
  };

  const value = useMemo(() => {
    return {
      node,
      cuxDom,
      userId,
      remote,
      organizationId,
      history,
      readOnly,
      unitCode,
      pubPathFlag,
      location,
      itemAuthReqHeaderId,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      customizeCollapse,
      header,
      headerDs,
      stageListDs,
      detailListDs,
      sampleInfoDs,
      init,
      source,
      nodeList,
      isFirstNode,
      latestNode,
      queryFlag,
      operateFlag,
      nodeSkipFlag,
      templateInfo,
      testingResultEnterFlag,
      nodeEarlyTerminationFlag,
      closedFlag,
      sourcePlatform,
      authReqStatusCode,
      setNodeList,
      handleGetInfo,
      commonUpdate,
      renderAttachColumns,
      handleWorkFlowCheck,
      renderApproveBaseInfo,
      renderApproveDetailColumns,
      renderApproveStageColumns,
      submitParams,
      handleCuxRequired,
      handleCuxSubmitCheck,
      handleCuxTextResultSubmit,
      cuxButtonsListFc,
    };
  }, [
    node,
    cuxDom,
    userId,
    remote,
    organizationId,
    history,
    readOnly,
    unitCode,
    pubPathFlag,
    location,
    itemAuthReqHeaderId,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    customizeCollapse,
    header,
    headerDs,
    stageListDs,
    detailListDs,
    sampleInfoDs,
    init,
    source,
    nodeList,
    isFirstNode,
    latestNode,
    queryFlag,
    operateFlag,
    nodeSkipFlag,
    templateInfo,
    testingResultEnterFlag,
    nodeEarlyTerminationFlag,
    closedFlag,
    sourcePlatform,
    authReqStatusCode,
    setNodeList,
    handleGetInfo,
    commonUpdate,
    renderAttachColumns,
    handleWorkFlowCheck,
    renderApproveBaseInfo,
    renderApproveDetailColumns,
    renderApproveStageColumns,
    submitParams,
    handleCuxRequired,
    handleCuxSubmitCheck,
    handleCuxTextResultSubmit,
    cuxButtonsListFc,
  ]);

  useEffect(() => {
    if (itemAuthReqHeaderId) {
      getNodeList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, source, node, itemAuthReqHeaderId, pubPathFlag]);

  useEffect(() => {
    if (nodeList?.length && !init && !!(queryFlag || pubPathFlag)) {
      if (pubPathFlag) {
        headerDs.setQueryParameter('workflowFlag', 1);
        detailListDs.setQueryParameter('workflowFlag', 1);
        stageListDs.setQueryParameter('workflowFlag', 1);
        sampleInfoDs.setQueryParameter('workflowFlag', 1);
      }

      if (
        pubPathFlag ||
        ['certified', 'canceled', 'prequalification', 'testResultEntry'].includes(source)
      ) {
        headerDs.setQueryParameter('customizeUnitCode', readUnitCode[0]);
        detailListDs.setQueryParameter('customizeUnitCode', readUnitCode[1]);
        stageListDs.setQueryParameter('customizeUnitCode', readUnitCode[2]);
        sampleInfoDs.setQueryParameter('customizeUnitCode', readUnitCode[3]);
      } else {
        headerDs.setQueryParameter('customizeUnitCode', editUnitCode[0]);
        detailListDs.setQueryParameter('customizeUnitCode', editUnitCode[1]);
        stageListDs.setQueryParameter('customizeUnitCode', editUnitCode[2]);
        sampleInfoDs.setQueryParameter('customizeUnitCode', editUnitCode[3]);
      }

      Object.keys(templateInfo).forEach((key) => {
        headerDs.setQueryParameter(key, templateInfo[key]);
        detailListDs.setQueryParameter(key, templateInfo[key]);
        stageListDs.setQueryParameter(key, templateInfo[key]);
        sampleInfoDs.setQueryParameter(key, templateInfo[key]);
      });

      commonUpdate();
    }
  }, [
    init,
    templateInfo,
    pubPathFlag,
    queryFlag,
    testingResultEnterFlag,
    nodeList,
    detailListDs,
    sampleInfoDs,
    stageListDs,
    headerDs,
    // commonUpdate,
    source,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
}; 

export default remote(
  {
    code: 'SMDM_ITEMCA_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      processStageDsProps: undefined,
      renderAttachColumns: undefined,
      handleWorkFlowCheck: undefined,
      renderApproveBaseInfo: undefined,
      renderApproveDetailColumns: undefined,
      renderApproveStageColumns: undefined,
      detailListTimeLimit: undefined, // 白家食品二开：添加了此值表示明细列表的送样需求时间没有min限制
      submitParams: undefined, // 博威 新增提交参数
      setHeaderDefaultValue: undefined,
      handleCuxRequired: undefined,
      handleCuxTextResultSubmit: undefined, // 大叶园林：提交埋点。增加二开弹窗校验
      handleCuxSubmitCheck: undefined, // 提交校验
      cuxButtons: undefined,
    },
  }
)(observer(StoreProvider));
