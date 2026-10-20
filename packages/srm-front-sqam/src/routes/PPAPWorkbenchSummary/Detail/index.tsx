// PPAP详情
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Spin, Modal, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { Header, Content } from 'components/Page';
import classNames from 'classnames';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { stringify } from 'querystring';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { getCurrentOrganizationId } from 'utils/utils';

import { confirmDocNegAction } from '../../../utils/utils';
import { notifyValidErrors } from '../../PPAPTemplate/utils/utils';
import Approval from '../Detail/components/Approval';
import StoreProvider, { Store } from './stores';
// import StoreProvider from './stores';
import type { StoreValueType } from './stores';
import type { Operate } from '../utils/type';
import OperationRecord from '../../PPAPWorkbench/Detail/components/Record';
import { formatDynamicBtns } from '../../utils';
import { DetailBtnCode } from '../utils/type';

import DetailInfo from './components/Detail';
import styles from '../../PPAPWorkbench/Detail/index.less';
import { useModalOpen } from '../../../utils/hooks';

const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SQAM}/v1/${organizationId}`;

const Detail = observer(() => {
  const {
    headerDs,
    location,
    viewFlag,
    history,
    customizeBtnGroup,
    handleToList,
    operate,
    createFlag,
    handleToDetail,
    permissionDs,
    partLineDs,
    stageLineDs,
    documentLineDs,
    custConfig,
  } = useContext<StoreValueType>(Store);

  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const loading = headerDs.status !== 'ready';
  const { projectStatus, projectHeaderId, approvalAuthFlag } = headerDs.current?.get(['projectStatus', 'projectHeaderId', 'approvalAuthFlag']) || {};
  const statusFlag = ['CANCELED', 'PUBLISHED', 'CLOSE_COMFIRM_FUNCTION', 'CLOSE_COMFIRM_WORKFLOW', 'CLOSED', 'CLOSE_REJECTED'].includes(projectStatus);
  // 获取权限
  const { copyBtn } = permissionDs.current?.get(['copyBtn']);
  const updateFlag = partLineDs.created?.length > 0 || stageLineDs.created?.length > 0 || documentLineDs.created?.length > 0;

  const tltle: string = useMemo(() => {
    if (operate === 'create') {
      return intl.get('sqam.ppap.view.title.createPPAPItem').d('新建PPAP汇总项目');
    } else if (operate === 'edit') {
      return intl.get('sqam.ppap.view.title.updatePPAPItem').d('编辑PPAP汇总项目');
    } else return intl.get('sqam.ppap.view.title.ppapSumDetail').d('PPAP汇总工作台详情');
  }, [operate]);



  const handleViewOperation = useCallback(() => {
    const type = 'project';
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      closable: true,
      key: Modal.key(),
      className: styles['sqam-medium-modal'],
      children: <OperationRecord operationProps={{id: projectHeaderId, type, camp: 'PURCHASER', isExport: true}} approvalProps={{documentId: projectHeaderId, documentType: type?.toUpperCase()}} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [projectHeaderId]);

  const updateTabLink = useCallback((search, state) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state,
    });
  }, []);

  const linkToUpdateDetail = useCallback((operateType: Operate) => {
    const { pathname, search } = location;
    updateTabLink(stringify({ operate: operateType }), {
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `/sqam/PPAPWorkbenchSummary/detail/${projectHeaderId}`,
      search: stringify({ operate: operateType }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, projectHeaderId, history, location]);

  const handleBtnMethods = useCallback(async (type: string, options: any = {}) => {
    if (['save', 'publish'].includes(type)) {
      const validRes = await headerDs.validate();
      if (!validRes) {
        notifyValidErrors(headerDs);
        return undefined;
      };
    }
    // eslint-disable-next-line no-unused-expressions
    headerDs.current?.set(options || {});
    if (createFlag) {
      // 获取租户配置的个性化字段，新增的时候后端无法保存个性化字段，需要统一放到一个对象里
      const fields = custConfig['SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.BASIC_INFO']?.fields || [];
      headerDs.setState('fields', fields);
    }
    const res = await headerDs.setState('submitType', createFlag ? 'create' : type).forceSubmit();
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
    headerDs.query();
  }, [headerDs, handleToList, createFlag, handleToDetail, custConfig]);

  const handleBtnBeforeMethods = useCallback(async (type: string) => {
    const projectNum = headerDs.current?.get('projectNum');
    const res = await confirmDocNegAction({ action: 'cancel', documentNum: projectNum });
    if (res) handleBtnMethods(type);
  }, [headerDs, handleBtnMethods]);

  const handleApprovalMethods = useCallback((type: string) => {
    modalOpen({
      drawer: true,
      title: intl.get(`sqam.ppap.model.template.approvedOpinion`).d('审批意见'),
      closable: true,
      editFlag: true,
      key: Modal.key(),
      className: styles['sqam-small-modal'],
      children: <Approval handleBtnMethods={handleBtnMethods} type={type} />,
    });
  }, [handleBtnMethods, modalOpen]);

  // 处理复制
  const handleCopy = useCallback(async () => {
    const res = await headerDs.setState('submitType', 'copy').forceSubmit();
    if (!res) return;
    const { content } = res;
    const id = content[0]?.projectHeaderId;
    if (id) handleToDetail(id, 'edit');
  }, [headerDs, handleToDetail]);

  const buttons = useCallback(() => {
    const btns = [
      (viewFlag && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus)) && {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          onClick: () => linkToUpdateDetail('edit'),
          loading,
        },
      },
      (viewFlag && ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(projectStatus) && approvalAuthFlag === '1') && {
        name: 'check',
        child: intl.get('hzero.common.button.sstaApprove').d('审核'),
        btnProps: {
          icon: 'authorize',
          onClick: () => linkToUpdateDetail('check'),
          loading,
        },
      },
      (viewFlag && ['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus)) && {
        name: 'close',
        child: intl.get('hzero.common.btn.close').d('关闭'),
        btnProps: {
          icon: 'close',
          onClick: () => linkToUpdateDetail('check'),
          loading,
        },
      },
      // 项目确认
      (!viewFlag && ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(projectStatus) && approvalAuthFlag === '1') && {
        name: 'confirm',
        child: intl.get('hzero.common.button.confirm').d('确认'),
        btnProps: {
          icon: 'authorize',
          onClick: () => handleApprovalMethods('confirm'),
          loading,
        },
      },
      // 项目拒绝
      (!viewFlag && ['PUBLISH_COMFIRMING', 'CLOSE_COMFIRM_FUNCTION'].includes(projectStatus) && approvalAuthFlag === '1') && {
        name: 'reject',
        child: intl.get('sqam.ppap.button.reject').d('拒绝'),
        btnProps: {
          icon: 'remove_circle',
          onClick: () => handleApprovalMethods('reject'),
          loading,
        },
      },
      (!updateFlag && (!viewFlag && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus))) && {
        name: 'publish',
        child: intl.get('hzero.common.button.publish').d('发布'),
        btnProps: {
          icon: 'publish2',
          onClick: () => handleBtnMethods('publish'),
          loading,
        },
      },
      ((!viewFlag && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus)) || createFlag) && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          onClick: () => handleBtnMethods('save'),
          loading,
        },
      },
      ((!viewFlag && ['NEW', 'PUBLISH_REJECTED'].includes(projectStatus))) && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          onClick: () => handleBtnBeforeMethods('cancel'),
          loading,
        },
      },
      (!viewFlag && ['PUBLISHED', 'CLOSE_REJECTED'].includes(projectStatus)) && {
        name: 'close',
        child: intl.get('hzero.common.btn.close').d('关闭'),
        btnProps: {
          icon: 'close',
          onClick: () => handleApprovalMethods('close'),
          loading,
        },
      },
      !createFlag && {
        name: 'export',
        btnComp: ExcelExportPro,
        buttonText: intl.get(`hzero.common.button.export`).d('导出'),
        btnProps: {
          templateCode: 'SRM_C_SQAM_ACCESS_PROJECT_HEADER_SUM_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${apiPrefix}/access-project-headers/sum/list/export`,
          queryParams: { projectHeaderId, action: 'ALL' },
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [{
              code: `srm.sqam.ppap.summary.workbench.button.detail-export`,
              type: 'button',
            }],
          },
        },
      },
      !createFlag && copyBtn && !['NEW'].includes(projectStatus) && {
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
  }, [updateFlag, linkToUpdateDetail, handleApprovalMethods, handleBtnBeforeMethods, handleViewOperation, viewFlag, handleBtnMethods, projectStatus, approvalAuthFlag, loading, createFlag, copyBtn, handleCopy, projectHeaderId]);


  const backPath = useMemo(() => {
    const { state } = location;
    return state?.backPath || '/sqam/PPAPWorkbenchSummary/list';
  }, [location]);

  return (
    <Fragment>
      <Header title={tltle} backPath={backPath}>
        {customizeBtnGroup(
          { code: DetailBtnCode, pro: true },
          <DynamicButtons buttons={buttons()} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <div className={classNames(styles['sqam-ppap-detail-auto'], { [styles['sqam-ppap-detail-tab-create']]: createFlag || statusFlag })}>
        <Content className={styles['sqam-detail-content-ppapWorkbench']}>
          <Spin spinning={loading} wrapperClassName="full-height-spinning">
            <DetailInfo />
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
