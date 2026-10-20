// PPAP详情
import React, { Fragment, useMemo, useCallback, useContext, useState } from 'react';
import { Modal, Spin, useModal } from 'choerodon-ui/pro';
// import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { Header, Content } from 'components/Page';
import classNames from 'classnames';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { stringify } from 'querystring';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import StoreProvider, { Store } from './stores';
// import StoreProvider from './stores';
import type { StoreValueType } from './stores';
import type { Operate } from '../utils/type';
import { ActiveKeyDetail, DetailBtnCode, campCode } from '../utils/type';

import Approval from './components/Approval';
import OperationRecord from '../../PPAPWorkbench/Detail/components/OperationRecord';
import DetailInfo from './components/Detail';
import DocumentDetail from './components/DocumentDetail';
import StageDetail from './components/StageDetail';
import { formatDynamicBtns } from '../../utils';
import { useModalOpen } from '../../../utils/hooks';
import styles from '../../PPAPWorkbench/Detail/index.less';

const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SQAM}/v1/${organizationId}`;

const Detail = observer(() => {
  const {
    history,
    documentListDs,
    headerDs,
    operate,
    remoteProps,
    documentInfoDs,
    stageInfoDs,
    notPub,
    customizeBtnGroup,
    typeFlag,
    location,
    activeTabKey,
    projectType,
    fromId,
    num,
    permissionDs,
  } = useContext<StoreValueType>(Store);
  const loading = headerDs.status !== 'ready';
  const [activeKey, setActiveKey] = useState(activeTabKey || ActiveKeyDetail.PROJECT);
  const projectHeaderId = headerDs.current?.get('projectHeaderId');
  const projectStatus = headerDs.current?.get('projectStatus');
  const documentNum = documentInfoDs.current?.get('documentNum');
  const stageNum = stageInfoDs.current?.get('stageNum');

  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  // 获取权限
  const { docChangeBtn } = permissionDs.current?.get(['docChangeBtn']) || {};

  const tltle: string = useMemo(() => {
    if (operate === 'create') {
      return intl.get('sqam.ppap.view.title.createPPAP').d('新建PPAP');
    } else if (operate === 'edit') {
      return intl.get('sqam.ppap.view.title.updatePPAP').d('编辑PPAP');
    } else return intl.get('sqam.ppap.view.title.PPAPDetail').d('PPAP详情');
  }, [operate]);

  const isProjectFlag = useMemo(() => {
    return activeKey === ActiveKeyDetail.PROJECT;
  }, [activeKey]);

  const isDocumentFlag = useMemo(() => {
    return activeKey === ActiveKeyDetail.DOCUMENT;
  }, [activeKey]);

  const isStageFlag = useMemo(() => {
    return activeKey === ActiveKeyDetail.STAGE;
  }, [activeKey]);

  const currentHeader = useMemo(() => {
    return isStageFlag ? stageInfoDs.current : isDocumentFlag ? documentInfoDs.current : isProjectFlag ? headerDs.current : null;
  }, [
    headerDs,
    isStageFlag,
    stageInfoDs,
    isProjectFlag,
    isDocumentFlag,
    documentInfoDs,
  ]);

  const handleViewOperation = useCallback(() => {
    const stageId = stageInfoDs.current?.get('stageId');
    const documentId = documentInfoDs.current?.get('documentId');
    const id = isStageFlag ? stageId : (isDocumentFlag ? documentId : projectHeaderId);
    const type = isStageFlag ? 'stage' : (isDocumentFlag ? 'document' : 'project');
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      closable: true,
      key: Modal.key(),
      className: styles['sqam-medium-modal'],
      children: <OperationRecord id={id} type={type} documentInfoDs={documentInfoDs} record={currentHeader} remoteProps={remoteProps} activeTabKey={activeKey} camp='SUPPLIER' />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [
    activeKey,
    stageInfoDs,
    remoteProps,
    isStageFlag,
    currentHeader,
    documentInfoDs,
    isDocumentFlag,
    projectHeaderId,
  ]);

  const updateTabLink = useCallback((search, state) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state,
    });
  }, []);

  const linkToUpdateDetail = useCallback((operateType: Operate) => {
    const { pathname, search } = location;
    updateTabLink(stringify(filterNullValueObject({ operate: operateType, projectType })), {
      backPath: `${pathname}${search}`,
    });
    const number = isStageFlag ? stageNum : (isDocumentFlag? documentNum : num);
    history.push({
      pathname: `/sqam/PPAPWorkbenchSup/detail/${projectHeaderId}`,
      search: stringify(filterNullValueObject({ operate: operateType, projectType, fromId, num: number, type: `${activeKey}-${operateType}` })),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, projectHeaderId, history, location, projectType, fromId, num, activeKey, documentNum, stageNum, isDocumentFlag, isStageFlag]);


  // 发布 保存  取消  同意 拒绝
  const handleBtnMethods = useCallback(async (type: string, options: Record<string, any> = {}) => {
    if (isDocumentFlag) {
      if (documentInfoDs.current) {
        documentInfoDs.current.set(options || {});
      }
      const res = await documentInfoDs.setState('submitType', type).submit();
      if (!res) return;
      documentListDs.paging = false;
      documentListDs.setQueryParameter('size', 0);
      documentListDs.query(undefined, undefined, true).then(() => {
        headerDs.status = DataSetStatus.ready;
        documentListDs.forEach((record) => {
          if (record?.get('documentNum') === documentNum) {
            documentInfoDs.loadData([record]);
          }
        });
      });
    }
  }, [isDocumentFlag, documentInfoDs, documentListDs, documentNum, headerDs]);

  const handleApprovalMethods = useCallback((type) => {
    modalOpen({
      drawer: true,
      title: type === 'change' ? intl.get(`sqam.ppap.model.template.alterRemark`).d('变更意见') : intl.get(`sqam.ppap.model.template.approvedOpinion`).d('审批意见'),
      closable: true,
      editFlag: true,
      key: Modal.key(),
      className: styles['sqam-small-modal'],
      children: <Approval isProjectFlag={isProjectFlag} handleBtnMethods={handleBtnMethods} isDocumentFlag={isDocumentFlag} isStageFlag={isStageFlag} type={type} />,
    });
  }, [isDocumentFlag, isProjectFlag, isStageFlag, handleBtnMethods, modalOpen]);

  const buttons = useCallback(() => {
    const { documentStatus, camp, documentUploadPoint, stageStatus } = documentInfoDs.current?.get(['documentStatus', 'camp', 'documentUploadPoint', 'stageStatus']) || {};
    // 项目不能是关闭状态，阶段不是未开启状态，交付物视图才显示操作按钮
    const showDocBtnFlag = !['CLOSED'].includes(projectStatus);
    // 判断阶段视图下 编辑按钮是否显示
    const showDocEditBtn = documentUploadPoint === 'PROJECT_PUBLISH' || (documentUploadPoint === 'STAGE_OPEN' && stageStatus === 'IN_PROGRESS');
    const btns = [
      (typeFlag && (isDocumentFlag && showDocBtnFlag && showDocEditBtn && camp === campCode && ['UNUPLOADED', 'REJECTED'].includes(documentStatus))) && {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          onClick: () => linkToUpdateDetail('edit'),
          loading,
        },
      },
      typeFlag && showDocBtnFlag && docChangeBtn && isDocumentFlag && camp === campCode && ['COMPLETED', 'SUBMITTED'].includes(documentStatus) && ['IN_PROGRESS'].includes(stageStatus) && {
        name: 'change',
        child: intl.get('sqam.ppap.model.btn.change').d('变更'),
        btnProps: {
          icon: 'border_color-o',
          onClick: () => linkToUpdateDetail('edit'),
          loading,
        },
      },
      // 交付物变更、阶段变更
      !typeFlag && showDocBtnFlag && docChangeBtn && isDocumentFlag && camp === campCode && ['COMPLETED', 'SUBMITTED'].includes(documentStatus) && ['IN_PROGRESS'].includes(stageStatus) && {
        name: 'change',
        child: intl.get('sqam.ppap.model.btn.change').d('变更'),
        btnProps: {
          icon: 'border_color-o',
          onClick: () => handleApprovalMethods('change'),
          loading,
        },
      },
      ((!typeFlag && showDocBtnFlag && showDocEditBtn && isDocumentFlag && camp === campCode && ['UNUPLOADED', 'REJECTED'].includes(documentStatus))) && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          onClick: () => handleBtnMethods('save'),
          loading,
        },
      },
      ((!typeFlag && showDocBtnFlag && showDocEditBtn && isDocumentFlag && camp === campCode && ['UNUPLOADED', 'REJECTED'].includes(documentStatus))) && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          onClick: () => handleBtnMethods('submit'),
          loading,
        },
      },
      {
        name: 'export',
        btnComp: ExcelExportPro,
        buttonText: intl.get(`hzero.common.button.export`).d('导出'),
        btnProps: {
          templateCode: 'SRM_C_SQAM_ACCESS_PROJECT_HEADER_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${apiPrefix}/access-project-headers/list/supplier/export`,
          queryParams: { projectHeaderId, action: 'ALL' },
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [{
              code: `srm.sqam.ppap.supworkbench.button.detail-export`,
              type: 'button',
            }],
          },
        },
      },
      {
        name: 'operate',
        child: intl.get('hzero.common.button.operation').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          color: 'default',
          onClick: handleViewOperation,
          loading,
        },
      },
    ];
    return formatDynamicBtns(btns);
  }, [isDocumentFlag, handleBtnMethods, handleViewOperation, linkToUpdateDetail, documentInfoDs, typeFlag, loading, projectHeaderId, docChangeBtn, handleApprovalMethods, projectStatus ]);

  const backPath = useMemo(() => {
    const { state } = location;
    return state?.backPath || (fromId ? `/sqam/PPAPWorkbenchSummarySup/detail/${fromId}?operate=view` : '/sqam/PPAPWorkbenchSup/list');
  }, [location, fromId]);

  return (
    <Fragment>
      <Header title={notPub && tltle} backPath={notPub ? backPath : ''}>
        {
          notPub && (
            <>
              {customizeBtnGroup(
                { code: DetailBtnCode, pro: true },
                <DynamicButtons buttons={buttons()} maxNum={5} defaultBtnType="c7n-pro" />
              )}
            </>
          )
        }

        <div className={styles['sqam-ppap-detail']}>
          <div onClick={() => { setActiveKey(ActiveKeyDetail.PROJECT); }} className={classNames({ [styles['active-detail-key']]: isProjectFlag })}>{intl.get(`sqam.ppap.view.title.project`).d('项目视图')}</div>
          <div onClick={() => { setActiveKey(ActiveKeyDetail.STAGE); }} className={classNames({ [styles['active-detail-key']]: isStageFlag })}>{intl.get(`sqam.ppap.view.title.stage`).d('阶段视图')}</div>
          <div onClick={() => { setActiveKey(ActiveKeyDetail.DOCUMENT); }} className={classNames({ [styles['active-detail-key']]: isDocumentFlag })}>{intl.get(`sqam.ppap.view.title.documentView`).d('交付物视图')}</div>
        </div>
      </Header>
      <div className={classNames(styles['sqam-ppap-detail-auto'], { [styles['sqam-ppap-detail-tab']]: !isProjectFlag })}>
        <Content className={styles['sqam-detail-content-ppapWorkbench']}>
          <Spin spinning={loading} wrapperClassName="full-height-spinning">
            {isProjectFlag && <DetailInfo />}
            {isDocumentFlag && <DocumentDetail />}
            {isStageFlag && <StageDetail />}
          </Spin>
        </Content>
      </div>
    </Fragment>
  );
});

const PPAPWorkbenchDetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default PPAPWorkbenchDetail;
