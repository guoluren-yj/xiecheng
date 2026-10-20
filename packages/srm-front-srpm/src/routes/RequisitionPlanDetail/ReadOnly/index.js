import React, { Fragment, useEffect, useState, useRef, useMemo } from 'react'; // useEffect
import intl from 'utils/intl';
import { compose, isArray, isFunction } from 'lodash';
import { Modal, Attachment, DataSet, Form } from 'choerodon-ui/pro';
import { Spin as ChoerodonSpin } from 'choerodon-ui';
import classnames from 'classnames';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
// import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';
import { Button } from 'components/Permission';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import uuid from 'uuid/v4';
import querystring from 'querystring';
import cuxRemote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { queryBatchApprovaFlag } from '_utils/utils';
import {
  queryDetail,
  cancel,
  batchReSync,
  workFlowSubmitSave,
} from '@/services/RequisitionPlanServices';
import { openApproveModal } from '_components/ApproveModal';
import Remark from '../components/Remark';
import Anchor from '../components/Anchor';
import Base from '../components/Base.js';
import PurchaseOrgInfo from '../components/PurchaseOrgInfo.js';
import DemandLine from '../components/DemandLine.js';
import OperationRecord from '../components/OperationHistory';
import { attachmentDs } from '../indexDS';
import { revokeWorkFlow, getBatchOperationFlag } from '../../RequisitionPlan/util';

import maintainStyles from '../index.less';

// const organizationId = getCurrentOrganizationId();

