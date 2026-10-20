import { routerRedux } from 'dva/router';
import { Tooltip } from 'choerodon-ui/pro';
import React, { useCallback, Fragment, useState } from 'react'; // useEffect
import intl from 'utils/intl';
import { isEmpty, isArray, isFunction } from 'lodash';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import querystring from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import { Icon } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import { confirmCopyLine } from '@/services/purchasePlatformService';
// import OperationNewRecord from '@/routes/components/OperationHistory';

import abnormal from '@/assets/abnormal.svg';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { Evaluate } from '../../components/Evaluate/index';
import '../index.less';
import { colorRender } from './../util';
import { revokeWorkFlow } from '@/routes/utils';
import styles from './index.less';

const Index = ({
  dispatch,
  customizeTable,
  lineDs,
  location,
  remote,
  handleLinkOtherUrl,
  cuxDisplayNumStyle,
  handleRenderMoreAction,
}) => {
  const [init, setInit] = useState(false);
  const { prStatusCode } = querystring.parse(location.search.substr(1)) || {};

  // 跳转详情
  const handleJumpDetail = useCallback((record, type) => {
    // const { prSourcePlatform, prHeaderId, prSourcePlatformMeaning } = record.toData();
    const search = type === 'edit' ? { type } : {};
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'query', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname:
            record.get('prSourcePlatform') === 'ERP'
              ? `/sprm/purchase-platform/erp-detail/${record.get('prHeaderId')}`
              : `/sprm/purchase-platform/noerp-detail/${record.get('prHeaderId')}`,
          state: {
            prSourcePlatformCode: record.get('prSourcePlatform'),
            prSourcePlatformMeaning: record.get('prSourcePlatformMeaning'),
          },
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  // const openOperatorRecord = ({ record }) => {
  //   return Modal.open({
  //     key: Modal.key(),
  //     drawer: true,
  //     style: { width: '1080px' },
  //     bodyStyle: { paddingTop: '8px' },
  //     title: intl.get(`hzero.common.button.operating`).d('操作记录'),
  //     children: <OperationNewRecord prHeaderId={record.get('prHeaderId')} />,
  //     closable: true,
  //     movable: false,
  //     destroyOnClose: true,
  //     onOk: () => {},
  //     okText: intl.get('hzero.common.status.closed').d('关闭'),
  //     footer: okBtn => okBtn,
  //   });
  // };

  // 变更按钮
  const handleChange = (record) => {
    const dateSelectd = record.toJSONData();
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'update', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else if (dateSelectd.prSourcePlatform === 'SRM') {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-platform/cancel-noerp-detail/${dateSelectd.prHeaderId}`,
          search: 'flag=update',
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-platform/cancel-erp-detail/${dateSelectd.prHeaderId}`,
          search: 'flag=update',
        })
      );
    }
  };

  // 关闭/取消详情
  const handleJumpDetailCancel = useCallback((record, type) => {
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({
          prHeaderId: record.get('prHeaderId'),
          type: type === 'edit' ? 'create' : 'cancel',
          location,
        }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else if (type === 'edit') {
      const search = {
        prHeaderId: record.get('prHeaderId'),
        newFlag: true,
      };
      dispatch(
        routerRedux.push({
          pathname: '/sprm/purchase-platform/creation-detail',
          search: querystring.stringify(search),
        })
      );
    } else {
      const search = {
        type: type || 'normal',
      };
      dispatch(
        routerRedux.push({
          pathname:
            record.get('prSourcePlatform') === 'ERP'
              ? `/sprm/purchase-platform/cancelerp-detail/${record.get('prHeaderId')}`
              : `/sprm/purchase-platform/cancel-noerp-detail/${record.get('prHeaderId')}`,
          state: {
            prSourcePlatformCode: record.get('prSourcePlatform'),
            prSourcePlatformMeaning: record.get('prSourcePlatformMeaning'),
          },
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  const handleRevoke = async ({ record }) => {
    const res = await revokeWorkFlow(record.get('workflowBusinessKey'));
    if (res) {
      lineDs.query();
    }
  };

  const handleWorkFlowApprove = async ({ record }) => {
    const approvaFlags = lineDs.getState('approvaFlags');
    const workflowBusinessKey = record.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        lineDs.query();
      },
    });
  };

  // 建议操作
  const renderAction = ({ record }) => {
    // 操作按钮
    const { prSourcePlatform, workflowBusinessKey } =
      record.get(['prSourcePlatform', 'workflowBusinessKey']) || {};
    const approvaFlags = lineDs?.getState('approvaFlags');
    const operationFlags = lineDs?.getState('operationFlags');
    const workflowApprovalFlag =
      workflowBusinessKey && approvaFlags ? approvaFlags[workflowBusinessKey] : false;
    const workflowRevokeFlag =
      workflowBusinessKey && operationFlags ? operationFlags[workflowBusinessKey]?.REVOKE : false;
    const actions = {
      copy: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={handleCopy}
          className={styles['sprm-col-btn']}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.copy`,
              type: 'button',
              meaning: '复制按钮权限',
            },
          ]}
        >
          {intl.get('hzero.common.button.copy').d('复制')}
        </Button>
      ),
      cancelHeader: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleJumpDetailCancel(record, 'cancel')}
          className={styles['sprm-col-btn']}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.control-cancel`,
              type: 'button',
              meaning: '取消按钮权限',
            },
          ]}
        >
          {intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
        </Button>
      ),
      closeHeader: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleJumpDetailCancel(record, 'close')}
          className={styles['sprm-col-btn']}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.control-close`,
              type: 'button',
              meaning: '关闭按钮权限',
            },
          ]}
        >
          {intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭')}
        </Button>
      ),
      edit: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleJumpDetailCancel(record, 'edit')}
          className={styles['sprm-col-btn']}
        >
          {intl.get(`hzero.common.button.edit`).d('编辑')}
        </Button>
      ),
      actionChange: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleChange(record, 'change')}
          className={styles['sprm-col-btn']}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.change`,
              type: 'button',
              meaning: '变更按钮权限',
            },
          ]}
        >
          {intl.get(`sprm.purchasePlatform.view.button.actionChange`).d('变更')}
        </Button>
      ),
      approveWorkFlow: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleWorkFlowApprove({ record })}
          className={styles['sprm-col-btn']}
        >
          {intl.get('hzero.common.button.approval').d('审批')}
        </Button>
      ),
      revokeWorkflow: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleRevoke({ record })}
          className={styles['sprm-col-btn']}
        >
          {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
        </Button>
      ),
    };

    const wholeOpt = {
      status: ['approved'],
      overlay: [],
    };
    if (prSourcePlatform === 'SRM') {
      wholeOpt.overlay.push('copy');
    }
    if (workflowBusinessKey && workflowApprovalFlag) {
      wholeOpt.overlay.push('approveWorkFlow');
    }
    if (workflowBusinessKey && workflowRevokeFlag) {
      wholeOpt.overlay.push('revokeWorkflow');
    }
    if (record.get('prHeaderChangedFlag') === 1 && record.get('closeStatusCode') !== 'CLOSEDING') {
      wholeOpt.overlay.push('actionChange');
    }
    if (
      ['PENDING', 'SEND_BACK', 'REJECTED'].includes(record.get('prStatusCode')) &&
      record.get('cancelStatusCode') === 'UNCANCELLED' &&
      record.get('changedFlag') === 0 &&
      record.get('prSourcePlatform') !== 'ERP'
    ) {
      wholeOpt.overlay.push('edit');
    }

    if (record.get('prHeaderClosedFlag') === 1) {
      wholeOpt.overlay.push('closeHeader');
    }
    if (record.get('prHeaderCancelledFlag') === 1) {
      wholeOpt.overlay.push('cancelHeader');
    }

    const moreAction = wholeOpt.overlay?.map((ele) => actions[ele]);
    const moreActionNew = isFunction(handleRenderMoreAction)
      ? handleRenderMoreAction(moreAction, record, lineDs)
      : moreAction;
    return moreActionNew;
  };

  const handleCopy = useCallback(() => {
    return new Promise(async (resolve) => {
      const dateSelectd = lineDs.current.toJSONData();
      if (dateSelectd.prSourcePlatform !== 'SRM') {
        notification.error({
          message: intl
            .get('sprm.common.warring.currentDateNotTrue')
            .d('非SRM来源的申请，不允许在SRM中进行变更'),
        });
        resolve();
      } else {
        if (remote) {
          const copyFlag = await remote.event.fireEvent('SPRM_PURCHASE_PLAFORM_PROCESS_COPY', {
            lineDs,
          });
          if (!copyFlag) return resolve();
        }
        confirmCopyLine(dateSelectd).then((res) => {
          resolve();
          if (res) {
            if (res.failed) {
              notification.error({ message: res.message });
            } else {
              notification.success();
              handleJumpDetailNew({ prHeaderId: res.prHeaderId, isCopy: 1 });
            }
          }
        });
      }
    });
  }, []);

  // 跳转详情
  const handleJumpDetailNew = useCallback(({ prHeaderId }) => {
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId, type: 'create', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else {
      const search = {
        prHeaderId,
        newFlag: true,
      };
      dispatch(
        routerRedux.push({
          pathname: '/sprm/purchase-platform/creation-detail',
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
    );
  };

  const lineColumns = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_COLUMNS',
    [
      {
        name: 'rpSourceFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'prStatusCode',
        width: 150,
        renderer: ({ value, record }) => colorRender(value, record.get('prStatusMeaning')),
      },
      {
        name: 'displayPrNum',
        width: 180,
        renderer: ({ value, record }) => (
          <div className="row-agent-column">
            <a
              onClick={() => handleJumpDetail(record)}
              style={{
                paddingRight: '8px',
                ...(record.get('urgentFlag') === 1 ? cuxDisplayNumStyle || {} : {}),
              }}
            >
              {value}
            </a>
            {record.get('incorrectFlag') === 1 ? (
              <Tooltip title={record.get('incorrectMsg')}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.get('syncStatus') === 'SYNC_FAILURE' ? (
              <Tooltip title={record.get('syncResponseMsg')}>
                <Icon
                  type="close"
                  style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
                />
              </Tooltip>
            ) : null}
            {record.get('urgentFlag') === 1 ? (
              <Tooltip title={intl.get(`sprm.common.model.common.urgent`).d('申请加急')}>
                <Icon
                  type="priority"
                  style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
                />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        name: 'operatorRecord',
        width: 150,
        overflow: true,
        renderer: ({ record }) => renderAction({ record }),
      },
      {
        name: 'workFlowApproveProcess',
        width: 150,
        renderer: viewDetail,
        tooltip: 'none',
      },
      {
        name: 'title',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'prTypeName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'prRequestedName',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
      },
      {
        name: 'requestDate',
        width: 120,
      },
      {
        name: 'createByName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'unitName',
        width: 100,
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'ouName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseOrgName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseAgentName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'originalCurrency',
        width: 100,
      },
      {
        name: 'amount',
        width: 150,
        renderer: ({ text, record }) =>
          record.get('headerPriceHiddenFlag') === 1 ? record.get('amountMeaning') : text,
      },
      {
        name: 'localCurrency',
        width: 100,
      },
      {
        name: 'localCurrencyNoTaxSum',
        width: 100,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        name: 'remark',
        width: 120,
      },
      {
        name: 'prNum',
        width: 150,
      },
      {
        name: 'lotNum',
        width: 120,
      },
      {
        name: 'urgentFlag',
        width: 80,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'urgentDate',
        width: 120,
      },
      {
        name: 'changedFlag',
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'closeStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => colorRender(record.get('closeStatusCode'), value),
      },
      {
        name: 'cancelStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => colorRender(record.get('cancelStatusCode'), value),
      },
      {
        name: 'labels',
        width: 120,
        renderer: ({ record }) => renderTags(record),
      },
      {
        name: 'evaluateFlag',
        width: 120,
        renderer: ({ record, dataSet }) => {
          return record.get('prStatusCode') === 'APPROVED' &&
            record.get('cancelStatusCode') === 'UNCANCELLED' ? (
              <Evaluate currentRecord={record} dataSet={dataSet} />
          ) : null;
        },
      },
    ],
    { currentType: 'allByWhole' }
  );

  const renderTags = (record) => {
    if (!isEmpty(record.get('labels')) && isArray(record.get('labels'))) {
      return record.get('labels')?.map((ele) => {
        return (
          <Tooltip title={ele.labelDescription}>
            <Icon type={ele.icon} className={styles['icon-color']} />
          </Tooltip>
        );
      });
    }
    return '-';
  };

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { _back } = location?.state || {};
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : lineDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  const cuxFieldProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_FIELDPROPS',
    {
      companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
      prStatusCode: { defaultValue: prStatusCode },
    },
    { currentType: 'allByWhole' }
  );

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.LIST',
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchCode="SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.SEARCHBAR"
            dataSet={lineDs}
            columns={lineColumns}
            data={[]}
            queryFieldsLimit={3}
            cacheState
            pagination={{
              pageSizeOptions: ['10', '20', '50', '100', '200'],
            }}
            searchBarConfig={{
              editorProps: {
                prStatusCode: {
                  optionsFilter: (options) =>
                    [
                      'PENDING',
                      'SUBMIT_SYNC',
                      'SUBMITTED',
                      'APPROVED',
                      'REJECTED',
                      'EXCUTED',
                      'WORKFLOW_APPROVAL',
                      'SEND_BACK',
                    ].includes(options.get('value')),
                },
              },
              fieldProps: cuxFieldProps,
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderNums"
                    dataSet={lineDs}
                    placeholder={intl.get('sprm.common.modal.enterPrNum').d('请输入采购申请单号')}
                  />
                ),
              },
              onClear: resetQueryDs,
              onReset: resetQueryDs,
              onQuery: handleQuery,
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default Index;
