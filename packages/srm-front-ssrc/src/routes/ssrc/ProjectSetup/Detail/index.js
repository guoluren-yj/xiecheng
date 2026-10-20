import React, {
  Fragment,
  useCallback,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
} from 'react';
import { Steps } from 'choerodon-ui';
// import { Button } from 'choerodon-ui/pro';
import querystring from 'querystring';
import { observer } from 'mobx-react-lite';
import { noop, compose, isEmpty } from 'lodash';
import { Attachment } from 'choerodon-ui/pro';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { queryBatchApprovaFlag } from '_utils/utils';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { getActiveTabKey, refreshTab } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import { Button } from 'components/Permission';
import { openApproveModal } from '_components/ApproveModal';
import useOperationRecordModal from '@/routes/components/ProjectOperationRecord/useModal';
import { withOverride, handleRevokeApproval, getBatchOperationFlag } from '@/utils/utils';

import { queryProgress, fetchProjectSetupHeader } from '@/services/projectSetupService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';

// import HistoryVersionListBtn from '@/routes/ssrc/ProjectSetupNew/Components/HistoryVersionListBtn';

import Update from '../Update';
import SPDetail from '../../ProjectSetupNew/SPDetail/indexDetail';
// import Score from './Score';
// import CheckPending from './CheckPending';
import styles from './index.less';
import Sourcing from './Sourcing';
import Finish from './Finish';

const { Step } = Steps;
const organizationId = getCurrentOrganizationId();

