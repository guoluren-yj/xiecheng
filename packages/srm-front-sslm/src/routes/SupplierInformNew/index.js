/*
 * @Date: 2023-04-04 15:39:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { Tabs } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { compose, map, isEmpty } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { queryCounts } from '@/services/supplierInformService';
import ListTooltip from '@/routes/components/AiApprove/ListTooltip';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { tableHeight, tableMaxHeight, renderStatus, useSetState } from '@/routes/components/utils';
import {
  queryAllApprovalData,
  ApprovalBtn,
  RevokeApprovalBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';
import MoreButton from '@/routes/components/MoreButton';
import { getNotPermissionBtns } from '@/routes/components/utils/utils';

import HeaderBtns from './HeaderBtns';
import { documentList } from './utils';
import { getDocumentsListDS } from './stores/getIndexDS';

const { TabPane } = Tabs;
let allSearchBarRef = null; // 全部页签searchBarRef

const Index = ({
  remote,
  dispatch,
  waitSubmitDs,
  approvalDs,
  allDs,
  mixObj,
  custLoading,
  customizeTable,
  customizeBtnGroup,
  customizeTabPane,
}) => {
  const [countList, setCountList] = useState({});
  const [activeKey, setActiveKey] = useState(mixObj.activeKey);

  const [state, setState] = useSetState({
    approvalInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
    },
    allInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
    notPermissionBtns: [],
  });

  const { approvalInfo, allInfo, notPermissionBtns = [] } = state;

  useEffect(() => {
    handleDocumentCount();
  }, [activeKey]);

  useEffect(() => {
    approvalDs.setState('dsKey', 'approvalInfo');
    allDs.setState('dsKey', 'allInfo');
    approvalDs.addEventListener('load', handleDsLoadAfter);
    allDs.addEventListener('load', handleDsLoadAfter);
    handleBtnPermissionBtn();
    return () => {
      approvalDs.removeEventListener('load', handleDsLoadAfter);
      allDs.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const dsKey = dataSet.getState('dsKey');
    const businessKeys = dataSet.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setState({
          [dsKey]: {
            approvalDataMap,
            revokeDataMap,
            approvalHistoryMap,
          },
        });
      }
    });
  };

  // 处理按钮权限集
  const handleBtnPermissionBtn = async () => {
    const codeList = [
      {
        code: 'srm.partner.my-partner.supplier-inform-change-new.button.approing-list.approval',
        name: 'approvingTabApprove',
      },
      {
        code:
          'srm.partner.my-partner.supplier-inform-change-new.button.approing-list.repeal-approval',
        name: 'approvingTabRevoke',
      },
      {
        code: 'srm.partner.my-partner.supplier-inform-change-new.button.all-list.approval',
        name: 'allTabApprove',
      },
      {
        code: 'srm.partner.my-partner.supplier-inform-change-new.button.all-list.repeal-approval',
        name: 'allTabRevoke',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      setState({
        notPermissionBtns: notPermissionBtnList,
      });
    }
  };

  // 查询单据数量
  const handleDocumentCount = useCallback(() => {
    queryCounts().then(response => {
      const res = getResponse(response);
      if (res) {
        setCountList(res);
      }
    });
  }, []);

  // 跳转详情
  const handleDetail = useCallback(
    (record, type) => {
      const { changeReqId, investgHeaderId, investigateTemplateId } = record.get([
        'changeReqId',
        'investgHeaderId',
        'investigateTemplateId',
      ]);
      const status = type || activeKey === 'waitSubmit' ? 'edit' : 'read';
      dispatch(
        routerRedux.push({
          pathname: `/sslm/supplier-inform-change-new/detail/${status}`,
          search: querystring.stringify(
            filterNullValueObject({ changeReqId, investigateTemplateId, investgHeaderId })
          ),
        })
      );
    },
    [activeKey]
  );

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setActiveKey(key);
    // eslint-disable-next-line no-param-reassign
    mixObj.activeKey = key;
    switch (key) {
      case 'waitSubmit':
        if (waitSubmitDs.getState('queryStatus') === 'ready') {
          waitSubmitDs.query(waitSubmitDs.currentPage, {}, false);
        }
        break;
      case 'approval':
        if (approvalDs.getState('queryStatus') === 'ready') {
          approvalDs.query(approvalDs.currentPage);
        }
        break;
      case 'all':
        if (allDs.getState('queryStatus') === 'ready') {
          allDs.query(allDs.currentPage);
        }
        break;
      default:
        break;
    }
  }, []);

  // 新建
  const hanldeCreate = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/supplier-inform-change-new/detail/create',
      })
    );
  }, []);

  // 删除
  const handleDelete = useCallback((dataSet, record, type = 'HEADER') => {
    const deleteData = type === 'LINE' ? [record] : dataSet.selected;
    dataSet
      .delete(deleteData, {
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
      })
      .then(response => {
        if (response && response.success) {
          handleDocumentCount();
        }
      });
  }, []);

  // 获取导出参数
  const handleExportParams = useCallback(() => {
    const params = allSearchBarRef && allSearchBarRef.getQueryParameter();
    const changeReqIds = map(allDs.toJSONData(), n => n.changeReqId).join();
    return { ...params, changeReqIds };
  }, []);

  // 绑定筛选器的ref
  const handleSearchBarRef = ref => {
    switch (activeKey) {
      case 'all':
        allSearchBarRef = ref;
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      name: 'reqStatus',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'aiApproveStatus',
      width: 140,
      title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
      renderer: params => (params.value ? <ListTooltip {...params} /> : '-'),
    },
    ['approval', 'all'].includes(activeKey) && {
      name: 'option',
      renderer: ({ dataSet, record }) => {
        const { changeReqId, reqStatus, businessKey } =
          record.get(['changeReqId', 'reqStatus', 'businessKey']) || {};
        const processDataMap = ['approval'].includes(activeKey) ? approvalInfo : allInfo;
        const { approvalDataMap, revokeDataMap } = processDataMap || {};
        // 审批按钮
        const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
        // 撤销审批按钮
        const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};
        // 编辑、删除按钮
        const showEditAndDeleteBtn =
          ['all'].includes(activeKey) && ['NEW', 'REJECTED'].includes(reqStatus);

        const hiddenApproveBtn = ['approval'].includes(activeKey)
          ? notPermissionBtns.includes('approvingTabApprove')
          : notPermissionBtns.includes('allTabApprove');
        const hiddenRevokeApproveBtn = ['approval'].includes(activeKey)
          ? notPermissionBtns.includes('approvingTabRevoke')
          : notPermissionBtns.includes('allTabRevoke');
        const buttons = [
          {
            name: 'edit',
            hidden: !showEditAndDeleteBtn,
            child: intl.get('hzero.common.button.edit').d('编辑'),
            onClick: () => handleDetail(record, 'edit'),
          },
          {
            name: 'delete',
            hidden: !showEditAndDeleteBtn,
            child: intl.get('hzero.common.button.delete').d('删除'),
            onClick: () => handleDelete(dataSet, record, 'LINE'),
          },
          {
            name: 'operationRecords',
            hidden: !['all'].includes(activeKey),
            child: intl
              .get('sslm.supplierInform.model.supplierInform.operationRecords')
              .d('操作记录'),
            onClick: () =>
              operationRecordsModal({
                remote,
                changeReqId,
                documentId: changeReqId,
                documentType: 'SUPPLIER_INFO_CHANGE',
              }),
          },
          {
            name: 'approval',
            hidden: isEmpty(approvalBtnProps) || hiddenApproveBtn,
            btnComp: <ApprovalBtn />,
            approveProps: {
              ...approvalBtnProps,
              onSuccess: () => dataSet.query(),
            },
            showIcon: false,
          },
          {
            name: 'revokeApproval',
            hidden: isEmpty(revokeBtnProps) || hiddenRevokeApproveBtn,
            btnComp: <RevokeApprovalBtn />,
            showIcon: false,
            approveProps: {
              businessKey,
              onSuccess: () => dataSet.query(),
            },
          },
        ].filter(i => !i.hidden);
        return isEmpty(buttons) ? '-' : <MoreButton buttons={buttons} />;
      },
    },
    {
      name: 'changeReqNumber',
      width: 140,
      renderer: ({ value, record }) => <a onClick={() => handleDetail(record)}>{value}</a>,
    },
    {
      name: 'changeLevel',
      width: 120,
    },
    {
      name: 'companyName',
      width: 210,
    },
    {
      name: 'supplierCompanyName',
    },
    {
      name: 'createUserName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    ['all'].includes(activeKey) && {
      name: 'approvalProgress',
      width: 160,
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      renderer: ({ record }) => {
        const { approvalHistoryMap } = allInfo || {};
        return renderApproveProgress({ approvalHistoryMap, record });
      },
    },
  ].filter(Boolean);

  const dataSetList = {
    waitSubmit: waitSubmitDs,
    approval: approvalDs,
    all: allDs,
  };

  return (
    <Fragment>
      <Header title={intl.get('sslm.supplierInform.view.title.changeSupplier').d('供应商信息变更')}>
        <HeaderBtns
          activeKey={activeKey}
          onCreate={hanldeCreate}
          onDelete={handleDelete}
          dataSet={dataSetList[activeKey]}
          customizeBtnGroup={customizeBtnGroup}
          onExportParams={handleExportParams}
        />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.TABS',
            custDefaultActive: key => {
              const currentKey = key || activeKey;
              // 获取个性化配置的默认激活key，没配置的值为undefined
              handleTabChange(currentKey);
            },
          },
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            {documentList().map(document => (
              <TabPane tab={document.tab} key={document.key} count={countList[document.countKey]}>
                <div style={{ height: tableHeight.hasTab }}>
                  {customizeTable(
                    {
                      code: document.customizeUnitCode,
                    },
                    <SearchBarTable
                      cacheState
                      columns={columns}
                      custLoading={custLoading}
                      searchCode={document.searchCode}
                      searchBarRef={handleSearchBarRef}
                      dataSet={dataSetList[document.key]}
                      style={{ maxHeight: tableMaxHeight.hasTab }}
                    />
                  )}
                </div>
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierInform'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_LIST', // 全部列表页
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_LIST', // 审批中列表
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_LIST', // 待提交列表
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_BTN', // 待提交头按钮
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_BTN', // 审批中头按钮
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_BTN', // 全部头按钮
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.TABS',
    ],
  }),
  withProps(
    () => {
      const mixObj = {
        activeKey: 'waitSubmit',
      };
      const waitSubmitDs = new DataSet(getDocumentsListDS('waitSubmit')); // 待提交
      const approvalDs = new DataSet(getDocumentsListDS('approval')); // 审批中
      const allDs = new DataSet(getDocumentsListDS('all')); // 全部
      return { waitSubmitDs, approvalDs, allDs, mixObj };
    },
    { cacheState: true }
  ),
  remotes({
    code: 'SSLM_SUPPLIER_INFORM_NEW_LIST',
  })
)(Index);
