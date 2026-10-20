/**
 * 质检结果查询
 * @date: 2020-4-9
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { Table, Popover, Badge, Form } from 'hzero-ui';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { dateRender, dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isArray, isEmpty } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
  tableScrollWidth,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import PrintProButton from '_components/PrintProButton';
import { Button as PermissionButton } from 'components/Permission';

import { thousandBitSeparator } from '@/routes/utils.js';
import FilterForm from './FilterForm';

const organizationId = getCurrentOrganizationId();
const promptCode = 'sqam.incomingInspectionQuery';

@withCustomize({
  unitCode: ['SQAM.QUALITY_RESULT_LIST.GRID'],
})
@connect(({ loading = {}, qualityResult = {} }) => ({
  fetchListLoading: loading.effects['qualityResult/fetchList'],
  printLoading: loading.effects['qualityResult/fetchListPrint'],
  enumMap: qualityResult.enumMap || {},
  qualityResult,
  supplierTenantId: getUserOrganizationId(),
}))
@remote({
  code: 'SQAM_QUALITY_RESULT_LIST_CUX',
  name: 'remote',
})
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.incomingInspectionQuery',
    'hzero.common',
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
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // 已选择采购账单key
    };
  }

  form;

  componentDidMount() {
    const { remote: remoteProps } = this.props;
    if (remoteProps?.event) {
      remoteProps.event.fireEvent('onLoadCux', {
        form: this.form,
      });
    }
    setTimeout(this.fetchList, 0);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'qualityResult/updateState',
      payload: { list: [], pagination: {} },
    });
  }

  /**
   * 选中单据改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedRowKeys: newSelectedRowKeys });
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
    const { dispatch, riskAssessmentList = {}, supplierTenantId } = this.props;
    const { pagination = {} } = riskAssessmentList;
    const formValues = this.form ? this.form.getFieldsValue() : {};

    const decisionResults = [];
    Object.keys(formValues).forEach((key) => {
      if (key === 'decisionResult' && formValues[key] && formValues[key].length) {
        decisionResults.push(formValues[key]);
        formValues[key] = undefined;
      }
    });

    const searchCondition = filterNullValueObject({
      ...formValues,
      inspectionStateList: ['PROCESSED', 'CANCEL'].join(),
      decisionResults,
      creationDateFrom:
        formValues.creationDateFrom && formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo:
        formValues.creationDateTo && formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
    });
    dispatch({
      type: 'qualityResult/fetchList',
      payload: {
        camp: 'SUPPLIER',
        page: { ...pagination, ...page },
        ...searchCondition,
        supplierTenantId,
      },
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
      type: 'qualityResult/fetchListPrint',
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

  render() {
    const {
      form,
      qualityResult = {},
      fetchListLoading = false,
      printLoading = false,
      enumMap = {},
      customizeTable,
      supplierTenantId,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const { list = [], pagination = {} } = qualityResult;
    const columnsTem = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionNum`)
          .d('检验批号'),
        dataIndex: 'inspectionNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <Link to={`/sqam/quality-result/detail/${record.inspectionId}`}>{val}</Link>
        ),
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'inspectionStateMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.printFlag`).d('打印状态'),
        dataIndex: 'printFlag',
        width: 100,
        render: (val, record) => (
          <Badge status={val ? 'success' : 'warning'} text={record.printFlagMeaning} />
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
        title: intl.get(`sqam.common.model.qualityRectification.clientCompany`).d('客户公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'organizationName',
        width: 150,
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
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 240,
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
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.batchQuantity`)
          .d('检验批数量'),
        dataIndex: 'batchQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(text),
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
        render: (text) => thousandBitSeparator(text),
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
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.claimForm1`).d('关联索赔单'),
        width: 150,
        dataIndex: 'formNum',
      },
    ];
    const columns = columnsTem;
    const fiterProps = {
      form,
      bindForm: this.bindForm,
      handleSearch: this.handleSearch,
      enumMap,
    };
    const tableProps = {
      columns,
      dataSource: list,
      bordered: true,
      loading: fetchListLoading,
      scroll: { x: tableScrollWidth(columns) },
      pagination,
      onChange: this.fetchList,
      rowKey: 'inspectionId',
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelectChange,
      },
    };
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const { supplierCompanyIdStash, decisionResult, ...vals } = formValues;
    const searchCondition = filterNullValueObject({
      ...vals,
      inspectionStateList: ['PROCESSED', 'CANCEL'],
      supplierCompanyId: supplierCompanyIdStash,
      creationDateFrom:
        formValues.creationDateFrom && formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo:
        formValues.creationDateTo && formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
      decisionResults: decisionResult && isArray(decisionResult) ? decisionResult : undefined,
      decisionResult: undefined,
      supplierTenantId,
      camp: 'SUPPLIER',
    });
    const loading = fetchListLoading || printLoading;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.qualityResultQuery`).d('质检结果查询')}
        >
          <>
            <PermissionButton
              icon="printer"
              onClick={() => Throttle(this.handlePrint(), 2000)}
              disabled={!selectedRowKeys || !selectedRowKeys[0]}
              loading={loading}
              permissionList={[
                {
                  code: `srm.sqam.business.incoming-inspection.quality-result.button.print`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('hzero.common.button.printSelect').d('勾选打印')}
            </PermissionButton>
            <PrintProButton
              buttonText={intl.get('sqam.common.view.button.printNew').d('新打印')}
              buttonProps={{
                icon: 'printer',
                disabled: !selectedRowKeys || !selectedRowKeys[0],
                loading,
                permissionList: [
                  {
                    code: 'srm.sqam.business.incoming-inspection.quality-result.button.printnew',
                  },
                ],
              }}
              requestUrl={`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/list-print-new`}
              method="PUT"
              data={{ incomingInspectionIdList: selectedRowKeys }}
              successCallBack={this.fetchList}
            />
            <ExcelExportPro
              requestUrl={`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/export/new?customizeUnitCode=SQAM.QUALITY_RESULT_LIST.FILTER,SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID`}
              otherButtonProps={{
                className: 'label-btn',
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                style: {
                  border: '0.01rem solid rgba(0, 0, 0, 0.2)',
                },
                permissionList: [
                  {
                    code: `srm.sqam.business.incoming-inspection.quality-result.ps.newexport`,
                    type: 'button',
                  },
                ],
                loading,
              }}
              queryParams={
                !isEmpty(selectedRowKeys) ? { inspectionIds: selectedRowKeys } : searchCondition
              }
              buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
              templateCode="SQAM_INCOMING_INSPECTION_PURCHASER_EXPORT"
              method="POST"
              allBody
            />
            <ExcelExport
              requestUrl={`${SRM_SQAM}/v1/${organizationId}/incoming-inspections/export?customizeUnitCode=SQAM.QUALITY_RESULT_LIST.FILTER,SQAM.INCOMING_INSPECTION_QUERY_LIST.GRID`}
              otherButtonProps={{
                className: 'label-btn',
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                style: {
                  border: '0.01rem solid rgba(0, 0, 0, 0.2)',
                },
                permissionList: [
                  {
                    code: `srm.sqam.business.incoming-inspection.quality-result.ps.export`,
                    type: 'button',
                  },
                ],
                loading,
              }}
              queryParams={
                !isEmpty(selectedRowKeys) ? { inspectionIds: selectedRowKeys } : searchCondition
              }
              method="POST"
              allBody
            />
          </>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          {customizeTable(
            {
              code: 'SQAM.QUALITY_RESULT_LIST.GRID',
            },
            <Table {...tableProps} />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
