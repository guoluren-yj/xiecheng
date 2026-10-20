import React, { useState, useEffect } from 'react';
import { Tabs, Spin, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Alert } from 'choerodon-ui';
import classnames from 'classnames';

import { EventManager } from '_utils/utils';
import EditorOnline from '@/routes/components/EditorOnline';
import { ReactComponent as NoData } from '@/assets/no-data.svg';
import IntelligentPreReview from '@/routes/components/IntelligentPreReview/index';

import BasicInfo from './BasicInfo';
import SubjectAndStage from './SubjectAndStage';
import BusinessTermsInfo from './BusinessTerms';
import CreateSteps from '../CreateSteps';

import styles from './index.less';

const { TabPane } = Tabs;

const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';

const ContractExtract = (props) => {
  const {
    editable,
    loading,
    headerFormDs,
    contractStageListProps,
    contractSubjectListProps,
    contractBusinessTermsListProps,
    headerInfoRes,
    onlyEditReplaceWildcardBefore,
    enableEditShare,
    isView,
    enableTemplateEdit,
    coordinatedFlag,
    handleSwitchModeTab,
    remoteWorkDetail,
    pcKindAttachList,
    showCreateSteps = false,
    onPreTextBack = () => {},
    showContractTextMode = false,
    intelligent,
    isRejectEdit,
    aiApproveParam = {},
  } = props;
  const {
    pcStatusCode,
    pcHeaderId,
    pcHeaderWorkbenchPreTextFlag,
    pcKindCode,
    pcHeaderBackContractCompareFlag,
    pcHeaderEditArea,
  } = headerInfoRes || {};
  const [activeKey, setActiveKey] = useState('baseInfo');

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const closeLineModal = () => {
    Modal.destroyAll();
  };

  useEffect(() => {
    EventManager.on('SPCM_CLOSE_LINE_MODAL', closeLineModal);
    return () => {
      EventManager.off('SPCM_CLOSE_LINE_MODAL', closeLineModal);
    };
  }, []);

  // 分屏模式下，审批拒绝/拒绝生效状态的非附件合同，开启在线编辑配置，文本创建时展示图片，
  const showSvgFlag =
    intelligent &&
    isRejectEdit &&
    !pcKindAttachList.includes(pcKindCode) &&
    enableEditShare === '1' &&
    pcHeaderBackContractCompareFlag !== '1';
  // 分屏模式下，开启在线编辑，驳回拟制状态,不是预文本状态
  const rejectTextCteateFlag =
    enableEditShare === '1' && isRejectEdit && pcHeaderWorkbenchPreTextFlag !== '1';
  const comparePermissionCode =
    enableTemplateEdit === '1' && !isView && coordinatedFlag !== '1' ? 'EDIT' : 'VIEW';

  const oldPermissionCode =
    (enableEditShare === '1' || intelligent) &&
    !isView &&
    ((enableTemplateEdit === '1' && pcHeaderWorkbenchPreTextFlag !== '1') ||
      (pcHeaderWorkbenchPreTextFlag === '1' && onlyEditReplaceWildcardBefore !== '1')) &&
    coordinatedFlag !== '1'
      ? 'EDIT'
      : 'VIEW';

  const businessTermsFlag = remoteWorkDetail
    ? remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_BUSINESSTERMSFLAG',
        pcHeaderId && !pcKindAttachList?.includes(pcKindCode),
        {
          ...contractBusinessTermsListProps,
          pcHeaderId,
          pcKindCode,
        }
      )
    : pcHeaderId && !pcKindAttachList?.includes(pcKindCode);

  const oldPageEdit = ['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(pcStatusCode);
  // 附件合同不限制单据状态
  const intelligentContractPageEdit = showContractTextMode;
  const isOtherPageEdit = oldPageEdit || intelligentContractPageEdit;

  // 审批拒绝的场景额外参数
  const rejectTextCteateExtParams = {
    // 开启协同，不是只读模式，模板阶段并且允许模板编辑/不为模板阶段，未完成协同可以编辑
    // 预文本阶段，配置表《在线编辑共享配置》中“仅编辑通配符替换前的文件”字段值onlyEditReplaceWildcardBefore=1（启用），不允许编辑；=禁用/空，允许编辑
    permissionCode: comparePermissionCode,
    pcHeaderWorkbenchPreTextFlag: '1',
    fileFlag: pcHeaderEditArea || '0',
  };

  const oldExtParams = {
    permissionCode: oldPermissionCode,
    pcHeaderWorkbenchPreTextFlag,
    isNewAPIUrlFlag:
      onlyEditReplaceWildcardBefore === '1' &&
      enableEditShare === '1' &&
      ['SUBMITTED', 'APPROVAL_PENDING'].includes(pcStatusCode),
    headerInfo: headerInfoRes,
  };

  const extParams = rejectTextCteateFlag ? rejectTextCteateExtParams : oldExtParams;

  return (
    <>
      <IntelligentPreReview {...aiApproveParam} />
      <Alert
        message={intl
          .get('spcm.common.view.message.title.positionFlag')
          .d('点击提取内容前的标识可定位合同对应位置')}
        type="info"
        showIcon
        closable
      />
      <div className={classnames('page-content-wrap', styles.extractWrapper)}>
        <div className={classnames('page-content', styles.fileContent)}>
          <Spin spinning={loading}>
            {showSvgFlag ? (
              <div className={styles['spcm-workSpace-no-file']}>
                <NoData />
                <span className={styles['text-title']}>
                  {intl.get('spcm.workspace.view.message.createText').d('文本创建')}
                </span>
                <span className={styles['text-title-tips']}>
                  {intl
                    .get('spcm.workspace.view.message.createTextTips')
                    .d('请点击上方"文本创建"按钮，创建合同文本')}
                </span>
              </div>
            ) : (
              <>
                {showCreateSteps && (
                  <div className={styles['intelligent-steps']}>
                    <CreateSteps
                      pcHeaderWorkbenchPreTextFlag={pcHeaderWorkbenchPreTextFlag || '0'}
                      onlyEditReplaceWildcardBefore={onlyEditReplaceWildcardBefore || '0'}
                      onPreTextBack={onPreTextBack}
                    />
                  </div>
                )}
                <EditorOnline
                  menuCode={CONTRACT_WORKSPACE_MAINTAIN}
                  onRef={(node) => {
                    props.onRef(node);
                  }}
                  handleSwitchModeTab={handleSwitchModeTab}
                  // 是否是工作台标识,默认只有工作台使用这个组件
                  isContratWorkspace
                  isOtherPageEdit={isOtherPageEdit}
                  pcHeaderId={pcHeaderId}
                  {...extParams}
                  iframeStyle={{
                    width: '100%',
                    height: 'calc(100vh - 125px)',
                  }}
                />
              </>
            )}
          </Spin>
        </div>
        <div className={classnames('page-content', styles.contractContent)}>
          <Spin spinning={loading}>
            <Tabs activeKey={activeKey} onChange={handleTabChange}>
              <TabPane
                forceRender
                key="baseInfo"
                tab={intl.get('spcm.workspace.view.title.baseInfo').d('基础信息')}
              >
                <BasicInfo {...props} />
              </TabPane>
              <TabPane
                forceRender
                key="subjectAndStage"
                tab={intl.get('spcm.workspace.view.title.subjectAndStage').d('标的和阶段')}
              >
                <SubjectAndStage
                  editable={editable}
                  headerFormDs={headerFormDs}
                  contractSubjectListProps={contractSubjectListProps}
                  contractStageListProps={contractStageListProps}
                />
              </TabPane>
              {businessTermsFlag && (
                <TabPane
                  forceRender
                  key="businessTermsInfo"
                  tab={intl.get('spcm.workspace.view.title.businessTermsInfo').d('业务条款')}
                >
                  <BusinessTermsInfo
                    editable={editable}
                    contractBusinessTermsListProps={contractBusinessTermsListProps}
                  />
                </TabPane>
              )}
            </Tabs>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default ContractExtract;
