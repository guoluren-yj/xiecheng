/*
 * ContractReview - 合同审查
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { compose, split, isFunction } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { Button, useDataSet, Spin, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { queryShareEditConfig, getExtractConfig } from '@/services/workspaceService';
import {
  fetchHeader,
  generateSmartReview,
  updateReviewProgressFlag,
} from '@/services/contractCommonService';
import { submit } from '@/services/contractMaintainService';
import { getIndexDS } from '@/routes/components/SmartReview/stores/indexDS';
import { editCustomCode } from '@/utils/enum';

// import { getHeaderDs } from "./stores/getHeaderDS";
// import { getReviewRuleDs } from "./stores/getReviewRuleDS";
import ContractWpsInfo from './components/ContractWpsInfo';
import ContractReviewInfo from './components/ContractReviewInfo';

import styles from './styles.less';

const attachmentList = ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT']; // 合同性质为附件合同集合
const customizeUnitCode = `SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.SUBJECT,SPCM.WORKSPACE_DETAIL.STAGE,SPCM.WORKSPACE_DETAIL.PARTNER,SPCM.WORKSPACE_DETAIL.BUSINESSTERMS,SPCM.WORKSPACE_DETAIL.REBATE,${Object.values(
  editCustomCode
).toString()}`;

const Index = ({
  dispatch,
  match: {
    params: { pcHeaderId },
  },
  location,
  customizeForm,
}) => {
  const editorOnlineRef = useRef(null); // wps组件ref
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const {
    pathParam,
    from,
    itemKey,
    coordinatedFlag = null,
    notExtractFlag = '0',
    notCompareFlag = '0',
  } = routerParams || {};

  // 审查信息ds
  const reviewInfoDs = useDataSet(() => getIndexDS({ pcHeaderId, isEdit: false }), [pcHeaderId]);

  const [loading, setLoading] = useState(false);
  const [showWpsFlag, setWpsFlag] = useState(false);
  const [state, setState] = useState({
    headerInfo: {},
    enableSmartContract: false, // 是否开启【智能合同提取控制】
    enableOnlineAttachmentContract: false, // 是否在【附件合同在线编辑白名单】
    enableTemplateEdit: null, // 是否允许编辑模板阶段
    enableEditShare: null, // 是否启用在线编辑协同
    onlyEditReplaceWildcardBefore: null, // 是否仅编辑通配符替换前的文件
    enableSmartOrOnlineEditFlag: false, // 启用【智能合同提取控制】或者在【附件合同在线编辑白名单】附件合同可编辑
  });

  const { headerInfo, enableSmartOrOnlineEditFlag } = state;
  const { pcKindCode } = headerInfo || {};

  const attachmentContractEditFlag =
    enableSmartOrOnlineEditFlag && attachmentList.includes(pcKindCode);

  // 整合state
  const setAllState = useCallback(
    (newState) => {
      setState((prevState) => ({ ...prevState, ...newState }));
    },
    [setState]
  );

  useEffect(() => {
    // 设置默认查询条件
    initDefaultQueryParam();
    queryAllInfo();
  }, [pcHeaderId]);

  // 生成审查信息
  const handleGenerateReviewInfo = async () => {
    const payload = {
      pcHeaderId,
      ignoreSmartFlag: !!Number(notExtractFlag),
      ignoreSmartCompareFlag: !!Number(notCompareFlag),
    };
    const res = await generateSmartReview(payload);
    if (getResponse(res)) {
      await reviewInfoDs.query();
    }
  };

  // 设置默认查询条件
  const initDefaultQueryParam = () => {
    reviewInfoDs.setQueryParameter('queryParams', {
      sortField: 'riskLevel',
      ignoreFlag: 0,
    });
  };

  // 查询所有
  const queryAllInfo = () => {
    setLoading(true);
    setWpsFlag(false);
    Promise.all([
      fetchExtractConfig(),
      fetchShareEditConfig(),
      queryHeaderInfo(),
      reviewInfoDs.query(),
    ])
      .then(() => {
        setWpsFlag(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 获取配置表是否开启【智能合同提取控制】、是否在【附件合同在线编辑白名单】
  const fetchExtractConfig = async () => {
    return getExtractConfig().then((res) => {
      if (getResponse(res)) {
        const { enableSmartContract, enableOnlineAttachmentContract } = res;
        setAllState({
          enableSmartContract,
          enableOnlineAttachmentContract,
          // 启用【智能合同提取控制】或者在【附件合同在线编辑白名单】附件合同可编辑
          enableSmartOrOnlineEditFlag: enableOnlineAttachmentContract || enableSmartContract,
        });
      }
    });
  };

  // 在线编辑共享配置
  const fetchShareEditConfig = async () => {
    return queryShareEditConfig().then((res) => {
      if (getResponse(res)) {
        const { enableTemplateEdit, enableEditShare, onlyEditReplaceWildcardBefore } = res;
        setAllState({
          enableTemplateEdit, // 是否允许编辑模板阶段
          enableEditShare, // 是否启用在线编辑协同
          onlyEditReplaceWildcardBefore, // 是否仅编辑通配符替换前的文件
        });
      }
    });
  };

  // 查询头信息
  const queryHeaderInfo = async () => {
    const payload = {
      pcHeaderId,
      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.HEADER',
    };
    return fetchHeader(payload).then((res) => {
      if (getResponse(res)) {
        setAllState({
          headerInfo: { ...res },
        });
      }
    });
  };

  // 重新审查
  const handleAgainReview = async () => {
    try {
      setLoading(true);
      // 手动保存编辑文档
      if (editorOnlineRef.current && isFunction(editorOnlineRef.current.saveDocument)) {
        // const res = await editorOnlineRef.current.saveDocument({ data: 'saveDocument' });
        // if (!res) {
        //   return false;
        // }
      }
      // 重新审查
      await handleGenerateReviewInfo();
    } finally {
      setLoading(false);
    }
  };

  // 退出审查
  const handleExitReview = async () => {
    // 手动保存编辑文档
    if (editorOnlineRef.current && isFunction(editorOnlineRef.current.saveDocument)) {
      // const res = await editorOnlineRef.current.saveDocument({ data: 'saveDocument' });
      // if (!res) {
      //   return false;
      // }
    }
    return handleBackToOther();
  };

  // 处理点击返回
  const handleBackToOther = async () => {
    // 正常退出，清空审查标识
    const payload = {
      pcHeaderId,
    };
    setLoading(true);
    await updateReviewProgressFlag(payload)
      .then((res) => {
        if (getResponse(res)) {
          const path = getBackPathName() || '';
          const [pathname, search] = split(path, '?');
          dispatch(
            routerRedux.push({
              pathname,
              search: search || '',
            })
          );
        }
      })
      .finally(() => setLoading(false));
  };

  // 返回链接
  const getBackPathName = () => {
    if (!pathParam) {
      return '/spcm/contract-workspace/list';
    }
    // 这里参数是引用采购申请新建的单据存储标的行数据的session Key，返回原页面需要带上，避免数据丢失
    const searchParams = filterNullValueObject({
      from,
      itemKey,
    });
    return `/spcm/contract-workspace/${pathParam}/${pcHeaderId}?${querystring.stringify(
      searchParams
    )}`;
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('spcm.common.view.message.msg.sureSubmit').d('确定要提交该协议吗？'),
      onOk: () => {
        const payload = {
          pcHeaderList: [{ pcHeaderId, tenantId: getCurrentOrganizationId(), workbenchFlag: '1' }],
          customizeUnitCode,
        };
        setLoading(true);
        return submit(payload)
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              if (itemKey) {
                // 清除session
                window.sessionStorage.removeItem(itemKey);
              }
              dispatch(
                routerRedux.push({
                  pathname: '/spcm/contract-workspace/list',
                })
              );
            }
          })
          .finally(() => setLoading(false));
      },
    });
  };

  return (
    <Fragment>
      <Header
        backPath={getBackPathName()}
        customBack={handleBackToOther}
        title={intl.get('spcm.common.view.title.contractReview').d('合同审查')}
      >
        <Button color="primary" icon="check" loading={loading} onClick={() => handleSubmit()}>
          {intl.get('hzero.common.button.submit').d('提交')}
        </Button>
        <Button icon="cancel" funcType="flat" loading={loading} onClick={() => handleExitReview()}>
          {intl.get('spcm.workspace.button.exitReview').d('退出审查')}
        </Button>
        <Button icon="cached" loading={loading} onClick={() => handleAgainReview()} funcType="flat">
          {intl.get('spcm.workspace.button.againReview').d('重新审查')}
        </Button>
      </Header>
      <Content className={styles['spcm-workspace-contract-review-wrapper']}>
        <Spin spinning={loading}>
          <div className={styles['spcm-workspace-contract-review-content']}>
            <div className={styles['contract-review-wps-wrapper']}>
              <ContractWpsInfo
                {...state}
                coordinatedFlag={coordinatedFlag}
                attachmentContractEditFlag={attachmentContractEditFlag}
                showWpsFlag={showWpsFlag}
                onRef={(ref) => {
                  editorOnlineRef.current = ref;
                }}
              />
            </div>
            <div className={styles['contract-review-risk']}>
              <ContractReviewInfo
                customizeForm={customizeForm}
                pcHeaderId={pcHeaderId}
                dataSet={reviewInfoDs}
              />
            </div>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.workspace'],
  }),
  withCustomize({
    unitCode: ['SPCM.WORKSPACE_DETAIL.SMART_REVIEW_C'],
  })
)(Index);
