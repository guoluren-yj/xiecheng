/**
 * List - 供应商关联业务单据列表
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import querystring from 'querystring';
import { withRouter } from 'dva/router';
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { ExternalCustomizeContext } from 'srm-front-cuz/lib/utils';

import { handleGetSteps } from '@/services/purchaserEvaluationWorkbenchServices';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { tabModelTable } from '@/routes/components/C7nDynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { queryTabsCount } from '@/services/workbenchService';
import { sampleColumns } from './stores/sampleDS';
import { investigateColumns } from './stores/investigateDS';
import { siteInspectionColumns } from './stores/siteInspectionDS';
import { agreementColumns } from './stores/agreementDS';
import { evaluationColumns } from './stores/evaluationDS';
import { inquiryColumns } from './stores/inquiryDS';
import { bidColumns } from './stores/bidDS';
import { rectifyColumns } from './stores/rectifyDS';
import { materialColumns } from './stores/materialDS';
import { evalEventColumns } from './stores/evalEventDS';
import { getColumns } from './stores/supplierEvaluationDS';
import { getSupplierChangeColumns } from './stores/supplierChangeDS';
import { ppapDocumentColumns } from './stores/ppapDocumentDS';
import { getTabPaneList } from './utils';

const { TabPane } = Tabs;
const tableMaxHeight = `calc(100vh - 200px)`;

const Index = props => {
  const {
    currentRow,
    history,
    customizeTable,
    customizeTabPane,
    defaultActiveKey,
    menuPermissions = {},
    platformSupplierRemote,
  } = props;
  const tabPaneList = useMemo(() => getTabPaneList({ currentRow }), []);
  const [tableList, setTableList] = useState([]);
  const [progressList, setProgressList] = useState([]);

  const [dealNum, setDealNum] = useState({});
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const { companyId, supplierCompanyId, partnerId } = currentRow;

  // 埋点参数
  const supplierRemoteParams = {
    supplierCompanyId,
  };

  const getStepList = useCallback(() => {
    handleGetSteps().then(response => {
      const res = getResponse(response);
      if (res) {
        setProgressList(res);
      }
    });
  }, []);

  useEffect(() => {
    // 查询配置表
    queryRelTableConfig('sslm_relation_req').then(res => {
      setTableList(res);
    });
    getStepList();
  }, [currentRow]);

  // tab发生改变时的回调
  const handleTabChange = useCallback(
    key => {
      setActiveKey(key);
    },
    [activeKey]
  );

  /**
   * 调查表维护按钮回调
   * releaseOperateFlag - 调查表发布
   * approveOperateFlag - 调查表审批
   */
  const handleInvestg = useCallback(record => {
    const {
      data: { releaseOperateFlag, approveOperateFlag, investgHeaderId, investigateTemplateId },
    } = record;
    if (releaseOperateFlag) {
      // 调查表创建及发布
      const oldRouter = `/sslm/investigation/detail?investgHeaderId=${investgHeaderId}&investigateTemplateId=${investigateTemplateId}`;
      const newRouter = `/sslm/purchaser-investigation/wait-release/detail/${investgHeaderId}/${investigateTemplateId}?type=edit`;
      const router = menuPermissions.purchaserInvestig ? newRouter : oldRouter;
      history.push(router);
    }
    if (approveOperateFlag) {
      // 调查表审批
      const oldRouter = `/sslm/investigation-approval/detail?investgHeaderId=${investgHeaderId}&investigateTemplateId=${investigateTemplateId}`;
      const newRouter = `/sslm/purchaser-investigation/wait-approve/detail/${investgHeaderId}/${investigateTemplateId}`;
      const router = menuPermissions.purchaserInvestig ? newRouter : oldRouter;
      history.push(router);
    }
  }, []);

  /**
   * 送样维护按钮回调
   * releaseOperateFlag - 送样发布
   * approveOperateFlag - 送样确认
   */
  const handleSample = useCallback(record => {
    const {
      data: { releaseOperateFlag, approveOperateFlag, reqId, reqStatus, isPurchaseFlag },
    } = record;
    if (releaseOperateFlag) {
      history.push(`/sslm/buyer-apply-release/detail/${reqId}/${reqStatus}`);
    }
    if (approveOperateFlag) {
      history.push(
        `/sslm/buyer-apply-confirm/detail/${reqId}/${reqStatus}?isSupplier=${isPurchaseFlag}`
      );
    }
  }, []);

  /**
   * 现场考察维护按钮回调
   * operateFlag - 现场考察管理
   * evalFlag - 现场考评填制
   */
  const handleSiteInspection = useCallback(record => {
    const {
      data: { operateFlag, evalFlag, evalHeaderId, evalType },
    } = record;
    if (operateFlag) {
      history.push(`/sslm/site-investigate-report/manage/detail/${evalHeaderId}/${evalType}`);
    }
    if (evalFlag) {
      history.push(`/sslm/site-investigate-report/filling/detail/${evalHeaderId}`);
    }
  }, []);

  // 物料认证跳转详情
  const jumpMaterial = useCallback(record => {
    const { authReqStatusCode, itemAuthReqHeaderId, nodeCode } = record.get([
      'authReqStatusCode',
      'itemAuthReqHeaderId',
      'nodeCode',
    ]);
    const pathname = `/smdm/material-certification-pool/read/${itemAuthReqHeaderId}`;
    const search = querystring.stringify(
      filterNullValueObject({
        node: nodeCode,
        source: ['EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE'].includes(authReqStatusCode)
          ? 'certified'
          : '',
      })
    );
    props.history.push({
      pathname,
      search,
    });
  }, []);

  /**
   * 考评事件页面跳转处理函数
   * @param {object} record
   */
  const jumpEvalEvent = useCallback((record, openTabFlag) => {
    const { evalEventHeaderId } = record.get(['evalEventHeaderId']);
    if (openTabFlag) {
      openTab({
        key: `/sslm/include/event-record/detail/${evalEventHeaderId}`,
        title: intl.get('sslm.eventRecord.view.title.checkEventRecord').d('查看考评事件'),
        search: querystring.stringify({
          isView: 1,
          openTab: 1,
        }),
      });
    } else {
      const pathname = `/sslm/event-record/detail/${evalEventHeaderId}`;
      props.history.push(pathname);
    }
  }, []);

  const modelTableProps = {
    queryParams: {
      companyId,
      supplierCompanyId,
      relationId: partnerId,
    },
    tableList,
  };

  // 跳转供应商信息变更编辑页
  const jumpSupplierChangeDetail = useCallback(
    record => {
      const { supChange, oldSupChange } = menuPermissions || {};
      if (!supChange && !oldSupChange) {
        notification.error({
          message: intl
            .get('sslm.common.view.message.notMenuPermissions')
            .d('当前用户没有分配菜单权限，请联系您的项目经理/运维经理分配权限!'),
        });
        return;
      }
      const {
        changeReqId,
        investgHeaderId,
        investigateTemplateId,
        companyId: newCompanyId,
        supplierCompanyId: newSupplierCompanyId,
      } = record.get([
        'changeReqId',
        'investgHeaderId',
        'investigateTemplateId',
        'companyId',
        'supplierCompanyId',
      ]);
      const oldRouter = `/sslm/supplier-inform-change/detail/${changeReqId}/${newCompanyId}`;
      const newRouter = `/sslm/supplier-inform-change-new/detail/edit`;
      const router = supChange ? newRouter : oldRouter;
      const oldParam = {
        supplierCompanyId: newSupplierCompanyId,
      };
      const newParams = {
        changeReqId,
        investgHeaderId,
        investigateTemplateId,
      };
      const params = supChange ? newParams : oldParam;

      const search = querystring.stringify(filterNullValueObject(params));
      props.history.push({
        pathname: router,
        search,
      });
    },
    [menuPermissions.supChange, menuPermissions.oldSupChange]
  );

  /**
   * ppap单据页面跳转处理函数
   * @param {object} record
   */
  const jumpPpapDocument = useCallback(record => {
    const { projectHeaderId, projectType } = record?.get(['projectHeaderId', 'projectType']) || {};
    if (projectHeaderId) {
      props.history.push({
        pathname: `/sqam/PPAPWorkbench/detail/${projectHeaderId}`,
        search: querystring.stringify({
          operate: 'view',
          type: 'project-all',
          projectType,
        }),
      });
    }
  }, []);

  // 招投标跳转详情
  const bidDetail = useCallback(record => {
    const { data: { rfxHeaderId, projectLineSectionId, sourceCategory } = {} } = record || {};
    const search = querystring.stringify({
      projectLineSectionId,
      rfxHeaderId,
      sourceCategory,
    });
    if (rfxHeaderId) {
      props.history.push({
        pathname: `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`,
        search,
      });
    }
  }, []);

  const columnsObj = {
    investigate: investigateColumns({
      handleInvestg,
      operationRecordsModal,
      menuPermissionsFlag: menuPermissions.purchaserInvestig,
    }),
    sample: sampleColumns({ handleSample, operationRecordsModal }),
    siteInspection: siteInspectionColumns({ handleSiteInspection, operationRecordsModal }),
    evaluation: evaluationColumns({ operationRecordsModal }),
    agreement: agreementColumns({ contractWorkspace: menuPermissions.contractWorkspace }),
    inquiry: inquiryColumns({ supplierCompanyId }),
    bid: bidColumns({ bidDetail, supplierCompanyId }),
    rectify: rectifyColumns(),
    material: materialColumns({ jumpMaterial }),
    evalEvent: evalEventColumns({ jumpEvalEvent }),
    supplierEvaluationReport: getColumns({ history, progressList }),
    supplierInfoChange: getSupplierChangeColumns({
      jumpSupplierChangeDetail,
      operationRecordsModal,
      supChange: menuPermissions.supChange,
      oldSupChange: menuPermissions.oldSupChange,
    }),
    ppapDocument: ppapDocumentColumns({ jumpPpapDocument }),
  };

  // 如果有埋点，渲染埋点返回的TabPane
  const tabPaneRow = platformSupplierRemote ? (
    platformSupplierRemote.process(
      'SSLM_PLATFORM_SUPPLIER_CUSTOMER_TABPANE',
      <></>,
      supplierRemoteParams
    )
  ) : (
    <></>
  );

  // 处理tab的数据数量
  const handleTabNum = async () => {
    const counts = getResponse(
      await queryTabsCount({
        companyId,
        supplierCompanyId,
        companyIdForSupplierService: companyId,
      })
    );
    if (counts) {
      setDealNum(counts);
    }
  };

  useEffect(() => {
    handleTabNum();
  }, [tabPaneList]);

  return (
    <ExternalCustomizeContext.Provider
      value={{
        currentData: currentRow,
      }}
    >
      {customizeTabPane(
        {
          code: 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.RELATED_DOC',
          custDefaultActive: key => handleTabChange(key || activeKey),
        },
        <Tabs tabPosition="left" activeKey={activeKey} onChange={handleTabChange}>
          {tabPaneList.map(tabPane => (
            <TabPane key={tabPane.key} tab={tabPane.tab} count={() => dealNum[tabPane.key] || '0'}>
              {customizeTable(
                {
                  code: tabPane.customizeCode,
                },
                <SearchBarTable
                  dataSet={tabPane.dataSet}
                  style={{ maxHeight: tableMaxHeight }}
                  columns={columnsObj[tabPane.key]}
                  searchCode={tabPane.searchCode}
                  searchBarConfig={{
                    expandable: false,
                    closeFilterSelector: true,
                  }}
                />
              )}
            </TabPane>
          ))}
          {tabPaneRow}
          {tabModelTable(modelTableProps)}
        </Tabs>
      )}
    </ExternalCustomizeContext.Provider>
  );
};

export default withRouter(Index);
