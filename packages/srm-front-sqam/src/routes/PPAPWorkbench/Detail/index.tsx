// PPAP详情
import React, { Fragment, useMemo, useCallback, useContext, useState } from 'react';
import { Modal, Spin, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
// import { isFunction } from 'lodash';
import { SRM_SQAM } from '_utils/config';
import { Header, Content } from 'components/Page';
import classNames from 'classnames';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { stringify } from 'querystring';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import { notifyValidErrors } from '../../PPAPTemplate/utils/utils';
import StoreProvider, { Store } from './stores';
// import StoreProvider from './stores';
import type { StoreValueType } from './stores';
import type { Operate } from '../utils/type';
import { ActiveKeyDetail, DetailBtnCode, campCode } from '../utils/type';
import { confirmDocNegAction } from '../../../utils/utils';
import { changeProjectBefore } from '../utils/api';

import Approval from './components/Approval';
import OperationRecord from './components/Record';
import DetailInfo from './components/Detail';
import DocumentDetail from './components/DocumentDetail';
import StageDetail from './components/StageDetail';
import { formatDynamicBtns } from '../../utils';
import { useModalOpen } from '../../../utils/hooks';
import WorkFlowStage from './WorkFlowCard/Stage';
import WorkFlowDocument from './WorkFlowCard/Document';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SQAM}/v1/${organizationId}`;

const Detail = observer(() => {
  const {
    history,
    documentListDs,
    createFlag,
    headerDs,
    handleToList,
    handleToDetail,
    documentInfoDs,
    stageInfoDs,
    notPub,
    customizeBtnGroup,
    newStageFlowFlag,
    newDocumentFlowFlag,
    typeFlag,
    location,
    activeTabKey,
    stageListDs,
    documentStageLineDs,
    projectType,
    fromId,
    permissionDs,
    num,
    remoteProps,
    itemChangeFlag,
    partLineDs,
    stageLineDs,
    documentLineDs,
    operate,
    custConfig,
    pubEditProjectFlag,
    pubEditDocFlag,
    pubEditStageFlag,
  } = useContext<StoreValueType>(Store);
  const { state } = location;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const loading = headerDs.status !== 'ready';
  const [activeKey, setActiveKey] = useState(activeTabKey || ActiveKeyDetail.PROJECT);
  const projectHeaderId = headerDs.current?.get('projectHeaderId');
  // 获取权限
  const { changeBtn, stageChangeBtn, projectChange, copyBtn } = permissionDs.current?.get(['changeBtn', 'stageChangeBtn', 'projectChange', 'copyBtn']) || {};
  const updateFlag = partLineDs.created?.length > 0 || stageLineDs.created?.length > 0 || documentLineDs.created?.length > 0;
  const documentNum = documentInfoDs.current?.get('documentNum');
  const stageNum = stageInfoDs.current?.get('stageNum');

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
  }, [activeKey]);

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
      children: <OperationRecord operationProps={{id, type, camp: 'PURCHASER', isExport: true, documentInfoDs, remoteProps, record: currentHeader, activeTabKey: activeKey}} approvalProps={{documentId: id, documentType: type?.toUpperCase()}} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [projectHeaderId, documentInfoDs, stageInfoDs, isDocumentFlag, isStageFlag]);

  const updateTabLink = useCallback((search, stateKey) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state: stateKey,
    });
  }, []);

  const linkToUpdateDetail = useCallback(async(operateType: Operate) => {
    const { pathname, search } = location;
    if (operateType === 'change' && isProjectFlag) {
      const res = getResponse(await changeProjectBefore(projectHeaderId));
      if (!res) return;
    }
    updateTabLink(stringify(filterNullValueObject({ operate: operateType, projectType })), {
      backPath: `${pathname}${search}`,
    });
    // 加上type 避免在阶段 交付物 如果在第二个的时候点编辑会回到第一个
    const number = isStageFlag ? stageNum : (isDocumentFlag? documentNum : num);
    history.push({
      pathname: `/sqam/PPAPWorkbench/detail/${projectHeaderId}`,
      search: stringify(filterNullValueObject({ operate: operateType, projectType, fromId, num: number, type: `${activeKey}-${operateType}` })),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, projectHeaderId, history, location, projectType, fromId, num, activeKey, stageNum, documentNum, isDocumentFlag, isStageFlag, isProjectFlag]);


  // 发布 保存  取消  同意 拒绝
  const handleBtnMethods = useCallback(async (type: string, options: any = {}) => {
    if (createFlag || isProjectFlag) {
      if (['save', 'publish', 'change'].includes(type)) {
        const validRes = await headerDs.validate();
        if (!validRes) {
          notifyValidErrors(headerDs);
          return undefined;
        };
      }
      if (type === 'change') {
        const confirmRes = await Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('sqam.common.view.message.confirmRevokeChangeTip')
            .d(
              '确认变更后，会根据模板配置的变更审批方式进行单据审核。若审批拒绝，则单据将回滚至变更前数据，是否确认变更？'
            ),
        });
        if (confirmRes !== 'ok') return false;
      }
      // eslint-disable-next-line no-unused-expressions
      headerDs.current?.set(options || {});
      if (createFlag) {
        // 获取租户配置的个性化字段，新增的时候后端无法保存个性化字段，需要统一放到一个对象里
        const fields = custConfig['SQAM.PPAP_WORKBENCH_DETAIL.BASIC_INFO']?.fields || [];
        headerDs.setState('fields', fields);
      }
      headerDs.status = DataSetStatus.loading;
      const res = await headerDs.setState('submitType', createFlag ? 'create' : type).forceSubmit();
      headerDs.status = DataSetStatus.ready;
      if (!res) return;
      if (['publish', 'cancel', 'confirm', 'reject', 'close'].includes(type)) {
        handleToList();
        return;
      }
      if (createFlag) {
        const { content } = res;
        const id = content[0]?.projectHeaderId;
        if (id) handleToDetail(id, 'edit');
        return;
      }
      if (type === 'change') {
        handleToDetail(projectHeaderId, 'view');
        return;
      }
      headerDs.query();
    } else if (isDocumentFlag) {
      if (['save', 'submit'].includes(type)) {
        const validRes = await documentInfoDs.validate();
        if (!validRes) {
          notifyValidErrors(documentInfoDs);
          return undefined;
        };
      }
      // eslint-disable-next-line no-unused-expressions
      documentInfoDs.current?.set(options || {});
      headerDs.status = DataSetStatus.loading;
      const res = await documentInfoDs.setState('submitType', type).submit().catch(() => {
        headerDs.status = DataSetStatus.ready;
      });
      if (!res) {
        headerDs.status = DataSetStatus.ready;
        return;
      };
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
    } else if (isStageFlag) {
      // eslint-disable-next-line no-unused-expressions
      stageInfoDs.current?.set(options || {});
      headerDs.status = DataSetStatus.loading;
      const res = await stageInfoDs.setState('submitType', type).forceSubmit();
      if (!res) {
        headerDs.status = DataSetStatus.ready;
        return;
      }
      // 操作后需要更新阶段视图数据，更新数据需要从数组内取，后端无法直接返回最新的
      stageListDs.paging = false;
      stageListDs.setQueryParameter('size', 0);
      stageListDs.query(undefined, undefined, true).then(() => {
        headerDs.status = DataSetStatus.ready;
        stageListDs.forEach((record) => {
          if (record?.get('stageNum') === stageNum) {
            stageInfoDs.loadData([record]);
            documentStageLineDs.setQueryParameter('stageId', record?.get('stageId'));
            documentStageLineDs.query();
          }
        });
      });
    }
  }, [headerDs, createFlag, isProjectFlag, documentStageLineDs, isDocumentFlag, isStageFlag, handleToDetail, handleToList, documentInfoDs, stageInfoDs, stageListDs, documentListDs, projectHeaderId, documentNum, stageNum, custConfig]);

  const handleBtnBeforeMethods = useCallback(async (type: string) => {
    const projectNum = headerDs.current?.get('projectNum');
    const res = await confirmDocNegAction({ action: 'cancel', documentNum: projectNum });
    if (res) handleBtnMethods(type);
  }, [headerDs, handleBtnMethods]);

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

  // 处理复制
  const handleCopy = useCallback(async () => {
    const res = await headerDs.setState('submitType', 'copy').forceSubmit();
    if (!res) return;
    const { content } = res;
    const id = content[0]?.projectHeaderId;
    if (id) handleToDetail(id, 'edit');
  }, [headerDs, handleToDetail]);

  const buttons = useCallback(() => {
    const projectStatus = headerDs.current?.get('projectStatus');
    const authProjectFlag = headerDs.current?.get('approvalAuthFlag');
    const { documentStatus, approvalAuthFlag: authDocFlag, camp, assignAuthFlag, documentUploadPoint, stageStatus: stageStatusDoc } = documentInfoDs.current?.get(['documentStatus', 'approvalAuthFlag', 'camp', 'assignAuthFlag', 'documentUploadPoint', 'stageStatus']) || {};
    const { stageStatus, stageOpenType, stageCloseType, approvalAuthFlag: authStageFlag, closeApproveFlag } = stageInfoDs.current?.get(['stageStatus', 'stageOpenType', 'stageCloseType', 'approvalAuthFlag', 'closeApproveFlag']) || {};
    const isNotITEM = projectType !== 'ITEM';
    // 根据项目状态 判断阶段视图和交付物视图下按钮是否显示标识
    const showBtnByProjectStatusFlag = ['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus);
    // 判断阶段视图下 编辑按钮是否显示
    const showDocEditBtn = documentUploadPoint === 'PROJECT_PUBLISH' || (documentUploadPoint === 'STAGE_OPEN' && stageStatusDoc === 'IN_PROGRESS');
    const btns = [
      (typeFlag && ((isProjectFlag && isNotITEM && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus)) || (isDocumentFlag && showDocEditBtn && camp === campCode && Number(assignAuthFlag) === 1 && showBtnByProjectStatusFlag && ['UNUPLOADED', 'REJECTED'].includes(documentStatus)))) && {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          onClick: () => linkToUpdateDetail('edit'),
          loading,
        },
      },
      // 把下面的可审核的条件都加上来  需要通过approvalAuthFlag判断从全部页签点单号进来的是否有审核权限
      (typeFlag && ((isProjectFlag && isNotITEM && ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(projectStatus)) && Number(authProjectFlag) === 1 ||
        (isDocumentFlag && ['SUBMITTED'].includes(documentStatus)) && Number(authDocFlag) === 1 ||
        (isStageFlag && ['CLOSE_APPROVAL'].includes(stageStatus) && Number(authStageFlag) === 1))) && {
        name: 'check',
        child: intl.get('hzero.common.button.sstaApprove').d('审核'),
        btnProps: {
          icon: 'authorize',
          onClick: () => linkToUpdateDetail('check'),
          loading,
        },
      },
      (typeFlag && (isStageFlag && showBtnByProjectStatusFlag && ['MANUAL'].includes(stageOpenType) && ['NOT_STARTED'].includes(stageStatus))) && {
        name: 'open',
        child: intl.get('sqam.ppap.model.btn.open').d('开启'),
        btnProps: {
          icon: 'play_circle_filled',
          onClick: () => linkToUpdateDetail('edit'),
          loading,
        },
      },
      // 项目变更
      (!createFlag && isProjectFlag && ['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus) && projectChange && !itemChangeFlag && operate !== 'check') && {
        name: 'change',
        child: intl.get('sqam.ppap.model.btn.change').d('变更'),
        btnProps: {
          icon: 'border_color-o',
          onClick: () => linkToUpdateDetail('change'),
          loading,
        },
      },
      (typeFlag && ((isStageFlag && showBtnByProjectStatusFlag && ['IN_PROGRESS'].includes(stageStatus) && (['MANUAL'].includes(stageCloseType) || closeApproveFlag === 1)) || (['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus) && isProjectFlag && isNotITEM))) && {
        name: 'close',
        child: intl.get('hzero.common.btn.close').d('关闭'),
        btnProps: {
          icon: 'close',
          onClick: () => linkToUpdateDetail('check'),
          loading,
        },
      },
      (typeFlag && ((changeBtn && isDocumentFlag && stageStatusDoc !== 'CLOSED' && Number(assignAuthFlag) === 1 && ['COMPLETED'].includes(documentStatus)) || (
        // 阶段变更条件：有权限 阶段状态已关闭 项目状态不能为关闭
        stageChangeBtn && isStageFlag && ['CLOSED'].includes(stageStatus) && !['CLOSED'].includes(projectStatus)
      ))) && {
        name: 'change',
        child: intl.get('sqam.ppap.model.btn.change').d('变更'),
        btnProps: {
          icon: 'border_color-o',
          onClick: () => linkToUpdateDetail('edit'),
          loading,
        },
      },
      (!createFlag && isProjectFlag && ['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus) && projectChange && itemChangeFlag) && {
        name: 'sureChange',
        child: intl.get('sqam.ppap.model.btn.sureChange').d('确认变更'),
        btnProps: {
          icon: 'border_color-o',
          onClick: () => handleBtnMethods('change'),
          loading,
        },
      },
      // 项目确认
      ((!typeFlag && isProjectFlag && isNotITEM && ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(projectStatus) && Number(authProjectFlag) === 1)) && {
        name: 'confirm',
        child: intl.get('hzero.common.button.confirm').d('确认'),
        btnProps: {
          icon: 'authorize',
          onClick: () => handleApprovalMethods('confirm'),
          loading,
        },
      },
      // 交付物确认
      ((!typeFlag && isDocumentFlag && ['SUBMITTED'].includes(documentStatus) && Number(authDocFlag) === 1)) && {
        name: 'confirm',
        child: intl.get('hzero.common.button.confirm').d('确认'),
        btnProps: {
          icon: 'authorize',
          onClick: () => handleApprovalMethods('confirm'),
          loading,
        },
      },
      // 项目拒绝
      ((!typeFlag && isProjectFlag && isNotITEM && ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(projectStatus) && Number(authProjectFlag) === 1)) && {
        name: 'reject',
        child: intl.get('sqam.ppap.button.reject').d('拒绝'),
        btnProps: {
          icon: 'remove_circle',
          onClick: () => handleApprovalMethods('reject'),
          loading,
        },
      },
      // 交付物拒绝
      ((!typeFlag && isDocumentFlag && ['SUBMITTED'].includes(documentStatus) && Number(authDocFlag) === 1)) && {
        name: 'reject',
        child: intl.get('sqam.ppap.button.reject').d('拒绝'),
        btnProps: {
          icon: 'remove_circle',
          onClick: () => handleApprovalMethods('reject'),
          loading,
        },
      },
      (!updateFlag && (!typeFlag && isProjectFlag && isNotITEM && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus))) && {
        name: 'publish',
        child: intl.get('hzero.common.button.publish').d('发布'),
        btnProps: {
          icon: 'publish2',
          onClick: () => handleBtnMethods('publish'),
          loading,
        },
      },
      ((!typeFlag && isDocumentFlag && showBtnByProjectStatusFlag && Number(assignAuthFlag) === 1 && ['UNUPLOADED', 'REJECTED'].includes(documentStatus))) && camp === campCode && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          onClick: () => handleBtnMethods('submit'),
          loading,
        },
      },
      (createFlag || (!typeFlag && isProjectFlag && isNotITEM && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus)) || (!typeFlag && isDocumentFlag && showBtnByProjectStatusFlag && Number(assignAuthFlag) === 1 && camp === campCode && ['UNUPLOADED', 'REJECTED'].includes(documentStatus))) && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          onClick: () => handleBtnMethods('save'),
          loading,
        },
      },
      ((!typeFlag && isProjectFlag && isNotITEM && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus))) && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          onClick: () => handleBtnBeforeMethods('cancel'),
          loading,
        },
      },
      ((!typeFlag && isStageFlag && showBtnByProjectStatusFlag && ['MANUAL'].includes(stageOpenType) && ['NOT_STARTED'].includes(stageStatus))) && {
        name: 'open',
        child: intl.get('sqam.ppap.model.btn.open').d('开启'),
        btnProps: {
          icon: 'play_circle_filled',
          onClick: () => handleBtnMethods('open'),
          loading,
        },
      },
      // 项目关闭
      (!typeFlag && ['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus) && isProjectFlag && isNotITEM && !itemChangeFlag) && {
        name: 'close',
        child: intl.get('hzero.common.btn.close').d('关闭'),
        btnProps: {
          icon: 'close',
          onClick: () => handleApprovalMethods('close'),
          loading,
        },
      },
      // 阶段关闭
      !typeFlag && isStageFlag && showBtnByProjectStatusFlag && ['IN_PROGRESS'].includes(stageStatus) && (['MANUAL'].includes(stageCloseType) || closeApproveFlag === 1) && {
        name: 'close',
        child: intl.get('hzero.common.btn.close').d('关闭'),
        btnProps: {
          icon: 'close',
          onClick: () => handleApprovalMethods('close'),
          loading,
        },
      },
      ((!typeFlag && isStageFlag && ['CLOSE_APPROVAL'].includes(stageStatus) && Number(authStageFlag) === 1)) && {
        name: 'closeConfirm',
        child: intl.get('sqam.ppap.model.btn.closeConfirm').d('关闭确认'),
        btnProps: {
          icon: 'remove_circle',
          onClick: () => handleBtnMethods('closeConfirm'),
          loading,
        },
      },
      ((!typeFlag && isStageFlag && ['CLOSE_APPROVAL'].includes(stageStatus) && Number(authStageFlag) === 1)) && {
        name: 'closeReject',
        child: intl.get('sqam.ppap.model.btn.closeReject').d('关闭拒绝'),
        btnProps: {
          icon: 'do_not_disturb_off',
          onClick: () => handleBtnMethods('closeReject'),
          loading,
        },
      },
      // 交付物变更、阶段变更
      (!typeFlag && ((changeBtn && isDocumentFlag && stageStatusDoc !== 'CLOSED' && Number(assignAuthFlag) === 1 && ['COMPLETED'].includes(documentStatus)) || (
        stageChangeBtn && isStageFlag && ['CLOSED'].includes(stageStatus) && !['CLOSED'].includes(projectStatus)
      ))) && {
        name: 'change',
        child: intl.get('sqam.ppap.model.btn.change').d('变更'),
        btnProps: {
          icon: 'border_color-o',
          onClick: () => handleApprovalMethods('change'),
          loading,
        },
      },
      // 项目复制
      !createFlag && copyBtn && isProjectFlag && isNotITEM && {
        name: 'copy',
        child: intl.get('hzero.common.button.copy').d('复制'),
        btnProps: {
          icon: 'queue',
          funcType: 'flat',
          color: 'default',
          onClick: handleCopy,
          loading,
        },
      },
      !createFlag && {
        name: 'export',
        btnComp: ExcelExportPro,
        buttonText: intl.get(`hzero.common.button.export`).d('导出'),
        btnProps: {
          templateCode: 'SRM_C_SQAM_ACCESS_PROJECT_HEADER_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${apiPrefix}/access-project-headers/list/export`,
          queryParams: { projectHeaderId, action: 'ALL' },
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [{
              code: `srm.sqam.ppap.workbench.button.detail-export`,
              type: 'button',
            }],
          },
        },
      },
      !createFlag && {
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
  }, [updateFlag, createFlag, isProjectFlag, isDocumentFlag, handleApprovalMethods, handleBtnBeforeMethods, isStageFlag, handleBtnMethods, handleViewOperation, linkToUpdateDetail, headerDs, documentInfoDs, stageInfoDs, typeFlag, projectType, loading, changeBtn, stageChangeBtn, projectChange, itemChangeFlag, projectHeaderId, operate, copyBtn, handleCopy]);

  const backPath = useMemo(() => {
    // 如果来源是汇总工作台 跳转到汇总工作台
    return state?.backPath || (fromId ? `/sqam/PPAPWorkbenchSummary/detail/${fromId}?operate=view` : '/sqam/PPAPWorkbench/list');
  }, [state, fromId]);

  return (
    <Fragment>
      {newStageFlowFlag && <WorkFlowStage headerBtns={buttons()} />}
      {newDocumentFlowFlag && <WorkFlowDocument headerBtns={buttons()} />}
      {
        !(newStageFlowFlag || newDocumentFlowFlag) && (
          <Header
            title={notPub && tltle}
            backPath={notPub ? backPath : ''}
            onBack={() => {
              if (notPub && state?.backPath) {
                updateTabLink(state?.backPath.split('?')[1], null);
              }
            }}
          >
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
            {
              !createFlag && !pubEditDocFlag && !pubEditProjectFlag && !pubEditStageFlag && (
                <div className={styles['sqam-ppap-detail']}>
                  <div onClick={() => { setActiveKey(ActiveKeyDetail.PROJECT); }} className={classNames({ [styles['active-detail-key']]: isProjectFlag })}>{intl.get(`sqam.ppap.view.title.project`).d('项目视图')}</div>
                  <div onClick={() => { setActiveKey(ActiveKeyDetail.STAGE); }} className={classNames({ [styles['active-detail-key']]: isStageFlag })}>{intl.get(`sqam.ppap.view.title.stage`).d('阶段视图')}</div>
                  <div onClick={() => { setActiveKey(ActiveKeyDetail.DOCUMENT); }} className={classNames({ [styles['active-detail-key']]: isDocumentFlag })}>{intl.get(`sqam.ppap.view.title.documentView`).d('交付物视图')}</div>
                </div>
              )
            }
          </Header>
        )
      }
      <div className={classNames(styles['sqam-ppap-detail-auto'], { [styles['sqam-ppap-detail-tab']]: !(createFlag || isProjectFlag) }, { [styles['sqam-ppap-detail-tab-create']]: createFlag })}>
        <Content className={styles['sqam-detail-content-ppapWorkbench']}>
          <Spin spinning={loading} wrapperClassName="full-height-spinning">
            {(createFlag || isProjectFlag) && <DetailInfo />}
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
