/* eslint-disable react-hooks/exhaustive-deps */

import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import { isEmpty, isArray } from 'lodash';
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
import { queryRoleAuthority } from '@/services/materialFeedbackService';
// import Anchor from '../components/Anchor';
import { getCuszTemplate } from '@/utils/api';
import { headerInfoDS, detailInfoDS, stageInfoDS, sampleInfoDS } from '../stores/detailDs';

export const Store = createContext();

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const unitCodes = [
  'SMDM_ITEM_FEEDBACK_DETAIL.BASEINFO', // 基本信息
  'SMDM_ITEM_FEEDBACK_DETAIL.DETAILINFO', // 明细信息
  'SMDM_ITEM_FEEDBACK_DETAIL.STAGEINFO', // 阶段信息
  'SMDM_ITEM_FEEDBACK_DETAIL.SAMPLE', // 样品信息
  'SMDM_ITEM_FEEDBACK_DETAIL.HEADER_BUTTONS', // 头按钮组
];

const StoreProvider = function StoreProvider(props) {
  const {
    node,
    source,
    onLoad,
    cuxDom,
    history,
    location,
    children,
    readOnly,
    pubPathFlag,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    customizeCollapse,
    queryUnitConfig,
    isPrequalification,
    queryTemplateConfig,
    itemAuthFeeHeaderId,
    remote,
  } = props;

  const {
    renderAttachColumns,
    handleWorkFlowCheck,
    renderApproveBaseInfo,
    renderApproveDetailColumns,
    renderApproveStageColumns,
    renderCuxHeaderButtons,
  } = remote.props.process;
  const userId = getCurrentUserId();
  const organizationId = getCurrentOrganizationId();
  const unitCode = unitCodes.join(',');
  const [init, setInit] = useState(false);
  const [nodeList, setNodeList] = useState([]);
  const [queryFlag, setQueryFlag] = useState(0);
  const [operateFlag, setOperateFlag] = useState(0);
  const [nodeSkipFlag, setNodeSkipFlag] = useState(0);
  const [testingResultEnterFlag, setTestingResultEnterFlag] = useState(0); // 反馈后是否录入检测结果标识
  const [templateInfo, setTemplateInfo] = useState({});
  const [sourcePlatform, setSourcePlatform] = useState('SRM');
  const [authFeeStatusCode, setAuthFeeStatusCode] = useState('WAIT_FEEDBACK');

  const stageListDs = useDataSet(
    () =>
      stageInfoDS({
        itemAuthFeeHeaderId,
      }),
    [itemAuthFeeHeaderId, readOnly, nodeList, templateInfo]
  );

  const detailInfoProps = useMemo(()=>remote
  ?remote.process("SMDM_ITEMCAFB_REMOTE_DETAIL_LIST_DS_PROPS",detailInfoDS({itemAuthFeeHeaderId}),{readOnly})
  : detailInfoDS({itemAuthFeeHeaderId}),[itemAuthFeeHeaderId, readOnly]);
  const detailListDs = useDataSet(
    () =>detailInfoProps,
    [itemAuthFeeHeaderId, readOnly, nodeList, templateInfo,detailInfoProps]
  );

  const sampleInfoDs = useDataSet(
    () =>
      sampleInfoDS({
        itemAuthFeeHeaderId,
      }),
    [itemAuthFeeHeaderId, readOnly, nodeList, templateInfo]
  );

  const headerDs = useDataSet(
    () =>
      headerInfoDS({
        itemAuthFeeHeaderId,
      }),
    [itemAuthFeeHeaderId, organizationId, readOnly, nodeList, templateInfo]
  );

  const header = headerDs.current;

  // 获取阶段数据
  const getNodeList = () => {
    queryRoleAuthority(itemAuthFeeHeaderId, isPrequalification).then((res) => {
      if (getResponse(res)) {
        const currentNode = [...res].find((ele) => ele.nodeCode === node) || {};
        setQueryFlag(currentNode?.queryFlag);
        setOperateFlag(currentNode?.operateFlag);
        setTestingResultEnterFlag(currentNode?.testingResultEnterFlag || 0);
        if (currentNode?.queryFlag || pubPathFlag) {
          initCustomizeTemplate();
        }
        if (!currentNode?.queryFlag && !pubPathFlag) {
          notification.error({
            message: intl
              .get(`${commonPrompt}.nodeNoQueryFlagTip`)
              .d(
                `数据查询失败，失败原因是“没有该单据【${currentNode?.nodeCodeMeaning}】的查询权限，导致无法查询数据，请在策略配置中检查权限后再执行该操作”`
              ),
          });
        }
        setNodeList(res);
      }
    });
  };

  // 更新页面信息
  const commonUpdate = useCallback(() => {
    if (itemAuthFeeHeaderId) {
      headerDs.query().then((res) => {
        if (getResponse(res)) {
          setAuthFeeStatusCode(res?.authFeeStatusCode);
          setSourcePlatform(res?.sourcePlatform);
          setNodeSkipFlag(res?.nodeSkipFlag);
          // 给行信息附加头信息的一些状态
          detailListDs.setState('sourcePlatform', res?.sourcePlatform);
          detailListDs.setState('headerDs', headerDs);
        }
      });
      if (cuxDom) {
        /* eslint-disable no-unused-expressions */
        headerDs?.current?.set({ cuxAttributeDom: cuxDom });
      }
      if (testingResultEnterFlag === 1) {
        sampleInfoDs.query();
      }
      detailListDs.query();
      stageListDs.query();
    }
  }, [
    itemAuthFeeHeaderId,
    stageListDs,
    detailListDs,
    testingResultEnterFlag,
    sampleInfoDs,
    headerDs,
  ]);

  // 获取头信息
  const getHeaderInfo = async () => {
    const errorMessage = [];
    const headerFlag = await headerDs?.validate();

    if (headerFlag) {
      const { adjustValidityDate = {}, validityDate = {}, ...other } = header?.toData() || {};
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

  // 获取基础信息
  const getDetailInfo = async () => {
    const errorMessage = [];
    const lineFlag = await detailListDs.validate();

    if (lineFlag) {
      return {
        itemAuthFeeLineVOList: detailListDs.toData(),
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
        itemAuthFeeHeaderAttVOList: stageListDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.materialCA.nodeInfo`).d('阶段附件信息'));
      return errorMessage;
    }
  };

  // 获取样品信息
  const getSampleInfo = async () => {
    const errorMessage = [];
    const lineFlag = await sampleInfoDs.validate();

    if (lineFlag) {
      return {
        itemAuthFeeSampleVOList: sampleInfoDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.materialCA.sampleInfo`).d('样品信息'));
      return errorMessage;
    }
  };

  // 获取页面单据信息
  const handleGetInfo = useCallback(async () => {
    const errorTipMsg = [];
    const headerInfo = await getHeaderInfo();
    const detailInfo = await getDetailInfo();
    const stageInfo = await getStageInfo();
    const sampleInfo = await getSampleInfo();

    if (isArray(headerInfo)) errorTipMsg.push(...headerInfo);

    if (isArray(detailInfo)) errorTipMsg.push(...detailInfo);

    if (isArray(stageInfo)) errorTipMsg.push(...stageInfo);

    if (isArray(sampleInfo)) errorTipMsg.push(...sampleInfo);

    if (errorTipMsg.length === 0) {
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
  }, [header]);

  const queryCuszFunc = (templateInfoRes) => {
    const { templateCode, templateVersion, useTemplateCusz } = templateInfoRes;
    if (useTemplateCusz) {
      const newTemplateInfo = {
        cuszTplTemplateCode: templateCode,
        cuszTplVersion: templateVersion,
        cuszTplStageCode: isPrequalification
          ? 'PREQUALIFICATION'
          : pubPathFlag
          ? 'APPROVEING'
          : source === 'feedback'
          ? 'FEEDBACK'
          : 'PENDING',
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
        setInit(false);
      });
    } else {
      return queryUnitConfig(undefined, undefined, unitCodes).then(() => {
        setTemplateInfo({});
        setInit(false);
      });
    }
  };

  // 初始化模版
  const initCustomizeTemplate = () => {
    setInit(true);
    getCuszTemplate({
      templateCuszMethodCode: 'SMDM_ITEM_AUTH_FEE_CUSZ_TEMPLATE',
      businessParam: { itemAuthFeeHeaderId },
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
      userId,
      organizationId,
      history,
      location,
      readOnly,
      source,
      onLoad,
      pubPathFlag,
      cuxDom,
      itemAuthFeeHeaderId,
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
      unitCode,
      nodeList,
      queryFlag,
      operateFlag,
      nodeSkipFlag,
      testingResultEnterFlag,
      templateInfo,
      sourcePlatform,
      authFeeStatusCode,
      isPrequalification,
      setNodeList,
      handleGetInfo,
      commonUpdate,
      remotes:remote,
      renderAttachColumns,
      handleWorkFlowCheck,
      renderApproveBaseInfo,
      renderApproveDetailColumns,
      renderApproveStageColumns,
      renderCuxHeaderButtons,
    };
  }, [
    node,
    userId,
    remote,
    organizationId,
    history,
    location,
    readOnly,
    source,
    onLoad,
    pubPathFlag,
    cuxDom,
    itemAuthFeeHeaderId,
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
    unitCode,
    nodeList,
    queryFlag,
    operateFlag,
    nodeSkipFlag,
    testingResultEnterFlag,
    templateInfo,
    sourcePlatform,
    authFeeStatusCode,
    isPrequalification,
    setNodeList,
    handleGetInfo,
    commonUpdate,
    renderAttachColumns,
    handleWorkFlowCheck,
    renderApproveBaseInfo,
    renderApproveDetailColumns,
    renderApproveStageColumns,
    renderCuxHeaderButtons,
  ]);

  useEffect(() => {
    if (itemAuthFeeHeaderId) {
      getNodeList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, source, node, itemAuthFeeHeaderId, pubPathFlag, isPrequalification]);

  // 初始化数据
  useEffect(() => {
    if (nodeList?.length && !init && !!(queryFlag || pubPathFlag)) {
      if (pubPathFlag) {
        headerDs.setQueryParameter('workflowFlag', 1);
        detailListDs.setQueryParameter('workflowFlag', 1);
        stageListDs.setQueryParameter('workflowFlag', 1);
        sampleInfoDs.setQueryParameter('workflowFlag', 1);
      }

      headerDs.setQueryParameter('customizeUnitCode', unitCodes[0]);
      detailListDs.setQueryParameter('customizeUnitCode', unitCodes[1]);
      stageListDs.setQueryParameter('customizeUnitCode', unitCodes[2]);
      sampleInfoDs.setQueryParameter('customizeUnitCode', unitCodes[3]);

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
    stageListDs,
    sampleInfoDs,
    headerDs,
    commonUpdate,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default remote(
  {
    code: 'SMDM_ITEMCAFB_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      renderAttachColumns: undefined,
      handleWorkFlowCheck: undefined,
      renderApproveBaseInfo: undefined,
      renderApproveDetailColumns: undefined,
      renderApproveStageColumns: undefined,
      renderCuxHeaderButtons: undefined,
    },
    events:{
      cuxHanldeWorkFlowSave:()=>{}, // 审批流增加二开保存事件
    }
  }
)(observer(StoreProvider));
