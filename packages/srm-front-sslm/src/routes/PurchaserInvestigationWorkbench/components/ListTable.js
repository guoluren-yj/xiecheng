import { isEmpty, forIn, isArray } from 'lodash';
import querystring from 'querystring';
import React, { useState, useEffect } from 'react';
import { routerRedux } from 'dva/router';
import { Tooltip, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableMaxHeight, tableHeight, renderStatus, downLoadFile } from '@/routes/components/utils';
import {
  queryAllApprovalData,
  ApprovalBtn,
  RevokeApprovalBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';
import MoreButton from '@/routes/components/MoreButton';
import { riskScan } from '@/routes/LifeCycleManage/utils';
import ListTooltip from '@/routes/components/AiApprove/ListTooltip';
import { getNotPermissionBtns } from '@/routes/components/utils/utils';

const organizationId = getCurrentOrganizationId();

const ListTable = ({
  remote,
  dataSet,
  onDelete,
  onRelease,
  onCancel,
  dispatch,
  activeKey,
  searchCode,
  customizeCode,
  customizeTable,
  routerParams,
}) => {
  const [pageChacheFlag, setPageChacheFlag] = useState(true);
  const [approvalInfo, setApprovalInfo] = useState({});
  const [notPermissionBtns, setNotPermissionBtns] = useState([]);

  const { tabKey = '', ...rest } = routerParams;

  useEffect(() => {
    if (activeKey === 'all') {
      dataSet.addEventListener('load', handleDsLoadAfter);
    }
    handleBtnPermissionBtn();
    return () => {
      if (activeKey === 'all') {
        dataSet.removeEventListener('load', handleDsLoadAfter);
      }
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet: ds } = dataSetProps;
    const businessKeys = ds.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setApprovalInfo({
          approvalDataMap,
          revokeDataMap,
          approvalHistoryMap,
        });
      }
    });
  };

  // 处理按钮权限集
  const handleBtnPermissionBtn = async () => {
    const codeList = [
      {
        code: 'srm.partner.purchaser-investigation-workbench.button.tab-list.approval',
        name: 'approval',
      },
      {
        code: 'srm.partner.purchaser-investigation-workbench.button.tab-list.repeal-approval',
        name: 'revokeApproval',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      setNotPermissionBtns(notPermissionBtnList);
    }
  };

  // 跳转详情
  const handleGoToDatail = record => {
    const { investgHeaderId, investigateTemplateId } =
      record.get(['investgHeaderId', 'investigateTemplateId']) || {};
    const pathname =
      activeKey === 'waitRelease'
        ? `/sslm/purchaser-investigation/wait-release/detail/${investgHeaderId}/${investigateTemplateId}`
        : activeKey === 'waitApprove'
        ? `/sslm/purchaser-investigation/wait-approve/detail/${investgHeaderId}/${investigateTemplateId}`
        : `/sslm/purchaser-investigation/all-investigation/detail/${investgHeaderId}/${investigateTemplateId}`;
    const search =
      activeKey === 'waitRelease'
        ? querystring.stringify({
            type: 'edit',
          })
        : null;
    dispatch(
      routerRedux.push({
        pathname,
        search,
      })
    );
  };

  // 待发布详情
  const handleGoToRelease = record => {
    const { investgHeaderId, investigateTemplateId } = record.get([
      'investgHeaderId',
      'investigateTemplateId',
    ]);
    const search = querystring.stringify({
      type: 'edit',
    });
    // 跳转
    dispatch(
      routerRedux.push({
        pathname: `/sslm/purchaser-investigation/wait-release/detail/${investgHeaderId}/${investigateTemplateId}`,
        search,
      })
    );
  };

  // 发布
  const handleLineRelease = record => {
    const investgHeaderId = record.get('investgHeaderId');
    const payload = {
      organizationId,
      body: [investgHeaderId],
    };
    onRelease(payload);
  };

  const handleCancel = record => {
    const investgHeaderId = record.get('investgHeaderId');
    onCancel([investgHeaderId], 'lineCancel');
  };

  // 审批
  const handleGoToApprove = record => {
    const { investgHeaderId, investigateTemplateId } = record.get([
      'investgHeaderId',
      'investigateTemplateId',
    ]);
    // 跳转
    dispatch(
      routerRedux.push({
        pathname: `/sslm/purchaser-investigation/wait-approve/detail/${investgHeaderId}/${investigateTemplateId}`,
      })
    );
  };

  // 删除
  const handleDelete = record => {
    const investgHeaderId = record.get('investgHeaderId');
    const payload = {
      organizationId,
      body: [investgHeaderId],
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.investDefOrg.view.title.deleteQuestionnaire').d('是否删除此调查表?'),
      onOk: () => {
        onDelete(payload);
      },
    });
  };

  const handleDownloadReport = fileUrl => {
    if (!fileUrl) {
      return;
    }
    const url = downLoadFile({ tenantId: organizationId, attachmentUrl: fileUrl });
    window.open(url);
  };

  // 操作按钮
  const getBtns = ({ record, dataSet: ds }) => {
    if (!record) {
      return [];
    }
    const { processStatus, mainInvestigateFlag, mergerInvestigateFlag, businessKey } =
      record.get([
        'processStatus',
        'mainInvestigateFlag',
        'mergerInvestigateFlag',
        'mainInvestigateNum',
        'businessKey',
      ]) || {};
    // 副调查表标识
    const isSubSurveyForm = mainInvestigateFlag === 0 && mergerInvestigateFlag === 1;
    // 不展示取消标识
    const noCancelFlag =
      (processStatus !== 'RELEASE' && processStatus !== 'REJECT') ||
      (['RELEASE', 'REJECT'].includes(processStatus) &&
        mainInvestigateFlag === 0 &&
        mergerInvestigateFlag === 1);
    const showNewStatusButton = processStatus === 'NEW';
    const showApprovalButton = ['SUBMIT', 'WFL_REJECT'].includes(processStatus) && !isSubSurveyForm;
    const showCancelButton = !noCancelFlag && !(processStatus === 'SUBMIT' && isSubSurveyForm);
    // 审批、撤销审批按钮
    const { approvalDataMap, revokeDataMap } = approvalInfo || {};
    // 审批按钮
    const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
    // 撤销审批按钮
    const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};
    const btns = [
      {
        name: 'edit',
        hidden: !showNewStatusButton,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleGoToRelease(record),
      },
      {
        name: 'release',
        hidden: !showNewStatusButton,
        child: intl.get('hzero.common.button.release').d('发布'),
        onClick: () => handleLineRelease(record),
      },
      {
        name: 'delete',
        hidden: !showNewStatusButton,
        child: intl.get('hzero.common.button.delete').d('删除'),
        onClick: () => handleDelete(record),
      },
      {
        name: 'approval',
        hidden: !showApprovalButton,
        child: intl.get('hzero.common.button.approval').d('审批'),
        onClick: () => handleGoToApprove(record),
      },
      {
        name: 'cancel',
        hidden: !showCancelButton,
        child: intl.get('hzero.common.button.cancel').d('取消'),
        onClick: () => handleCancel(record),
      },
      {
        name: 'approval',
        hidden: isEmpty(approvalBtnProps) || notPermissionBtns.includes('approval'),
        btnComp: <ApprovalBtn />,
        approveProps: {
          ...approvalBtnProps,
          onSuccess: () => ds.query(),
        },
        showIcon: false,
      },
      {
        name: 'revokeApproval',
        hidden: isEmpty(revokeBtnProps) || notPermissionBtns.includes('revokeApproval'),
        btnComp: <RevokeApprovalBtn />,
        showIcon: false,
        approveProps: {
          businessKey,
          onSuccess: () => ds.query(),
        },
      },
    ].filter(i => !i.hidden);
    const buttons = remote
      ? remote.process('SSLM_PURCHASER_INVESTIG_WORKBEBCH_LIST_TABLE_LINE_BTNS', btns, {
          record,
          activeKey,
          dispatch,
        })
      : btns;
    return buttons;
  };

  const getColumns = () => {
    const columns = [
      {
        name: 'processStatusMeaning',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'aiApproveStatus',
        width: 140,
        hidden: activeKey === 'waitRelease',
        title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
        renderer: params => (params.value ? <ListTooltip {...params} /> : '-'),
      },
      {
        name: 'action',
        width: 160,
        hidden: activeKey !== 'all',
        renderer: ({ record, dataSet: ds }) => {
          const buttons = getBtns({ record, dataSet: ds });
          return isEmpty(buttons) ? '-' : <MoreButton buttons={buttons} />;
        },
      },
      {
        name: 'investgNumber',
        renderer: ({ value, record }) => {
          // 副调查表编码置灰,显示提示(非完成状态下:除了已审批和已取消状态)
          if (
            !['CANCEL', 'APPROVE'].includes(record.get('processStatus')) &&
            record.get('mergerInvestigateFlag') === 1 &&
            record.get('mainInvestigateFlag') === 0
          ) {
            return (
              <Tooltip
                title={
                  intl
                    .get(`sslm.common.view.investigateApproval.investgNumberTip`)
                    .d('当前调查表为合并调查表中的副调查表，无需操作，只需审批其主调查表') +
                  record.get('mainInvestigateNum')
                }
                placement="top"
              >
                {value}
              </Tooltip>
            );
          } else {
            return <a onClick={() => handleGoToDatail(record)}>{value}</a>;
          }
        },
        width: 120,
      },
      {
        name: 'partnerCompanyNum',
      },
      {
        name: 'supplierZhOrEnCompanyNum',
        width: 190,
      },
      {
        name: 'riskScan',
        hidden: activeKey !== 'waitApprove',
        renderer: ({ record }) => {
          const { partnerCompanyName, partnerCompanyId } = record.get([
            'partnerCompanyName',
            'partnerCompanyId',
          ]);
          record.init({
            riskScanCompanyName: partnerCompanyName,
            riskScanCompanyId: partnerCompanyId,
          });
          return (
            <a
              onClick={() => {
                riskScan(record, false, true);
              }}
            >
              {intl.get('sslm.common.view.button.isScan').d('风险扫描')}
            </a>
          );
        },
      },
      {
        name: 'riskScanDate',
        hidden: activeKey !== 'waitApprove',
        width: 160,
      },
      {
        name: 'riskLevelMeaning',
        hidden: activeKey !== 'waitApprove',
      },
      {
        name: 'fileUrl',
        hidden: activeKey !== 'waitApprove',
        renderer: ({ record }) => {
          const fileUrl = record.get('fileUrl');
          if (!fileUrl) {
            return '-';
          }
          return (
            <a
              onClick={() => {
                handleDownloadReport(fileUrl);
              }}
            >
              {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
            </a>
          );
        },
      },
      {
        name: 'partnerRegisteredCapital',
        hidden: activeKey !== 'waitApprove',
      },
      {
        name: 'partnerBuildDate',
        hidden: activeKey !== 'waitApprove',
      },
      {
        name: 'companyNum',
      },
      {
        name: 'companyName',
        width: 190,
      },
      {
        name: 'investigateTypeMeaning',
      },
      {
        name: 'investigateLevelMeaning',
      },
      {
        name: 'templateCode',
        width: 160,
        hidden: activeKey !== 'waitRelease',
      },
      {
        name: 'templateName',
        width: 200,
      },
      {
        name: 'versionNumber',
        hidden: activeKey !== 'all',
      },
      {
        name: 'createUserName',
      },
      {
        name: 'unitName',
      },
      {
        name: 'createDate',
        width: 140,
        hidden: activeKey !== 'waitRelease',
      },
      {
        name: 'releaseDate',
        width: 140,
      },
      {
        name: 'submitDate',
        width: 140,
        hidden: activeKey === 'waitRelease',
      },
      {
        name: 'triggerByCodeMeaning',
        width: 120,
        hidden: activeKey === 'waitRelease',
      },
      {
        name: 'approvalProgress',
        width: 160,
        title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
        hidden: activeKey !== 'all',
        renderer: ({ record }) => {
          const { approvalHistoryMap } = approvalInfo || {};
          return renderApproveProgress({ approvalHistoryMap, record });
        },
      },
      {
        name: 'relationSearch',
        width: 120,
        hidden: activeKey !== 'waitApprove',
        renderer: ({ record }) => {
          const supplierCompanyName = record.get('partnerCompanyName');
          return (
            <a
              onClick={() => {
                openRelationChart({ supplierCompanyName, businessType: 'QUESTIONNAIRE' });
              }}
            >
              {intl.get('sslm.common.view.common.relationSearch').d('关系排查')}
            </a>
          );
        },
      },
      {
        name: 'latestCheckTime',
        hidden: activeKey !== 'waitApprove',
        width: 160,
      },
      {
        name: 'latestCheckFileUrl',
        width: 160,
        hidden: activeKey !== 'waitApprove',
        renderer: ({ record }) => {
          const latestCheckFileUrl = record.get('latestCheckFileUrl');
          if (!latestCheckFileUrl) {
            return '-';
          }
          return (
            <a
              onClick={() => {
                handleDownloadReport(latestCheckFileUrl);
              }}
            >
              {intl.get('sslm.common.view.common.latestRelationReport').d('最新关系排查报告')}
            </a>
          );
        },
      },
    ].filter(i => !i.hidden);
    return columns;
  };

  // 查询
  const handleQuery = (queryProps = {}) => {
    const { params } = queryProps;
    if (params) {
      // 处理多单号
      const { investgQuery: reqList, ...others } = params;
      const investgQuery = isEmpty(reqList) ? null : isArray(reqList) ? reqList.join(',') : reqList;
      if (dataSet.queryDataSet) {
        const queryParams = {
          ...others,
          investgQuery,
        };
        dataSet.queryDataSet.loadData([queryParams]);
      }
      if (pageChacheFlag) {
        dataSet.query(dataSet.currentPage);
      } else {
        dataSet.query();
      }
    } else {
      dataSet.query(dataSet.currentPage);
    }
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = queryDataSet => {
    return (
      <MultipleTextField
        name="investgQuery"
        dataSet={queryDataSet}
        placeholder={intl
          .get('sslm.investTempConfig.model.invite.investiagteCode')
          .d('请输入调查表编号、供应商名称查询')}
      />
    );
  };

  // 清空、重置回调
  const clearValues = () => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  };

  const getFieldProps = () => {
    const routerFieldProps = getRouterFieldProps(activeKey);
    const otherFieldProps = filterNullValueObject(routerFieldProps);
    return {
      partnerCompanyId: {
        lovPara: { asyncCountFlag: 'Y' },
      },
      ...otherFieldProps,
    };
  };

  const getRouterFieldProps = (key = '') => {
    const fieldMap = {};
    forIn(rest, (value, fieldName) => {
      fieldMap[fieldName] = {
        defaultValue: value,
      };
    });
    const routerfieldProps = {
      [tabKey]: fieldMap,
    };
    return routerfieldProps[key];
  };

  return (
    <div style={{ height: tableHeight.hasTab }}>
      {customizeTable(
        {
          code: customizeCode,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={getColumns()}
          searchBarRef={() => {}}
          searchCode={searchCode}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchBarConfig={{
            customizeDsAutoCreate: true, // left.render自定义查询组件ds新建配置
            editorProps: {},
            left: {
              render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
            },
            fieldProps: getFieldProps(),
            onQuery: queryProps => handleQuery(queryProps),
            onReset: () => clearValues(),
            onClear: () => clearValues(),
            onFieldChange: () => {
              setPageChacheFlag(false);
            },
          }}
        />
      )}
    </div>
  );
};

export default ListTable;