const Index = observer((props) => {
  const {
    match,
    history,
    remote: remoteFunc,
    location,
    customizeBtnGroup = noop,
    location: { search },
  } = props;
  const searchParams = useMemo(() => querystring.parse(search.substr(1)), [search]);
  const sourceProjectId = match?.params?.sourceProjectId;
  const [progress, setProgress] = useState([]);
  const [currentStep, setCurrentStep] = useState();
  const [headerInfo, setHeaderInfo] = useState({});
  const [approvaFlags, setApprovaFlags] = useState({});
  const [operationFlags, setOperationFlags] = useState({});
  const [projectOldUIFlag, setProjectOldUIFlag] = useState(true); // 是否寻源立项老ui

  useImperativeHandle(props?.forwardRef, () => ({
    getSupplierTab, // cux [shuidi]
  }));

  useEffect(() => {
    fetchHeader(); // 获取附件和是否分标段
    fetchProgress();
    fetchOldUIConfig();
  }, [sourceProjectId]);

  // 查询进度条
  const fetchProgress = () => {
    queryProgress({ sourceProjectId: match.params.sourceProjectId }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 设置值
        setProgress(result);
        const { nodeStatus } = result?.find((i) => i.currentNodeFlag) || {};
        setCurrentStep(nodeStatus);
      }
    });
  };

  // 查询新老ui配置
  const fetchOldUIConfig = async () => {
    try {
      const data = getResponse(
        await fetchConfigSheet({
          organizationId,
          configCode: 'srm_source_project_old_ui_black_list',
          data: {
            tenantNum: getCurrentTenant().tenantNum,
          },
        })
      );
      if (data && !isEmpty(data)) {
        setProjectOldUIFlag(true);
      } else {
        setProjectOldUIFlag(false);
      }
    } catch (e) {
      throw e;
    }
  };

  const fetchHeader = async () => {
    const params = {
      organizationId,
      sourceProjectId: match.params?.sourceProjectId,
      customizeUnitCode: 'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS',
    };
    const res = await fetchProjectSetupHeader(params);
    const result = getResponse(res);
    if (result && !result.failed) {
      const {
        businessKey,
        sourceProjectAttachmentUuid,
      } = result || {};
      setHeaderInfo({
        ...result,
        attachmentUUID: sourceProjectAttachmentUuid,
      });
      if (businessKey) {
        const approvaFlagsRes = await queryBatchApprovaFlag([businessKey]); // 查询审批按钮显示状态
        const operationFlagsRes = await getBatchOperationFlag([businessKey]); // 查询撤销按钮显示状态
        if (getResponse(approvaFlagsRes)) {
          setApprovaFlags(approvaFlagsRes);
        }
        if (getResponse(operationFlagsRes)) {
          setOperationFlags(operationFlagsRes);
        }
      }
    }
  };

  // 点击步骤条
  const handleClickStep = (record = {}) => {
    const { nodeStatus = null, finishedFlag = 0, currentNodeFlag = 0 } = record || {};

    if (!finishedFlag && !currentNodeFlag) {
      notification.warning({
        message: intl
          .get('ssrc.projectSetup.view.warning.noCurrentStatusView')
          .d(`尚未进行到该阶段，无法查看`),
      });
      return;
    }

    if (nodeStatus === currentStep) {
      return;
    }

    setCurrentStep(nodeStatus);
  };

  // 进度条
  const renderSteps = useCallback(() => {
    if (progress?.length) {
      return (
        <Steps current={progress?.findIndex((i) => i.currentNodeFlag)} size="default">
          {progress?.map((s) => {
            const { nodeStatus = null, nodeStatusMeaning = null } = s;
            return (
              <Step
                key={nodeStatus}
                onClick={() => handleClickStep(s)}
                title={nodeStatusMeaning || nodeStatus}
              />
            );
          })}
        </Steps>
      );
    }
  }, [progress, currentStep]);

  const getBackPath = useMemo(() => {
    const { fromSourcePage = null } = searchParams;
    if (fromSourcePage === 'otherTabDetail') {
      // 从其他tab跳过来的
      return null; // 根据最新的ui规范，如果从其他页面跳转明细，则不显示返回按钮
    } else {
      return `${getActiveTabKey()}/list`;
    }
  }, [searchParams]);

  const { openModal } = useOperationRecordModal();

  const handleShowOperationRecordModal = useCallback(() => {
    openModal({
      sourceProjectId,
    });
  }, [sourceProjectId]);

  /**
   * supplier tab render
   * @protected [shuidi]
   * */
  const getSupplierTab = useCallback(
    (allProps = {}) => {
      if (projectOldUIFlag) {
        return (
          <div className="project-card-warp">
            <div className="project-card-content">
              <Update {...allProps} />;
            </div>
          </div>
        );
      }
      return <SPDetail {...allProps} />;
    },
    [history, match, projectOldUIFlag]
  );

  /**
   * supplier Tab cux
   * @protected [shuidi]
   * */
  const getOverrideSupplierTab = withOverride.call(props, getSupplierTab, 'getOverrideSupplierTab');
  const approvaFlag = approvaFlags?.[headerInfo.businessKey];
  const operationFlag = operationFlags?.[headerInfo.businessKey];
  const { taskId, processInstanceId } = approvaFlag || {};
  const { closedStatus, sourceProjectStatus } = headerInfo || {};
  const approvingStatus =
    (sourceProjectStatus === 'APPROVED' && closedStatus === 'CLOSE_APPROVING') ||
    ['APPROVING', 'CHANGE_APPROVING'].includes(sourceProjectStatus);
  const preButtons = [
    {
      name: 'operationRecord',
      btnType: 'c7n-pro',
      child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      btnProps: {
        funcType: 'flat',
        icon: 'operation_service_request',
        onClick: handleShowOperationRecordModal,
      },
    },
    {
      name: 'viewAttachment',
      btnComp: Attachment,
      btnProps: {
        readOnly: true,
        viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-bid-projectsetup',
        value: headerInfo?.attachmentUUID ? headerInfo?.attachmentUUID : undefined,
        tenantId: organizationId,
        color: 'default',
      },
    },
    {
      name: 'print',
      btnComp: PrintProButton,
      btnProps: {
        buttonProps: {
          funcType: 'flat',
          icon: 'print',
          disabled: !sourceProjectId,
        },
        buttonText: intl.get('ssrc.inquiryHall.view.message.button.print').d('打印'),
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/source-projects/print-excel/token`,
        outType: 'PDF',
        method: 'POST',
        data: {
          sourceProjectId,
          templateCode: 'SITE.SSRC.SOURCE_PROJECT_DETAIL_DOC',
        },
      },
    },
    {
      name: 'approval',
      btnComp: Button,
      hidden: !(approvaFlags && approvaFlag && approvingStatus),
      child: intl.get('ssrc.inquiryHall.view.message.button.approve').d('审批'),
      btnProps: {
        wait: 1500,
        funcType: 'flat',
        icon: 'authorize',
        type: 'c7n-pro',
        onClick: async () => {
          openApproveModal({
            modalProps: {
              closable: true,
            },
            taskId,
            processInstanceId,
            onSuccess: () => {
              refreshTab();
            },
          });
        },
        permissionList: [
          {
            code: 'ssrc.new-project-setup.list.button.approve',
            meaning: '寻源项目工作台-详情-审批',
          },
        ],
      },
    },
    {
      name: 'revokeApproval',
      btnComp: Button,
      hidden: !(operationFlags && operationFlag?.REVOKE && approvingStatus),
      child: intl.get('ssrc.common.view.button.revokeApproval').d('撤销审批'),
      btnProps: {
        wait: 1500,
        funcType: 'flat',
        icon: 'reply',
        type: 'c7n-pro',
        onClick: async () => {
          const res = await handleRevokeApproval(headerInfo.businessKey);
          if (res) {
            refreshTab();
          }
        },
        permissionList: [
          {
            code: 'ssrc.new-project-setup.list.button.revoke-approval',
            meaning: '寻源项目工作台-详情-撤销审批',
          },
        ],
      },
    },
  ];

  const buttons = remoteFunc
    ? remoteFunc.process('SSRC_PROJECT_SETUP_DETAIL_PROCESS_HEADER_BUTTON', preButtons, {
        currentStep,
        sourceProjectId,
      })
    : preButtons;

  return (
    <Fragment>
      <Header
        title={intl
          .get('ssrc.projectSetup.view.message.title.sourceProjectDetail')
          .d('寻源项目详情')}
        backPath={getBackPath}
      >
        {/* <Button
          funcType="flat"
          icon="operation_service_request"
          onClick={handleShowOperationRecordModal}
        >
          {intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录')}
        </Button>
        <Upload
          filePreview
          viewOnly
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-bid-projectsetup"
          attachmentUUID={headerInfo?.attachmentUUID ? headerInfo?.attachmentUUID : undefined}
          tenantId={organizationId}
          fileSize={FIlESIZE}
        /> */}
        {customizeBtnGroup(
          {
            code: `SSRC.PROJECT_SETUP_DETAIL.HEADER_BUTTONS`,
            pro: true,
          },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <div className={styles['project-page-content-wrapper']}>
        <div className="project-page-content">
          <div className="project-card-warp">
            <div className="project-card-content">{renderSteps()}</div>
          </div>
          {currentStep === 'RELEASE' &&
            getOverrideSupplierTab({
              history,
              match,
              location,
              newDetailPageFlag: 1,
            })}
          {currentStep === 'SOURCING' && headerInfo?.subjectMatterRule && (
            <Sourcing
              history={history}
              match={match}
              searchParams={searchParams}
              subjectMatterRule={headerInfo?.subjectMatterRule}
              remote={remoteFunc}
              headerInfo={headerInfo}
            />
          )}
          {currentStep === 'FINISHED' && headerInfo?.subjectMatterRule && (
            <Finish
              history={history}
              match={match}
              searchParams={searchParams}
              subjectMatterRule={headerInfo?.subjectMatterRule}
              headerInfo={headerInfo}
            />
          )}
          {/* <div className="bottom-line" /> */}
        </div>
      </div>
    </Fragment>
  );
});

const hocComponent = (Com) => {
  return compose(
    WithCustomizeC7N({
      unitCode: ['SSRC.PROJECT_SETUP_DETAIL.HEADER_BUTTONS'],
    }),
    formatterCollections({
      code: [['ssrc.common', 'ssrc.projectSetup', 'ssrc.inquiryHall', 'scux.ssrc']],
    }),
    remote({
      code: 'SSRC_PROJECT_SETUP_DETAIL',
      name: 'remote',
    })
  )(Com);
};

export default hocComponent(Index);
export { hocComponent, Index as Detail };
