import { connect } from 'dva';
import { DataSet, Modal, Button, Icon } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import intl from 'utils/intl';
import queryString from 'querystring';
import withProps from 'utils/withProps';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { yesOrNoRender } from 'utils/renderer';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SIEC } from '_utils/config';
import CommonImport from 'hzero-front/lib/components/Import';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { openApproveModal } from '_components/ApproveModal';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { createProUpdateInfo, createSiecProject } from '@/services/projectSpaceService.js';
import { checkPermission } from 'services/api';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import { colorTagRender } from './commonDetail/util.js';
import { revokeWorkFlow } from '@/routes/utils';
import './index.less';

import { wholeDs, projectChangeDs, createByPrDs } from './indexDs';

const Index = ({ dispatch, customizeBtnGroup, customizeTable, lineDs, ...props }) => {
  const [init, setInit] = React.useState(false);
  const [perssion, setPerssion] = useState({});

  const renderActionBtn = ({ record }) => {
    const {
      projectStatus,
      projectId,
      projectReqHeaderId,
      changingFlag,
      reqStatus,
      reqType,
      sourcePlatform,
      workflowBusinessKey,
    } = record?.get([
      'projectId',
      'projectStatus',
      'changingFlag',
      'reqType',
      'reqStatus',
      'projectReqHeaderId',
      'sourcePlatform',
      'workflowBusinessKey',
    ]);
    const operationFlags = lineDs?.getState('operationFlags') || {};
    const approvaFlags = lineDs?.getState('approvaFlags') || {};
    const allActions = {
      edit: (perssion.create || perssion.createPR) && (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleJumpDetail({ projectId, projectReqHeaderId, changingFlag, reqType })}
        >
          {intl.get(`hzero.common.button.edit`).d('编辑')}
        </Button>
      ),
      terminated: perssion.suspend && !(Number(changingFlag) === 1 && reqType !== 'SUSPEND') && (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleActionsUpdate({ record, reqType: 'SUSPEND' })}
        >
          {intl.get(`sprm.project.button.break`).d('中止')}
        </Button>
      ),
      change: perssion.change && !(Number(changingFlag) === 1 && reqType !== 'CHANGE') && (
        <Button
          type="text"
          style={{ marginLeft: 0, marginRight: 16 }}
          funcType="link"
          onClick={() => handleActionsUpdate({ record, reqType: 'CHANGE' })}
          hidden={(Number(changingFlag) === 1 && reqType !== 'CHANGE') || reqStatus === 'APPROVING'}
        >
          {intl.get(`sprm.common.view.button.actionChange`).d('变更')}
        </Button>
      ),
      // 变更中 && 项目类型reqType=REBOOT 的非审批中的数据
      reStart: perssion.restart && !(Number(changingFlag) === 1 && reqType !== 'REBOOT') && (
        <Button
          type="text"
          style={{ marginLeft: 0, marginRight: 16 }}
          funcType="link"
          onClick={() => handleActionsUpdate({ record, reqType: 'REBOOT' })}
        >
          {intl.get('hzero.common.button.restart').d('重启')}
        </Button>
      ),
      // 变更中 && 项目类型reqType=CONFIRM 的非审批中的数据
      finished: perssion.finish && !(Number(changingFlag) === 1 && reqType !== 'CONFIRM') && (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleActionsUpdate({ record, reqType: 'CONFIRM' })}
        >
          {intl.get('sprm.project.button.finished').d('确认完成')}
        </Button>
      ),
      approveWorkFlow: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleWorkFlowApprove({ record })}
        // className={styles['sprm-col-btn']}
        >
          {intl.get('hzero.common.button.approval').d('审批')}
        </Button>
      ),
      revokeWorkflow: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleRevoke({ record })}
        // className={styles['sprm-col-btn']}
        >
          {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
        </Button>
      ),
    };
    const {
      edit,
      terminated,
      reStart,
      change,
      finished,
      revokeWorkflow,
      approveWorkFlow,
    } = allActions;
    const btns = [];
    if (sourcePlatform === 'ERP') {
      if (['IN_PROGRESS'].includes(projectStatus) && reqStatus !== 'APPROVING') {
        btns.push(change);
        return btns;
      } else {
        return null;
      }
    }
    if (['NEW', 'APPROVAL_REJECTED'].includes(projectStatus) && Number(changingFlag) !== 1) {
      // return [edit];
      btns.push(edit);
    }
    if (['TERMINATED'].includes(projectStatus) && reqStatus !== 'APPROVING') {
      btns.push(reStart);
    }
    if (['IN_PROGRESS'].includes(projectStatus) && reqStatus !== 'APPROVING') {
      btns.push(terminated, change, finished);
    }
    if (approvaFlags[workflowBusinessKey]?.taskId && workflowBusinessKey) {
      btns.push(approveWorkFlow);
    }
    if (operationFlags[workflowBusinessKey]?.REVOKE && workflowBusinessKey) {
      btns.push(revokeWorkflow);
    }
    return btns.filter((e) => e)?.length > 0 ? btns : null;
  };

  // 按钮权限集查询
  useEffect(() => {
    const permissionCode = [
      'srm.bg.management.project.button.create',
      'srm.bg.management.project.button.createByPR',
      'srm.bg.management.project.button.suspend',
      'srm.bg.management.project.button.change',
      'srm.bg.management.project.button.finish',
      'srm.bg.management.project.button.restart',
    ];
    checkPermission(permissionCode).then((res) => {
      const data = getResponse(res);
      if (data) {
        const allPerssion = {};
        data.forEach((e) => {
          if (e.code.includes('change')) {
            allPerssion.change = e.approve;
          }
          if (e.code.includes('createByPR')) {
            allPerssion.createPR = e.approve;
          }
          if (e.code === 'srm.bg.management.project.button.create') {
            allPerssion.create = e.approve;
          }
          if (e.code.includes('suspend')) {
            allPerssion.suspend = e.approve;
          }
          if (e.code.includes('restart')) {
            allPerssion.restart = e.approve;
          }
          if (e.code.includes('finish')) {
            allPerssion.finish = e.approve;
          }
        });
        setPerssion(allPerssion);
      }
    });
  }, []);

  const renderChangeActionBtn = ({ record, tableDs }) => {
    const { workflowBusinessKey } = record?.get(['workflowBusinessKey']);
    const operationFlags = tableDs?.getState('operationFlags') || {};
    const approvaFlags = tableDs?.getState('approvaFlags') || {};
    const allActions = {
      approveWorkFlow: (
        <Button
          funcType="link"
          type="c7n-pro"
          onClick={() => handleWorkFlowApprove({ record, tableDs })}
        >
          {intl.get('hzero.common.button.approval').d('审批')}
        </Button>
      ),
      revokeWorkflow: (
        <Button funcType="link" type="c7n-pro" onClick={() => handleRevoke({ record, tableDs })}>
          {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
        </Button>
      ),
    };
    const { revokeWorkflow, approveWorkFlow } = allActions;
    const btns = [];
    if (approvaFlags[workflowBusinessKey]?.taskId && workflowBusinessKey) {
      btns.push(approveWorkFlow);
    }
    if (operationFlags[workflowBusinessKey]?.REVOKE && workflowBusinessKey) {
      btns.push(revokeWorkflow);
    }
    return btns.filter((e) => e)?.length > 0 ? btns : null;
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
    );
  };

  const handleChangeList = ({ record }) => {
    const tableDs = new DataSet(projectChangeDs({ projectId: record?.get('projectId') }));
    const columns = [
      { name: 'reqStatus', renderer: colorTagRender },
      {
        name: 'operation',
        width: 170,
        renderer: ({ record: currentR }) => renderChangeActionBtn({ record: currentR, tableDs }),
      },
      {
        name: 'workFlowApproveProcess',
        width: 150,
        renderer: viewDetail,
        tooltip: 'none',
      },
      {
        name: 'reqNum',
        renderer: ({ value, record: headerRecord }) => (
          <a
            onClick={() =>
              handleJumpDetail({
                ...headerRecord?.get([
                  'projectId',
                  'projectReqHeaderId',
                  'changingFlag',
                  'reqType',
                ]),
                type: 'detailQuery',
              })
            }
          >
            {value}
          </a>
        ),
      },
      { name: 'reqType', renderer: ({ record: currentR }) => currentR.get('reqTypeMeaning') },
      { name: 'createdByName' },
      { name: 'creationDate' },
    ];
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('sprm.project.view.title.viewChangeDetail').d('项目控制申请单相关单据'),
      children: customizeTable(
        {
          code: 'SIEC.PROJECT_LIST.DETAIL_LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchBarConfig={{
            closeFilterSelector: true,
          }}
          searchCode="SIEC.PROJECT_LIST.DETAIL_SEARCH"
          dataSet={tableDs}
          columns={columns}
        />
      ),
      closable: true,
      movable: false,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      destroyOnClose: true,
    });
  };

  const lineColumns = [
    {
      name: 'projectStatus',
      renderer: colorTagRender,
    },
    {
      name: 'operation',
      width: 170,
      renderer: ({ record }) => renderActionBtn({ record }),
    },
    {
      name: 'workFlowApproveProcess',
      width: 150,
      renderer: viewDetail,
      tooltip: 'none',
    },
    { name: 'changingFlag', width: 80, renderer: ({ value }) => yesOrNoRender(value) },
    {
      name: 'projectNum',
      width: 150,
      renderer: ({ record, value }) => (
        <a
          onClick={() =>
            handleJumpDetail({
              ...record?.get(['projectId', 'projectReqHeaderId', 'changingFlag', 'reqType']),
              type: 'query',
            })
          }
        >
          {value}
        </a>
      ),
    },
    { name: 'projectName', width: 220 },
    { name: 'projectTypeId', width: 200, renderer: ({ record }) => record?.get('projectTypeName') },
    {
      name: 'principalUserId',
      width: 150,
      renderer: ({ record }) => record?.get('principalUserName'),
    },
    {
      name: 'projectChangeInfo',
      width: 150,
      renderer: ({ record }) => (
        <Button
          funcType="link"
          onClick={() => handleChangeList({ record })}
          style={{ marginRight: '10px' }}
        >
          {intl.get('hzero.common.button.details').d('查看详情')}
        </Button>
      ),
    },
    { name: 'companyId', width: 210, renderer: ({ record }) => record?.get('companyName') },
    { name: 'ouId', width: 210, renderer: ({ record }) => record?.get('ouName') },
    {
      name: 'purchaseOrgId',
      width: 210,
      renderer: ({ record }) => record?.get('purchaseOrganizationName'),
    },
    { name: 'createdByName' },
    { name: 'creationDate', width: 140 },
    { name: 'departmentId', width: 150, renderer: ({ record }) => record?.get('departmentName') },
    { name: 'sourcePlatform', width: 100 },
  ];

  // reqType必输
  const handleActionsUpdate = async ({ reqType, record }) => {
    const data = record.toJSONData();
    const { tenantId, projectId, projectReqHeaderId } = record.get([
      'tenantId',
      'projectId',
      'projectReqHeaderId',
    ]);
    let res = {};
    if (!projectReqHeaderId) {
      res = getResponse(
        await createProUpdateInfo({ ...data, reqType, query: { projectId, tenantId, reqType } })
      );
    }
    if (res?.projectReqHeaderId || projectReqHeaderId) {
      if (reqType === 'CHANGE') {
        dispatch(
          routerRedux.push({
            pathname: `/sprm/project-workspace/update-detail/${projectReqHeaderId || res?.projectReqHeaderId
              }`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/sprm/project-workspace/other/${projectId || res?.projectId}/${projectReqHeaderId || res?.projectReqHeaderId
              }`,
          })
        );
      }
    }
  };

  const handleJumpDetail = useCallback(({ projectId, projectReqHeaderId, type, reqType }) => {
    const search = {};
    if (!projectId) {
      dispatch(
        routerRedux.push({
          pathname: '/sprm/project-workspace/edit-detail/new',
          search: queryString.stringify(search),
        })
      );
    } else if (type === 'query') {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/project-workspace/read-detail/${projectId}`,
          search: queryString.stringify(search),
        })
      );
    } else if (reqType === 'CHANGE' && type) {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/project-workspace/update-read-detail/${projectReqHeaderId}`,
          search: queryString.stringify({ ...search, source: type }),
        })
      );
    } else if (reqType && type) {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/project-workspace/other/${projectId}/${projectReqHeaderId}`,
          search: queryString.stringify({ ...search, source: type }),
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/project-workspace/edit-detail/${projectId}`,
          search: queryString.stringify(search),
        })
      );
    }
  }, []);

  const getQueryFrom = () => {
    const { selected = [] } = lineDs || {};
    // const selectedDate = exportDs.selected ? exportDs.selected.map(ele => ele.toJSONData()) : [];
    if (selected?.length > 0) {
      const projectIds = selected?.map((ele) => ele.get('projectId'));
      return { projectIds };
    } else {
      const queryData = lineDs.queryDataSet.current.toJSONData();
      const { __dirty, __id, _status, ...others } = queryData;
      return {
        ...(others || {}),
        customizeUnitCode: 'SIEC.PROJECT_LIST.SEARCH,SIEC.PROJECT_LIST.LIST',
        exportSearchbarUnitCode: 'SIEC.PROJECT_LIST.SEARCH,SIEC.PROJECT_LIST.LIST',
      };
    }
  };

  const handleCreatePrModal = () => {
    const prModalDs = new DataSet(createByPrDs());
    const columns = [
      {
        name: 'displayPrNum',
        width: 180,
        renderer: ({ value, record }) => `${value}-${record.get('displayLineNum')}`,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'companyName',
        width: 220,
      },
      {
        name: 'ouName',
        width: 220,
      },
      {
        name: 'invOrganizationName',
        width: 220,
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'availableQuantity',
        width: 80,
        renderer: ({ record }) =>
          math.minus(record.get('quantity'), record.get('occupiedQuantity')),
      },
      {
        name: 'uomName',
        width: 80,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'neededDate',
        width: 170,
      },
      {
        name: 'prRequestedName',
        width: 130,
        renderer: ({ value, record }) =>
          record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
      },
      {
        name: 'purchaseAgentName',
        width: 150,
      },
      {
        name: 'executorName',
        width: 120,
      },
      {
        name: 'unitName',
        width: 120,
      },
      {
        name: 'requestDate',
        width: 170,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'sourcePlatformCode',
        width: 130,
        renderer: ({ record }) => record.get('prSourcePlatformMeaning'),
      },
      {
        name: 'assignedDate',
        width: 170,
      },
    ];
    const OkObserve = observer(() => {
      return (
        <Button
          color="primary"
          onClick={async () => {
            const { selected } = prModalDs;
            // if (selected?.length === 1) {
            const res = getResponse(await createSiecProject(selected?.map((ele) => ele.toData())));
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/sprm/project-workspace/edit-detail/${res?.projectId}`,
                })
              );
            } else {
              return false;
            }
          }}
          disabled={prModalDs.selected.length === 0}
        >
          {intl.get('hzero.common.model.sure').d('确定')}
        </Button>
      );
    });
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1090 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('sprm.project.view.title.createByPr').d('引用采购申请'),
      children: customizeTable(
        {
          code: 'SIEC.PROJECT_LIST.CREATEBYPR_LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchBarConfig={{
            closeFilterSelector: true,
            left: {
              render: () => (
                <MutlTextFieldSearch
                  name="multiSelectHeaderAndLineNums"
                  dataSet={prModalDs}
                  placeholder={intl
                    .get('sprm.common.modal.enterPrNumOrLineNum')
                    .d('请输入采购申请单号-行号')}
                />
              ),
            },
            onQuery: ({ params = {} }) => {
              const { customizeOrderField = undefined } = params;
              const clearParams = {}; // 清理
              // eslint-disable-next-line no-unused-expressions
              const dataObj = prModalDs.queryDataSet?.current?.toData() || {};
              if (dataObj) {
                for (const key in dataObj) {
                  if (!['multiSelectHeaderAndLineNums'].includes(key)) {
                    // 排除掉自定义的查询条件
                    if (!Object.prototype.hasOwnProperty.call(params, key)) {
                      clearParams[key] = undefined;
                    }
                  }
                }
              }
              prModalDs.setQueryParameter('customizeOrderField', customizeOrderField);
              // eslint-disable-next-line no-unused-expressions
              prModalDs.queryDataSet.current
                ? prModalDs.queryDataSet.current.set({
                  ...params,
                  ...clearParams,
                })
                : prModalDs.queryDataSet.loadData([
                  {
                    ...params,
                    ...clearParams,
                  },
                ]);
              prModalDs.query();
            },
            onClear: () => prModalDs.queryDataSet?.current?.reset(),
            onReset: () => prModalDs.queryDataSet?.current?.reset(),
          }}
          searchCode="SIEC.PROJECT_LIST.CREATEBYPR_FILTER"
          dataSet={prModalDs}
          columns={columns}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      footer: (_, cancelBtn) => (
        <div>
          <OkObserve />
          {cancelBtn}
        </div>
      ),
    });
  };

  const handleRevoke = async ({ record, tableDs }) => {
    const res = await revokeWorkFlow(record.get('workflowBusinessKey'));
    if (res) {
      if (tableDs) {
        tableDs.query();
      } else {
        lineDs.query();
      }
    }
  };

  const handleWorkFlowApprove = async ({ record, tableDs }) => {
    const approvaFlags = tableDs
      ? tableDs.getState('approvaFlags')
      : lineDs.getState('approvaFlags');
    const workflowBusinessKey = record.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    console.log(workflowBusinessKey, approvaFlags, approvaFlags?.[workflowBusinessKey]);
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        if (tableDs) {
          tableDs.query();
        } else {
          lineDs.query();
        }
      },
    });
  };

  const HeaderBtn = () => {
    const { selected = [] } = lineDs;
    const headerButtons = [
      {
        name: 'createTotal',
        group: true,
        btnType: 'c7n-pro',
        children: [
          {
            name: 'create',
            btnType: 'c7n-pro',
            child: intl.get(`sprm.project.model.common.button.creatRFIManually`).d('手工创建'),
            btnProps: {
              onClick: handleJumpDetail,
            },
          },
          {
            name: 'createByPr',
            btnType: 'c7n-pro',
            child: intl.get(`sprm.project.model.common.button.createByPr`).d('引用申请创建'),
            btnProps: {
              onClick: handleCreatePrModal,
            },
          },
        ],
        hidden: !(perssion.create || perssion.createPR),
        child: (
          <Button funcType="raised" color="primary" icon="add">
            {intl.get(`hzero.common.button.creation`).d('新建')}
            <Icon type="expand_more" style={{ marginLeft: 4 }} />
          </Button>
        ),
      },
      {
        name: 'import',
        btnComp: CommonImport,
        btnProps: {
          prefixPatch: `${SRM_SIEC}`,
          businessObjectTemplateCode: 'SRM_C_SIEC_PROJECT_IMPORT',
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
          buttonText: intl.get('hzero.common.button.import').d('导入'),
        },
        child: intl.get('hzero.common.button.import').d('导入'),
      },
      {
        name: 'exportNew',
        noNest: true,
        child: (text) => (
          <ExcelExportPro
            data-name="exportNew"
            {...{
              templateCode: 'SRM_C_SIEC_PROJECT_LIST',
              wait: 300,
              buttonText:
                text ||
                (selected?.length > 0
                  ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                  : intl.get('hzero.common.export.new').d('导出-新')),
              requestUrl: `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project/export`,
              method: 'POST',
              allBody: true,
              queryParams: () => getQueryFrom(true),
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
              },
            }}
          />
        ),
      },
    ];
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SIEC.PROJECT_LIST.BTN',
            pro: true,
          },
          <DynamicButtons
            buttons={headerButtons}
            permissions={[
              { code: `srm.bg.management.project.button.createByPR`, name: 'createByPr' },
              { code: `srm.bg.management.project.button.create`, name: 'create' },
              { code: `srm.bg.management.project.button.export`, name: 'exportNew' },
              { code: `srm.bg.management.project.button.import`, name: 'import' }
            ]}
          />
        )}
      </>
    );
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.reset();
  };

  const handleQuery = ({ params = {} }) => {
    const { location = {} } = props;
    const { _back } = location?.state || {};
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiProjectNum'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }

    lineDs.setQueryParameter('customizeOrderField', customizeOrderField);
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

  return (
    <Fragment>
      <Header title={intl.get('sprm.project.model.common.proInfoWorkbench').d('项目信息工作台')}>
        <HeaderBtn />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          {customizeTable(
            {
              code: 'SIEC.PROJECT_LIST.LIST',
              dataSet: lineDs,
            },
            <SearchBarTable
              cacheState
              style={{ maxHeight: `calc(100vh - 200px)` }}
              searchCode="SIEC.PROJECT_LIST.SEARCH"
              dataSet={lineDs}
              columns={lineColumns}
              searchBarConfig={{
                left: {
                  render: () => (
                    <MutlTextFieldSearch
                      name="multiProjectNum"
                      dataSet={lineDs}
                      placeholder={intl
                        .get('sprm.project.search.multiProjectNum')
                        .d('请输入项目编号查询')}
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
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(() => ({})),
  formatterCollections({
    code: [
      'sprm.common',
      'sprm.purchasePlatform',
      'hzero.common',
      'sprm.project',
      'sprm.purchaseRequest',
      'ssrc.tenderPlan',
      'ssrc.inquiryHall',
      'ssrc.common',
      'sodr.quotePurchaseRequisition',
    ],
  }),
  withProps(
    () => {
      const lineDs = new DataSet(wholeDs());
      return {
        lineDs,
      };
    },
    { cacheState: true }
  ),
  withCustomize({
    unitCode: [
      'SIEC.PROJECT_LIST.BTN',
      'SIEC.PROJECT_LIST.LIST',
      'SIEC.PROJECT_LIST.DETAIL_LIST',
      'SIEC.PROJECT_LIST.DETAIL_SEARCH',
      'SIEC.PROJECT_LIST.CREATEBYPR_LIST',
      'SIEC.PROJECT_LIST.CREATEBYPR_FILTER',
    ],
  })
)(Index);
