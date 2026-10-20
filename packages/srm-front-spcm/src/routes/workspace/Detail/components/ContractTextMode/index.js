import React from 'react';
import { allSignList } from '@/utils/util';

import CreateSteps from '../CreateSteps';
import TextMode from '../TextMode';
import CompareTextMode from '../CompareTextMode';

const ContractTextMode = (props) => {
  const {
    isChapter,
    isView,
    enableEditShare,
    enableTemplateEdit,
    onlyEditReplaceWildcardBefore,
    intelligent,
    showTextMode,
    handleClickImg,
    skipToSealManage,
    refreshData,
    state,
    handlePreTextBack,
    hiddenReviewResultFlag,
  } = props;
  const {
    pcHeaderId,
    editable,
    coordinateable,
    coordinatedFlag,
    headerInfo,
    isPub,
    historyCompareFlag,
    isTextMode,
    focusStatus,
    queryListLoading,
    pcKindAttachList,
    refreshWpsFlag,
  } = state;

  const {
    pcKindCode,
    pcStatusCode,
    signatureType,
    electricSignFlag: originElectricSignFlag,
    authType,
    electronicSignatureAttachmentDisplayFlag,
    pcHeaderWorkbenchPreTextFlag = null, // 是否预文本阶段
  } = headerInfo;
  const electricSignFlag = Number(originElectricSignFlag);

  const isAttachmentSignUpload =
    signatureType === 'ANNEX_SIGNATURE' && electricSignFlag === 1 && allSignList.includes(authType); // 是否附件签章
  const isAttachmentSignAndText =
    (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType)) ||
    electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章

  const isShowEditOnlineBtns =
    editable && !pcKindAttachList.includes(pcKindCode) && enableEditShare === '1';

  // 是否是驳回拟制
  const isRejectEdit = ['SUPPLIER_REJECTED', 'REJECTED'].includes(pcStatusCode);

  // 协议性质=附件合同（普通）/附件合同（框架）的, 展示附件合同
  const showContractTextMode = showTextMode && pcKindAttachList.includes(pcKindCode);

  return (
    <div
      style={{
        display: isTextMode ? 'block' : 'none',
        width: hiddenReviewResultFlag ? '100%' : '75%',
        transition: 'all 0.3s ease',
      }}
    >
      {isShowEditOnlineBtns && !historyCompareFlag && isTextMode && coordinateable !== '1' && (
        <CreateSteps
          pcHeaderWorkbenchPreTextFlag={pcHeaderWorkbenchPreTextFlag || '0'}
          onlyEditReplaceWildcardBefore={onlyEditReplaceWildcardBefore || '0'}
          onPreTextBack={handlePreTextBack}
        />
      )}
      {isTextMode &&
        !historyCompareFlag &&
        // 开启在线编辑，驳回拟制状态,不是预文本状态
        (enableEditShare === '1' && isRejectEdit && pcHeaderWorkbenchPreTextFlag !== '1' ? (
          <CompareTextMode
            {...props}
            key={hiddenReviewResultFlag ? 'percent100' : 'percent75'}
            showContractTextMode={showContractTextMode}
            enableTemplateEdit={enableTemplateEdit}
            coordinatedFlag={coordinatedFlag}
            onRefreshData={refreshData}
            handleClickImg={handleClickImg}
            focusStatus={focusStatus}
            skipToSealManage={skipToSealManage}
            pcHeaderId={pcHeaderId}
            headerInfo={headerInfo}
            loading={queryListLoading}
            picDataSource={state.picDataSource}
            isSign={isAttachmentSignAndText || !isChapter}
            isAttachmentSignUpload={isAttachmentSignUpload}
            isAttachmentSignAndText={isAttachmentSignAndText}
            refreshWpsFlag={refreshWpsFlag}
            // 不为协同路由或者协同路由并且分配单据模式为1
            // 智能合同提取模式不显示ModeTag
            leftDom={<></>}
          />
        ) : (
          !historyCompareFlag && (
            <TextMode
              {...props}
              key={hiddenReviewResultFlag ? 'textPercent100' : 'textPercent75'}
              showContractTextMode={showContractTextMode}
              isPub={isPub}
              handleClickImg={handleClickImg}
              focusStatus={focusStatus}
              skipToSealManage={skipToSealManage}
              pcHeaderId={pcHeaderId}
              headerInfo={headerInfo}
              picDataSource={state.picDataSource}
              isSign={isAttachmentSignAndText || !isChapter}
              isAttachmentSignUpload={isAttachmentSignUpload}
              isAttachmentSignAndText={isAttachmentSignAndText}
              leftDom={<></>}
              // 开启协同，不是工作流，不是只读模式，模板阶段并且允许模板编辑/不为模板阶段，未完成协同可以编辑
              // 预文本阶段，配置表《在线编辑共享配置》中“仅编辑通配符替换前的文件”字段值onlyEditReplaceWildcardBefore=1（启用），不允许编辑；=禁用/空，允许编辑
              permissionCode={
                (enableEditShare === '1' || intelligent) &&
                ((!isPub && !isView) || // 编辑页面
                  (isPub &&
                    showContractTextMode &&
                    ['SUBMITTED', 'APPROVAL_PENDING'].includes(pcStatusCode))) && // 附件合同工作流
                ((enableTemplateEdit === '1' && pcHeaderWorkbenchPreTextFlag !== '1') ||
                  (pcHeaderWorkbenchPreTextFlag === '1' &&
                    onlyEditReplaceWildcardBefore !== '1')) &&
                coordinatedFlag !== '1'
                  ? 'EDIT'
                  : 'VIEW'
              }
              pcHeaderWorkbenchPreTextFlag={
                enableEditShare === '1' ? pcHeaderWorkbenchPreTextFlag || null : null
              }
            />
          )
        ))}
    </div>
  );
};

export default ContractTextMode;
