import React, { Fragment, useEffect, useState, useRef, memo } from 'react'; // useEffect
import intl from 'utils/intl';
import { compose } from 'lodash';
import { Spin as ChoerodonSpin } from 'choerodon-ui';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import classnames from 'classnames';
import { Header, Content } from 'components/Page';
import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import { connect } from 'dva';
import { observer } from 'mobx-react-lite';
import cuxRemote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { openApproveModal } from '_components/ApproveModal';
import {
  queryDetail,
  // queryBlLineSource,
  batchBalanceSendBack, // 已平衡待发放-退回
  batchRelease,
  fetchDoExecute,
} from '@/services/rpExecuteProgramService';
import { revokeWorkFlow } from '@/routes/utils';

import Anchor from './components/Anchor';
import Base from './components/Base.js';
import PurchaseOrgInfo from './components/PurchaseOrgInfo.js';
import DemandLine from './components/DemandLine.js';
import OperationRecord from './components/OperationHistory';

import maintainStyles from './index.less';

import { getBlLineSourceColumns } from '../defColumn';
import { listDs } from '../stores';

// const organizationId = getCurrentOrganizationId();

const commonPrompt = 'srpm.common.model.common';

const Index = ({
  match: { params = {}, path = '' },
  location,
  history,
  dispatch,
  rpExecuteProgram,
  customizeTable,
  customizeForm,
  customizeBtnGroup,
  remote,
}) => {
  const baseRef = useRef({});
  const lineRef = useRef({});
  const purchaseOrgInfoRef = useRef({});
  const pubPathFlag = path.includes('/pub/srpm/rp-execute-platform/detail/');
  const [rpHeaderId] = useState(params.id || params.blHeaderId);
  const [headerLoading, setHeaderLoad] = useState(false);
  const [headerBtnLoading, setHeaderBtnLoading] = useState(false);
  const [releaseFlagCtrl, setReleaseFlag] = useState(null);
  const isReady = Number(querystring.parse(location.search.substr(1))?.isReady || 0);
  const releasedDetailFlag = Number(
    querystring.parse(location.search.substr(1))?.releasedDetailFlag || 0
  );
  const [splitNode, setSplitNode] = useState(null);
  const custCode = isReady
    ? 'SRPM.RP_EXECUTE_PLATFORM_DETAIL'
    : 'SRPM.RP_EXECUTE_PLATFORM_SUBMITTED_DETAIL';
  useEffect(() => {
    if (rpHeaderId) {
      commonUpdate(rpHeaderId);
    }
    fetchDoExecute([{ fullPathCode: 'SITE.SRPM.BL_RELEASE_EXECUTION_RULE' }]).then((res) => {
      if (res && !res.failed) {
        setReleaseFlag(res[0]);
      } else {
        notification.error({ message: res?.message });
      }
    });
  }, [rpHeaderId]);

  // update头行信息
  const commonUpdate = (currpHeaderId) => {
    setHeaderLoad(true);
    console.log(pubPathFlag, '小彭暴富');
    Promise.all([
      queryDetail({
        rpHeaderId: rpHeaderId || currpHeaderId,
        customizeUnitCode: `${custCode}.BASEINFO,${custCode}.LINEINFO,${custCode}.PURCHASEORGINFO`,
        workFlowFlag: pubPathFlag ? 1 : undefined,
      }),
      lineRef.current?.loadLineDate(rpHeaderId || currpHeaderId),
    ])
      .then(([res1]) => {
        if (getResponse(res1)) {
          setSplitNode(res1?.splitNode);
          // eslint-disable-next-line no-unused-expressions
          baseRef.current?.loadCurrentData(res1);
          // eslint-disable-next-line no-unused-expressions
          purchaseOrgInfoRef.current?.loadCurrentData(res1);
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

  const handleBlLineSourceModal = (record) => {
    const blLineId = record && record?.get('blLineId') ? record?.get('blLineId') : '';
    const tableDs = new DataSet(listDs('blLineSourceModal', blLineId));
    tableDs.query();
    // queryBlLineSource({ blLineId }).then(res => {
    //   if (res && !res.failed) {
    //     tableDs.loadData(res);
    //   } else {
    //     notification.error({
    //       message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
    //     });
    //   }
    // });

    Modal.open({
      title: intl.get(`srpm.common.model.common.sourceDocument`).d('来源单据'),
      drawer: true,
      style: {
        width: 742,
      },
      bodyStyle: { padding: 20 },
      children: (
        <div>
          <Table
            customizedCode="srpm-sourceDocument"
            selectionMode="none"
            dataSet={tableDs}
            columns={getBlLineSourceColumns({ releaseFlagCtrl })}
          />
        </div>
      ),
      okText: intl.get('srpm.common.model.common.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleHeaderBtn = (request, successCb = () => {}) => {
    setHeaderBtnLoading(true);
    request(rpExecuteProgram.currentSelected).then((res) => {
      if (res && !res.failed) {
        notification.success();
        successCb(res);
      } else {
        notification.error({
          message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
        });
      }
      setHeaderBtnLoading(false);
    });
  };

  // 打开操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      title: intl.get(`hzero.common.button.approveHistory`).d('审批记录'),
      children: <OperationRecord blHeaderId={rpHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const currentAnchorContainer = () =>
    document.getElementsByClassName('sprm-query')[0] || document.body;

  const renderHeader = () => {
    const headerDs = baseRef?.current?.saveCurrentData
      ? baseRef?.current?.saveCurrentData()
      : undefined;

    // debugger

    // console.log(approvaFlag, operationFlag, headerDs, headerDs?.getState('approvaFlags'), operationFlags)

    const RenderApproveBtns = observer(({ dataSet }) => {
      const approvaFlags = dataSet ? dataSet?.getState('approvaFlags') : undefined;
      const operationFlags = dataSet ? dataSet?.getState('operationFlags') : undefined;
      const workFlowBusinessKey = dataSet
        ? dataSet?.current?.get('workflowBusinessKey')
        : undefined;
      const approvaFlag = approvaFlags?.[workFlowBusinessKey];
      const operationFlag = operationFlags?.[workFlowBusinessKey];
      const { taskId, processInstanceId } = approvaFlag || {};
      return (
        <>
          {approvaFlags && approvaFlag && (
            <PermissionButton
              wait={500}
              type="c7n-pro"
              funcType="flat"
              onClick={() => {
                openApproveModal({
                  modalProps: {
                    closable: true,
                  },
                  taskId,
                  processInstanceId,
                  onSuccess: () => {
                    if (history) {
                      history.push(`/srpm/rp-execute-platform/list`);
                    }
                  },
                });
              }}
            >
              {intl.get('hzero.common.button.approval').d('审批')}
            </PermissionButton>
          )}
          {operationFlags && operationFlag?.REVOKE && (
            <PermissionButton
              wait={500}
              type="c7n-pro"
              funcType="flat"
              onClick={async () => {
                const res = await revokeWorkFlow(workFlowBusinessKey);
                if (res && history) {
                  history.push(`/srpm/rp-execute-platform/list`);
                }
              }}
            >
              {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
            </PermissionButton>
          )}
        </>
      );
    });

    if (isReady) {
      return (
        <>
          <PermissionButton
            icon="near_me"
            color="primary"
            type="c7n-pro"
            disabled={headerLoading || headerBtnLoading}
            onClick={() => {
              handleHeaderBtn(batchRelease, (res) => {
                dispatch({
                  type: 'rpExecuteProgram/updateState',
                  payload: { documentList: res },
                });

                history.push({
                  pathname: '/srpm/rp-execute-platform/ready-modal',
                });
              });
            }}
            permissionList={[
              {
                code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.bl.release`,
                type: 'button',
                meaning: '计划发放',
              },
            ]}
          >
            {intl.get(`${commonPrompt}.planToIssue`).d('计划发放')}
          </PermissionButton>
          <PermissionButton
            icon="reply"
            funcType="flat"
            type="c7n-pro"
            disabled={headerLoading || headerBtnLoading}
            onClick={() => {
              handleHeaderBtn(batchBalanceSendBack, () => {
                history.push({
                  pathname: '/srpm/rp-execute-platform/list',
                });
              });
            }}
            permissionList={[
              {
                code: `hzero.srm.requirement.requisition.plan.rp-execute-platform.ps.bl.sendback`,
                type: 'button',
                meaning: '退回',
              },
            ]}
          >
            {intl.get(`${commonPrompt}.return`).d('退回')}
          </PermissionButton>
          <RenderApproveBtns dataSet={headerDs} />
          <PermissionButton
            onClick={handleActHistory}
            type="c7n-pro"
            icon="assignment"
            funcType="flat"
          >
            {intl.get(`hzero.common.button.approveHistory`).d('审批记录')}
          </PermissionButton>
        </>
      );
    } else {
      return (
        <>
          <RenderApproveBtns dataSet={headerDs} />
          <PermissionButton
            onClick={handleActHistory}
            type="c7n-pro"
            icon="assignment"
            funcType="flat"
          >
            {intl.get(`hzero.common.button.approveHistory`).d('审批记录')}
          </PermissionButton>
        </>
      );
    }
  };

  return (
    <Fragment>
      <Anchor currentAnchorContainer={currentAnchorContainer} />
      {!pubPathFlag ? (
        <Header
          backPath="/srpm/rp-execute-platform/list"
          title={intl.get(`srpm.common.view.title.blTitle`).d('需求计划单')}
        >
          {renderHeader()}
        </Header>
      ) : (
        <Header title={intl.get(`srpm.common.view.title.blTitle`).d('需求计划单')}>
          {customizeBtnGroup(
            {
              code: 'SRPM.RP_EXECUTE_PLATFORM_SUBMITTED_DETAIL.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={[]} maxNum={5} defaultBtnType="c7n-pro" />
          )}
        </Header>
      )}

      <div
        className={classnames(
          'ued-detail-wrapper',
          maintainStyles['update-container'],
          'sprm-query'
        )}
        style={{ overflowY: 'auto' }}
      >
        <ChoerodonSpin spinning={headerLoading || false}>
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
                  ref={baseRef}
                  handleDetailField={handleDetailField}
                  customizeForm={customizeForm}
                  getLineDs={() => lineRef?.current?.saveCurrentData()}
                  code={`${custCode}.BASEINFO`}
                  pubPathFlag={pubPathFlag}
                  remote={remote}
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
                  code={`${custCode}.PURCHASEORGINFO`}
                />
              </Content>
            </div>
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-detailInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.detailLineInfo').d('需求计划明细信息')}
                </h3>
                <DemandLine
                  rpHeaderId={params.id || params.blHeaderId}
                  ref={lineRef}
                  splitNode={splitNode}
                  isReady={isReady}
                  releasedDetailFlag={releasedDetailFlag}
                  handleDetailField={handleDetailField}
                  handleBlLineSourceModal={handleBlLineSourceModal}
                  customizeTable={customizeTable}
                  code={`${custCode}.LINEINFO`}
                  pubPathFlag={pubPathFlag}
                  searchCode={`${custCode}.FILTER`} // SRPM.RP_EXECUTE_PLATFORM_DETAIL.FILTER
                />
              </Content>
            </div>
          </div>
        </ChoerodonSpin>
      </div>
    </Fragment>
  );
};

export default compose(
  connect(({ rpExecuteProgram }) => ({
    rpExecuteProgram,
  })),
  formatterCollections({
    code: [
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
  cuxRemote(
    {
      code: 'SRPM_RP_EXECUTE_PROGRAM',
      name: 'remote',
    },
  ),
  WithCustomizeC7N({
    unitCode: [
      'SRPM.RP_EXECUTE_PLATFORM_DETAIL.BASEINFO',
      'SRPM.RP_EXECUTE_PLATFORM_DETAIL.LINEINFO',
      'SRPM.RP_EXECUTE_PLATFORM_DETAIL.PURCHASEORGINFO',
      'SRPM.RP_EXECUTE_PLATFORM_DETAIL.FILTER',
      'SRPM.RP_EXECUTE_PLATFORM_SUBMITTED_DETAIL.BTNS',
      'SRPM.RP_EXECUTE_PLATFORM_SUBMITTED_DETAIL.BASEINFO',
      'SRPM.RP_EXECUTE_PLATFORM_SUBMITTED_DETAIL.LINEINFO',
      'SRPM.RP_EXECUTE_PLATFORM_SUBMITTED_DETAIL.PURCHASEORGINFO',
    ],
  })
)(memo(Index));