const Index = ({
  history,
  match,
  customizeTable,
  customizeForm,
  customizeBtnGroup,
  href,
  remote,
  onFormLoaded,
  location,
  onLoad,
}) => {
  const baseRef = useRef({});
  const lineRef = useRef({});
  const remarkRef = useRef({});
  const { params = {}, path = '' } = match || {};
  const pubPathFlag = path.includes('/pub/srpm/requisition-plan/only-read/');
  const purchaseOrgInfoRef = useRef({});
  const modalSearch = href?.substr(href.indexOf('?'), href.length);
  const { rpHeaderId: modalRpHeaderId } = querystring.parse(modalSearch?.substr(1)) || {};
  const { editDomFlag } = querystring.parse(location?.search?.substr(1)) || {};
  // const [rpHeaderId] = useState(params.id || params.rpHeaderId || modalRpHeaderId);
  const rpHeaderId = params.id || params.rpHeaderId || modalRpHeaderId;
  const [headerInfo, setHeaderData] = useState({ attachmentUuId: uuid() });
  const [headerLoading, setHeaderLoad] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resysLoading, setResysLoading] = useState(false);
  const [workFlowData, setWorkFlowData] = useState({});
  const attachDs = useMemo(() => new DataSet(attachmentDs()), []);

  // 获取头信息
  const getHeaderInfo = () => {
    const headerDataInfo = {};
    const base = baseRef.current?.saveCurrentData();
    const purchaseOrg = purchaseOrgInfoRef.current?.saveCurrentData();
    const baseInfoFields = base.fields.toJSON();
    const purchaseFields = purchaseOrg.fields.toJSON();
    const baseInfo = base.toData()[0];
    const purchaseOrgInfo = purchaseOrg.toData()[0];
    const attachInfo = attachDs.toData()[0];
    for (const key in baseInfoFields) {
      if ({}.hasOwnProperty.call(baseInfoFields, key)) {
        headerDataInfo[key] = baseInfo[key];
      }
    }
    for (const key in purchaseFields) {
      if ({}.hasOwnProperty.call(purchaseFields, key)) {
        headerDataInfo[key] = purchaseOrgInfo[key];
      }
    }

    return { ...headerInfo, ...headerDataInfo, ...attachInfo };
  };

  useEffect(() => {
    if (rpHeaderId) {
      commonUpdate(rpHeaderId);
    } else {
      attachDs.loadData([]);
      attachDs.create({}, 0);
    }
  }, [rpHeaderId]);

  const handleCuxSubmit = (result) => {
    // const
    return new Promise(async (resolve, reject) => {
      const { handleWorkFlowCheck } = remote?.props?.process ?? {};
      const baseInfo = baseRef.current?.saveCurrentData();
      const purchaseOrgInfo = purchaseOrgInfoRef.current?.saveCurrentData();
      const rpLineListDs = lineRef.current?.saveCurrentData();
      const baseFlag = await baseInfo.validate();
      const purchaseOrgInfoFlag = await purchaseOrgInfo.validate();
      const rpLineListFlag = await rpLineListDs.validate();
      const currentHeaderInfo = getHeaderInfo();
      const rpLineList = rpLineListDs.toJSONData();
      const approveFlag = await handleWorkFlowCheck({
        result,
        rpLineList,
        currentHeaderInfo,
        location,
        baseFlag,
        purchaseOrgInfoFlag,
        rpLineListFlag,
      });
      if (approveFlag) {
        resolve();
      } else {
        reject();
      }
    });
  };

  const handleSubmit = (result) => {
    return new Promise(async (resolve, reject) => {
      if (!editDomFlag) {
        resolve();
      } else if (result === 'Approved') {
        const baseInfo = baseRef.current?.saveCurrentData();
        const purchaseOrgInfo = purchaseOrgInfoRef.current?.saveCurrentData();
        const rpLineListDs = lineRef.current?.saveCurrentData();
        const baseFlag = await baseInfo.validate();
        const purchaseOrgInfoFlag = await purchaseOrgInfo.validate();
        const rpLineListFlag = await rpLineListDs.validate();
        const currentHeaderInfo = getHeaderInfo();
        const rpLineList = rpLineListDs.toJSONData();

        if (baseFlag && purchaseOrgInfoFlag && rpLineListFlag && rpLineList) {
          const dataInfo = {
            ...currentHeaderInfo,
            rpLineList,
            customizeUnitCode:
              'SRPM.RP_PLATFORM_READONLY.BASEINFO,SRPM.RP_PLATFORM_READONLY.PURCHASEORGINFO,SRPM.RP_PLATFORM_READONLY.ATTACHMENT,SRPM.RP_PLATFORM_READONLY.EXTERNALFILE,SRPM.RP_PLATFORM_READONLY.LINEINFO',
          };
          const approveFlag = getResponse(await workFlowSubmitSave(dataInfo));
          if (approveFlag) {
            resolve();
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject();
          }
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    const { handleWorkFlowCheck } = remote?.props?.process ?? {};
    if (isFunction(onLoad)) {
      onLoad({
        submit: handleWorkFlowCheck ? handleCuxSubmit : handleSubmit,
      });
    }
    return () => {
      if (isFunction(onLoad)) {
        console.log('组件被销毁');
      }
    };
  }, [onLoad, headerInfo?.rpHeaderId, attachDs, remote]);

  useEffect(() => {
    const workflowLoading = headerInfo?.rpHeaderId;
    if (isFunction(onFormLoaded) && workflowLoading) {
      onFormLoaded(true);
    }
  }, [onFormLoaded, headerInfo?.rpHeaderId]);

  // update头行信息
  const commonUpdate = (currpHeaderId) => {
    setHeaderLoad(true);
    Promise.all([
      queryDetail({
        rpHeaderId: rpHeaderId || currpHeaderId,
        customizeUnitCode:
          'SRPM.RP_PLATFORM_READONLY.BASEINFO,SRPM.RP_PLATFORM_READONLY.PURCHASEORGINFO,SRPM.RP_PLATFORM_READONLY.ATTACHMENT,SRPM.RP_PLATFORM_READONLY.EXTERNALFILE',
        workFlowFlag: pubPathFlag ? 1 : undefined,
      }),
      lineRef.current?.loadLineDate(rpHeaderId || currpHeaderId),
    ])
      .then(async ([res1]) => {
        const workflowBusinessKey = res1?.workflowBusinessKey || undefined;
        if (workflowBusinessKey) {
          // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag([workflowBusinessKey]);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag([workflowBusinessKey]);
          setWorkFlowData({ approvaFlags, operationFlags });
        }
        if (getResponse(res1)) {
          const { attachmentUuid, externalAttachmentUuid } = res1;
          setHeaderData(res1);
          // eslint-disable-next-line no-unused-expressions
          baseRef.current?.loadCurrentData({ ...res1, editDom: editDomFlag });
          const { handleSetDsPara } = remote?.props?.process ?? {};
          if (isFunction(handleSetDsPara)) {
            handleSetDsPara({ baseDs: baseRef.current?.saveCurrentData(), pubPathFlag });
          }
          // eslint-disable-next-line no-unused-expressions
          purchaseOrgInfoRef.current?.loadCurrentData(res1);
          attachDs.loadData([{ ...res1, attachmentUuid, externalAttachmentUuid }]);
        }
      })
      .finally(() => {
        setTimeout(() => {
          setHeaderLoad(false);
        }, 100);
      });
  };

  const handleDetailField = (dsName, detailField) => {
    let fieldValues = '';
    switch (dsName) {
      case 'purchaseOrgInfoRef':
        fieldValues = purchaseOrgInfoRef.current
          ? purchaseOrgInfoRef.current?.handleGetDeatial(detailField)
          : '';
        break;
      case 'baseRef':
        fieldValues = baseRef.current ? baseRef.current?.handleGetDeatial(detailField) : '';
        break;
      default:
        fieldValues = undefined;
    }
    return fieldValues;
  };

  const currentAnchorContainer = () =>
    document.getElementsByClassName('sprm-query')[0] || document.body;

  const handleHeaderCancel = async () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`srpm.common.view.message.cancelReason`).d('取消原因'),
      children: (
        <Remark
          rpHeaderId={rpHeaderId}
          ref={remarkRef}
          required
          remarkLabel={intl.get(`srpm.common.view.message.cancelReason`).d('取消原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        const remarkCurrent = remarkRef.current?.saveCurrentData();
        const [{ cancelRemark }] = remarkCurrent.toJSONData();
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          setCancelLoading(true);
          cancel({ ...headerInfo, cancelRemark }).then((res) => {
            setCancelLoading(false);
            if (getResponse(res)) {
              history.push(`/srpm/requisition-plan/list`);
            }
          });
        } else {
          return false;
        }
      },
      movable: false,
      destroyOnClose: true,
      onCancel: () => { },
      style: { width: '380px' },
    });
  };

  // 打开操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationRecord rpHeaderId={rpHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const toEditPage = () => {
    history.push({
      pathname: `/srpm/requisition-plan/edit/${rpHeaderId}`,
      search: 'back=read',
    });
  };

  const handleReSync = () => {
    setResysLoading(true);
    batchReSync([rpHeaderId])
      .then((res) => {
        const result = getResponse(res);
        if (isArray(result) && result.some((ele) => ele.errorFlag)) {
          const { errorMessage } = result ? result[0] : {};
          notification.error({ message: errorMessage });
        } else if (isArray(result)) {
          commonUpdate(rpHeaderId);
          notification.success();
        }
      })
      .finally(() => {
        setResysLoading(false);
      });
  };

  const handleRevoke = async () => {
    const res = await revokeWorkFlow(headerInfo?.workflowBusinessKey);
    if (res && history) {
      history.push(`/srpm/requisition-plan/list`);
    }
  };

  const handleWorkFlowApprove = () => {
    const { approvaFlags } = workFlowData;
    const approvaFlag = approvaFlags?.[headerInfo?.workflowBusinessKey] || {};
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        history.push(`/srpm/requisition-plan/list`);
      },
    });
  };

  const HeaderBtn = observer(() => {
    const { approvaFlags, operationFlags } = workFlowData;
    const approvaFlag = approvaFlags?.[headerInfo?.workflowBusinessKey] || false;
    const operationFlag = operationFlags?.[headerInfo?.workflowBusinessKey] || {};
    const headerButtons = [
      {
        name: 'operation',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.operationRecords').d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'assignment',
          onClick: handleActHistory,
        },
      },
    ];

    const pubHeaderBtns = [...headerButtons];
    if (
      headerInfo?.rpStatus === 'APPROVED' &&
      headerInfo?.cancelStatusCode !== 'CANCELLED' &&
      !modalRpHeaderId
    ) {
      headerButtons.unshift({
        name: 'cancel',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 500,
          onClick: handleHeaderCancel,
          loading: cancelLoading,
          permissionList: [
            {
              code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.external.cancel`,
              type: 'button',
              meaning: '取消',
            },
          ],
        },
        child: intl.get(`hzero.common.button.cancel`).d('取消'),
      });
    }

    if (['NEW', 'REJECTED'].includes(headerInfo?.rpStatus)) {
      headerButtons.unshift({
        name: 'edit',
        btnComp: Button,
        btnProps: {
          icon: 'mode_edit',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 500,
          onClick: toEditPage,
          loading: headerLoading,
        },
        child: intl.get('hzero.common.button.edit').d('编辑'),
      });
    }
    if (headerInfo?.rpStatus === 'APPROVED' && headerInfo.syncStatus === 'SYNC_FAILURE') {
      headerButtons.unshift({
        name: 'autorenew',
        btnComp: Button,
        btnProps: {
          icon: 'autorenew',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 500,
          onClick: handleReSync,
          loading: resysLoading,
        },
        child: intl.get('hzero.common.button.reSyns').d('重新同步'),
      });
    }
    if (headerInfo?.approvalMethod === 'WORKFLOW' && approvaFlag) {
      headerButtons.push({
        name: 'approveWorkflow',
        btnProps: {
          icon: 'authorize',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 300,
          onClick: handleWorkFlowApprove,
          loading: headerLoading,
        },
        child: intl.get('hzero.common.button.approval').d('审批'),
      });
    }
    if (headerInfo?.approvalMethod === 'WORKFLOW' && operationFlag?.REVOKE) {
      headerButtons.push({
        name: 'revokeWorkflow',
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 300,
          onClick: handleRevoke,
          loading: headerLoading,
        },
        child: intl.get(`hzero.common.button.revokeApproval`).d('撤销审批'),
      });
    }

    const { queryHeaderBtnFc } = remote?.props?.process || {};
    const baseInfo = baseRef.current?.saveCurrentData ? baseRef.current?.saveCurrentData() : null;
    const lineDs = lineRef.current?.saveCurrentData ? lineRef.current?.saveCurrentData() : null;
    if (isFunction(queryHeaderBtnFc)) {
      headerButtons.push(queryHeaderBtnFc({ headerInfo, baseInfo }));
    }
    const newHeaderBtn = remote.process ? remote.process('cuxReadOnlyHeaderBtnsList', headerButtons, { headerDs: baseInfo, headerInfo, lineDs }) : headerButtons;

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SRPM.RP_PLATFORM_READONLY.BTNS',
            pro: true,
          },
          <DynamicButtons
            buttons={!pubPathFlag ? newHeaderBtn : pubHeaderBtns}
            maxNum={5}
            defaultBtnType="c7n-pro"
          />
        )}
      </>
    );
  }, [baseRef.current]);

  return (
    <Fragment>
      <Header
        backPath={!pubPathFlag ? '/srpm/requisition-plan/list' : undefined}
        title={intl.get(`srpm.common.view.title.onlyViewRequisition`).d('查看需求计划提报单')}
      >
        <HeaderBtn />
      </Header>
      <div
        className={classnames(
          'ued-detail-wrapper',
          maintainStyles['update-container'],
          'sprm-query'
        )}
        style={{ overflowY: 'auto' }}
      >
        <ChoerodonSpin spinning={headerLoading || false}>
          {!modalRpHeaderId && <Anchor currentAnchorContainer={currentAnchorContainer} />}
          <div className={maintainStyles['ued-detail-container']}>
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-basicInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.baseInfo').d('基本信息')}
                </h3>
                <Base
                  remote={remote}
                  ref={baseRef}
                  handleDetailField={handleDetailField}
                  customizeForm={customizeForm}
                  getLineDs={() => lineRef?.current?.saveCurrentData()}
                  code="SRPM.RP_PLATFORM_READONLY.BASEINFO"
                  path={path}
                  commonUpdate={commonUpdate}
                />
              </Content>
            </div>
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-organizationInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.purchaseOrgInfo').d('交易方及采买组织信息')}
                </h3>
                <PurchaseOrgInfo
                  ref={purchaseOrgInfoRef}
                  handleDetailField={handleDetailField}
                  customizeForm={customizeForm}
                  code="SRPM.RP_PLATFORM_READONLY.PURCHASEORGINFO"
                />
              </Content>
            </div>
            {remote?.render(
              'cuxReadOnlyPageOrgInfoLaterRender',
              null,
              { headerDs: baseRef.current?.saveCurrentData ? baseRef.current?.saveCurrentData() : null, headerInfo, rpHeaderId }
            )}
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-detailInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.detailLineInfo').d('需求计划明细信息')}
                </h3>
                <DemandLine
                  rpHeaderId={params.id || params.rpHeaderId}
                  ref={lineRef}
                  modalRpHeaderId={modalRpHeaderId}
                  commonUpdate={commonUpdate}
                  handleDetailField={handleDetailField}
                  headerInfo={headerInfo}
                  pubPathFlag={pubPathFlag}
                  customizeTable={customizeTable}
                  code="SRPM.RP_PLATFORM_READONLY.LINEINFO"
                  searchCode="SRPM.RP_PLATFORM_ERP_READONLY.LINE_SEARCH"
                  remote={remote}
                />
              </Content>
            </div>
            {remote?.render(
              'cuxReadOnlyPageRender',
              null,
              { headerDs: baseRef.current?.saveCurrentData ? baseRef.current?.saveCurrentData() : null, headerInfo, rpHeaderId }
            )}
            <div
              className={classnames(maintainStyles['rfx-detail-list-card'])}
              style={{ marginBottom: '16px' }}
            >
              <Content
                className={maintainStyles['custom-page-content']}
                style={{ display: 'flex' }}
              >
                <div>
                  <h3
                    id="sprm-workSpace-detail-content-attachmentInfo"
                    className={maintainStyles['rfx-card-item-title']}
                  >
                    {intl.get('hzero.common.upload.modal.title').d('附件')}
                  </h3>
                  <div className={classnames(maintainStyles['sprm-workspace-attachment'])}>
                    {customizeForm(
                      {
                        code: 'SRPM.RP_PLATFORM_READONLY.ATTACHMENT', // 必传，和unitCode一一对应
                        dataSet: attachDs,
                        custLoading: headerLoading,
                      },
                      <Form columns={1} labelLayout="float" dataSet={attachDs}>
                        <Attachment
                          readOnly
                          labelLayout="float"
                          help={
                            <span className="attachment-title">
                              {intl
                                .get('sprm.common.view.attachment.supportExtensions')
                                .d('支持扩展名')}
                              : .rar .zip .doc .docx .pdf .jpg...
                            </span>
                          }
                          name="attachmentUuid"
                          bucketName={PRIVATE_BUCKET}
                        />
                      </Form>
                    )}
                  </div>
                </div>
                <div className={maintainStyles['custom-page-content-att-divider']} />
                <div>
                  <h3
                    id="sprm-workSpace-detail-content-attachmentInfo"
                    className={maintainStyles['rfx-card-item-title']}
                  >
                    {intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件')}
                  </h3>
                  <div className={classnames(maintainStyles['sprm-workspace-attachment'])}>
                    {customizeForm(
                      {
                        code: 'SRPM.RP_PLATFORM_READONLY.EXTERNALFILE', // 必传，和unitCode一一对应
                        dataSet: attachDs,
                        custLoading: headerLoading,
                      },
                      <Form columns={1} labelLayout="float" dataSet={attachDs}>
                        <Attachment
                          readOnly
                          labelLayout="float"
                          help={
                            <span className="attachment-title">
                              {intl
                                .get('sprm.common.view.attachment.supportExtensions')
                                .d('支持扩展名')}
                              : .rar .zip .doc .docx .pdf .jpg .xlsx...
                            </span>
                          }
                          name="externalAttachmentUuid"
                          bucketName={PRIVATE_BUCKET}
                        />
                      </Form>
                    )}
                  </div>
                </div>
              </Content>
            </div>
          </div>
        </ChoerodonSpin>
      </div>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sprm.common',
      'srpm.common',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.attachment',
      'entity.item',
    ],
  }),
  WithCustomizeC7N({
    unitCode: [
      'SRPM.RP_PLATFORM_READONLY.BASEINFO',
      'SRPM.RP_PLATFORM_READONLY.LINEINFO',
      'SRPM.RP_PLATFORM_READONLY.PURCHASEORGINFO',
      'SRPM.RP_PLATFORM_READONLY.ATTACHMENT',
      'SRPM.RP_PLATFORM_READONLY.EXTERNALFILE',
      'SRPM.RP_PLATFORM_READONLY.BTNS',
    ],
  })
)(
  cuxRemote(
    {
      code: 'SRPM_CREATER_REQUISITION_PLAN',
      name: 'remote',
    },
    {
      process: {
        handleSetDsPara: undefined,
        handleLineDsUpdate: undefined,
        handleWorkFlowCheck: undefined,
      },
    }
  )(Index)
);
