/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */ 
import React from 'react';
import { isEmpty, isArray, throttle } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Popover, Tooltip } from 'hzero-ui';
import { connect } from 'dva'; 
import { Link } from 'dva/router';
import { dateRender, dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import Table from 'srm-front-boot/lib/components/Table';
import { filterNullValueObject, getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import PrintProButton from '_components/PrintProButton';

import { thousandBitSeparator } from '@/routes/utils.js';
import FilterForm from './FilterForm';

const organizationId = getCurrentOrganizationId();
const promptCode = 'sqam.incomingInspectionQuery';

@remote({
  code: 'SQAM_INCOMINGINSPECTIONQUERY_LIST_CUX',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID',
    'SQAM.INCOMING_INSPECTION_QUERY_LIST.SQAM.INSPECTION_QUERY_LIST.BTNS',
  ],
})
@connect(({ loading = {}, incomingInspectionQuery = {} }) => ({
  fetchListLoading: loading.effects['incomingInspectionQuery/fetchList'],
  printLoading: loading.effects['incomingInspectionQuery/fetchListPrint'],
  syncLoading: loading.effects['incomingInspectionQuery/fetchSync'],
  enumMap: incomingInspectionQuery.enumMap || {},
  incomingInspectionQuery,
}))
@formatterCollections({
  code: [
    'sqam.incomingInspectionQuery',
    'hzero.common',
    'sqam.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'entity.supplier',
    'himp.commentImport',
  ],
})
@Form.create({ fieldNameProp: null })
export default class extends React.Component {
  form;

  state = {
    selectedRowKeys: [],
    selectedRows: [],
  };

  componentDidMount() {
    setTimeout(this.fetchList, 0);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'incomingInspectionQuery/updateState',
      payload: { list: [], pagination: {} },
    });
  }

  // FilterForm绑定到这里
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  /**
   * fetchlist
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch, riskAssessmentList = {} } = this.props;
    const { pagination = {} } = riskAssessmentList;
    const formValues = this.form ? this.form.getFieldsValue() : {};

    const { supplierCompanyIdStash, ...vals } = formValues;

    const decisionResults = [];
    Object.keys(vals).forEach((key) => {
      if (key === 'decisionResult' && vals[key] && vals[key].length) {
        decisionResults.push(vals[key]);
        vals[key] = undefined;
      }
    });

    const searchCondition = filterNullValueObject({
      ...vals,
      creationDateFrom:
        formValues.creationDateFrom && formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo:
        formValues.creationDateTo && formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
      supplierCompanyId: supplierCompanyIdStash,
      decisionResults,
    });
    dispatch({
      type: 'incomingInspectionQuery/fetchList',
      payload: { camp: 'PURCHASER', page: { ...pagination, ...page }, ...searchCondition },
    });
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchList({ current: 1, pageSize: 10 });
  }

  // 打印相关的逻辑
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'incomingInspectionQuery/fetchListPrint',
      payload: selectedRowKeys,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
    });
  }

  // 同步
  @Bind()
  handleSync() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'incomingInspectionQuery/fetchSync',
      payload: { incomingInspectionIds: selectedRowKeys },
    }).then((res) => {
      if (res) {
        // 刷新数据
        this.handleSearch();
        notification.success();
      }
    });
  }

  /**
   * 导出对应tab内容
   */
  @Bind()
  requestUrl() {
    const requestUrl = `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/export?customizeUnitCode=SQAM.INCOMING_INSPECTION_QUERY_LIST.FILTER,SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID`;
    return requestUrl;
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  headerBtns(searchCondition) {
    const { selectedRows,selectedRowKeys } = this.state;
    const { remote: remoteProps, loading } = this.props;
    const isLoading =
      loading?.fetch || loading?.release || loading?.delete || loading?.loadingAssociation;
    const allBtns = [
      {
        name: 'sync',
        btnComp: PermissionButton,
        child: intl.get('sqam.common.button.sync').d('同步'),
        btnProps: {
          icon: 'sync',
          onClick: throttle(() => this.handleSync(), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.incoming-inspection.incoming-inspection-query.ps.radio.button.sync`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'print',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.printSelect').d('勾选打印'),
        btnProps: {
          icon: 'printer',
          disabled: !selectedRowKeys || !selectedRowKeys[0],
          onClick: throttle(() => this.handlePrint(), 2000, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.incoming-inspection.incoming-inspection-query.button.print`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'newprint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('sqam.common.view.button.printNew').d('新打印'),
          buttonProps: {
            disabled: !selectedRowKeys || !selectedRowKeys[0],
            permissionList: [
              {
                code:
                  'srm.sqam.business.incoming-inspection.incoming-inspection-query.button.printnew',
              },
            ],
            loading: isLoading,
          },
          requestUrl: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/list-print-new`,
          method: 'PUT',
          data: { incomingInspectionIdList: selectedRowKeys },
          successCallBack: () => this.fetchList(),
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          templateCode: 'SQAM_INCOMING_INSPECTION_PURCHASER_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/export/new?customizeUnitCode=SQAM.INCOMING_INSPECTION_QUERY_LIST.FILTER,SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID`,
          queryParams: searchCondition,
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            style: {
              border: '0.01rem solid rgba(0, 0, 0, 0.2)',
            },
            permissionList: [
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-query.ps.newexport`,
                type: 'button',
              },
            ],
            loading: isLoading,
          },
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: intl.get(`hzero.common.button.export`).d('导出'),
        btnProps: {
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            style: {
              border: '0.01rem solid rgba(0, 0, 0, 0.2)',
            },
            permissionList: [
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-query.ps.export`,
                type: 'button',
              },
            ],
            loading: isLoading,
          },
          requestUrl: this.requestUrl(),
          method: 'POST',
          allBody: true,
          queryParams: searchCondition,
        },
      },
    ];
    const remoteBtns = remoteProps
      ? remoteProps.process('SQAM_INCOMINGINSPECTIONQUERY_LIST_CUX_BTNS', allBtns, {
          selectedRows,
          loading: isLoading,
          handleSearch: this.fetchList,
          selectedRowKeys,
          _this:this,
        })
      : allBtns;
    return remoteBtns;
  }

  render() {
    const { selectedRowKeys = [] } = this.state;
    const {
      remote,
      incomingInspectionQuery = {},
      fetchListLoading = false,
      enumMap = {},
      customizeTable,
      form, 
      customizeBtnGroup,
    } = this.props;
    const { list = [], pagination = {}, listAllData={} } = incomingInspectionQuery;
    const columnsTem = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionNum`)
          .d('检验批号'),
        dataIndex: 'inspectionNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <Link to={`/sqam/incoming-inspection-query/detail/${record.inspectionId}`}>{val}</Link>
        ),
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'inspectionStateMeaning',
        width: 100,
        render: (val, record) => (
          <div>
            {val}
            {record.approvedFlag === 0 && record.inspectionState === 'UNTREATED' ? (
              <span>
                <Tooltip
                  title={
                    <div>
                      {`${intl
                        .get(`${promptCode}.view.message.approvalRefused`)
                        .d('发布审批拒绝')} ${record.approvedRemark || ''}`}
                    </div>
                  }
                >
                  <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                </Tooltip>
              </span>
            ) : null}
          </div>
        ),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionTypeMeaning`)
          .d('检验类型'),
        dataIndex: 'inspectionTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 240,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`entity.item.unitMeasurement`).d('采样计量单位'),
        dataIndex: 'uomName',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`)
          .d('评估结果'),
        dataIndex: 'assessmentResultMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.decisionResult`)
          .d('决策结果'),
        dataIndex: 'decisionResultMeaning',
        width: 160,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.common.sourceNum`).d('来源单据'),
        dataIndex: 'sourceNum',
        key: 'sourceNum',
        width: 220,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.startDate`)
          .d('检验开始日期'),
        dataIndex: 'startDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
          .d('检验结束日期'),
        dataIndex: 'endDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.chargeName`).d('责任人'),
        dataIndex: 'responsiblePerson',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.batchQuantity`)
          .d('检验批数量'),
        dataIndex: 'batchQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.actualQuantity`)
          .d('实际批量'),
        dataIndex: 'actualQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.sampleSize`)
          .d('采样大小'),
        dataIndex: 'sampleSize',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.badQuantity`).d('不良品数量'),
        dataIndex: 'badQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.badCategory`)
          .d('不良分类'),
        dataIndex: 'badCategoryMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.badReason`)
          .d('不良原因'),
        dataIndex: 'badReason',
        width: 150,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`${promptCode}.model.incomingInspectionQuery.relatedQualityRectification`)
          .d('关联质量整改'),
        width: 150,
        dataIndex: 'problemNum',
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.claimfrom1`).d('关联索赔单号'),
        width: 150,
        dataIndex: 'formNum',
      },
      {
        title: intl.get(`sqam.common.model.syncStatusMeaning`).d('同步状态'),
        dataIndex: 'syncStatusMeaning',
        width: 150,
        render: (val, record) => {
          const { syncStatus } = record || {};
          return (
            <div>
              <div>
                {syncStatus &&
                  (syncStatus === 'SYNC_FAILURE' ? (
                    <div style={{ color: '#FE2E2E' }}>{val}</div>
                  ) : (
                    <div>{val}</div>
                  ))}
              </div>
            </div>
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.syncResponseMsg`).d('同步反馈'),
        dataIndex: 'syncFeedback',
        width: 250,
        render: (value) => (
          <div>
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: intl.get(`sqam.common.model.syncSystemDocNum`).d('同步外部系统单据编号'),
        dataIndex: 'syncFeedbackNum',
        width: 200,
      },
    ];
    const columns = columnsTem;
    const fiterProps = {
      form,
      bindForm: this.bindForm,
      handleSearch: this.handleSearch,
      enumMap,
    };
    const tableProps = remote.process("SQAM_INCOMINGINSPECTIONQUERY_LIST_CUX_TABLE_PROPS",{
      columns,
      dataSource: list,
      bordered: true,
      loading: fetchListLoading,
      scroll: { x: tableScrollWidth(columns) },
      pagination,
      rowKey: 'inspectionId',
      onChange: this.fetchList,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelect,
      },
    },{listAllData});

    let formValues = this.form ? this.form.getFieldsValue() : {};
    const formatFormValues = this.form?.getFieldsValue();
    if (formatFormValues) {
      const { supplierCompanyIdStash, decisionResult } = formatFormValues;
      const values = {
        ...formatFormValues,
        creationDateFrom:
          formatFormValues.creationDateFrom &&
          formatFormValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
        creationDateTo:
          formatFormValues.creationDateTo &&
          formatFormValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
        supplierCompanyId: supplierCompanyIdStash,
        decisionResults: decisionResult && isArray(decisionResult) ? decisionResult : undefined,
        decisionResult: undefined,
      };
      formValues = filterNullValueObject(values);
    }

    const searchCondition = isEmpty(selectedRowKeys)
      ? filterNullValueObject(formValues)
      : { inspectionIds: selectedRowKeys };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.qualityInspectionQuery`)
            .d('质量检验单查询')}
        >
          {customizeBtnGroup(
            {
              code: 'SQAM.INCOMING_INSPECTION_QUERY_LIST.SQAM.INSPECTION_QUERY_LIST.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={this.headerBtns(searchCondition)} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          {customizeTable(
            {
              code: 'SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID',
            },
            <Table {...tableProps} />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
