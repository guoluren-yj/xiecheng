/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */ 
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Table, Popover, Tooltip, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { dateRender } from 'utils/renderer';
import remotes from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { stringify } from 'querystring';
import { Button as PermissionButton } from 'components/Permission';
import { SRM_SQAM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { isEmpty, isArray, throttle } from 'lodash';
import rejectImg from '@/assets/problem_approve_reject.svg';

import FilterForm from './FilterForm';

const organizationId = getCurrentOrganizationId();
const promptCode = 'sqam.incomingInspectionQuery';

@withCustomize({
  unitCode: ['SQAM.INCOMING_INSPECTION_CREATE_LIST.GRID'],
})
@remotes({
  code: 'SQAM_INCOMING_INSPECTION_MAINTAIN_LIST',
})
@connect(({ loading = {}, incomingInspectionMaintain = {} }) => ({
  fetchListLoading: loading.effects['incomingInspectionMaintain/fetchList'],
  fetchCountLoading: loading.effects['incomingInspectionMaintain/fetchCount'],
  fetchListDeleteLoading: loading.effects['incomingInspectionMaintain/fetchListDelete'],
  submitDataLoading: loading.effects['incomingInspectionMaintain/submitData'],
  enumMap: incomingInspectionMaintain.enumMap || {},
  incomingInspectionMaintain,
}))
@formatterCollections({
  code: [
    'sqam.incomingInspectionQuery',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'entity.supplier',
  ],
})
@Form.create({ fieldNameProp: null })
export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  form;

  componentDidMount() {
    this.fetchList();
    this.fetchCount();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'incomingInspectionMaintain/updateState',
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
    const creationDateFrom = formValues.creationDateFrom
      ? formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const creationDateTo = formValues.creationDateTo
      ? formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const { supplierCompanyIdStash, ...vals } = formValues;
    const searchCondition = filterNullValueObject({
      ...vals,
      creationDateFrom,
      creationDateTo,
      supplierCompanyId: supplierCompanyIdStash,
    });
    dispatch({
      type: 'incomingInspectionMaintain/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        // customizeUnitCode,
      },
    });
  }

  @Bind()
  fetchCount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'incomingInspectionMaintain/fetchCount',
    });
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchList({ current: 1, pageSize: 10 });
  }

  /**
   * 导出对应tab内容
   */
  @Bind()
  requestUrl() {
    const requestUrl = `${SRM_SQAM}/v1/${organizationId}/incoming-inspections/export`;
    return requestUrl;
  }

  @Bind()
  handleCreate() {
    const { history } = this.props;
    history.push(`/sqam/incoming-inspection-maintain/detail/create`);
  }

  @Bind()
  handleUnInspection() {
    const { history } = this.props;
    history.push(`/sqam/incoming-inspection-maintain/unInspection/list`);
  }

  @Bind()
  handleImport() {
    const { history } = this.props;
    history.push({
      pathname: '/sqam/incoming-inspection-maintain/data-import/SQAM.INSPECTION_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: '/sqam/incoming-inspection-maintain/list',
        args: JSON.stringify({
          tenantId: getCurrentOrganizationId(),
          templateCode: 'SQAM.INSPECTION_IMPORT',
        }),
      }),
    });
  }

  /**
   * 删除
   * 支持单条/批量删除
   */
  @Bind()
  handleDelete8D() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    Modal.confirm({
      iconType: '',
      content: intl.get(`${promptCode}.view.message.confirm.deleteRectification`).d('质量检验创建'),
      onOk: () => {
        dispatch({
          type: 'incomingInspectionMaintain/fetchListDelete',
          payload: {
            tenantId: getCurrentOrganizationId(),
            data: [...selectedRows],
          },
        }).then((res) => {
          if (res && isEmpty(res)) {
            this.setState({ selectedRowKeys: [], selectedRows: [] });
            notification.success();
            this.handleSearch();
          }
        });
      },
    });
  }

  // 提交
  @Bind()
  handleSubmit() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    Modal.confirm({
      iconType: '',
      content: intl.get(`${promptCode}.view.message.confirm.submitFication`).d('是否确认提交'),
      onOk: () => {
        dispatch({
          type: 'incomingInspectionMaintain/submitData',
          payload: selectedRows,
        }).then((res) => {
          if (res && isEmpty(res)) {
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
            notification.success();
            this.handleSearch();
          }
        });
      },
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  render() {
    const {selectedRows, selectedRowKeys = [] } = this.state;
    const {
      remote,
      incomingInspectionMaintain = {},
      fetchListLoading = false,
      fetchListDeleteLoading = false,
      submitDataLoading = false,
      enumMap = {},
      customizeTable,
      form,
    } = this.props;
    const { list = [], pagination = {}, count = 0 } = incomingInspectionMaintain;
    const columnsTem = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionNum`)
          .d('检验批号'),
        dataIndex: 'inspectionNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <Link to={`/sqam/incoming-inspection-maintain/detail/${record.inspectionId}`}>{val}</Link>
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
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateRender,
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
      rowKey: 'inspectionId',
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleSelectRow,
      },
      onChange: this.fetchList,
    };
    const loading = fetchListLoading || fetchListDeleteLoading || submitDataLoading;
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.qualityInspectCreate`)
            .d('质量检验创建')}
        >
          <PermissionButton
            icon="plus"
            type="primary"
            onClick={throttle(this.handleCreate, 1500, { trailing: false })}
            loading={loading}
            permissionList={[
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.list.create`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </PermissionButton>
          <PermissionButton
            onClick={throttle(this.handleImport, 1500, { trailing: false })}
            loading={loading}
            permissionList={[
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.importcreate`,
                type: 'button',
              },
            ]}
          >
            {intl.get(`${promptCode}.view.button.importCreate`).d('导入创建')}
          </PermissionButton>
          <PermissionButton
            icon="delete"
            loading={loading}
            onClick={throttle(this.handleDelete8D, 1500, { trailing: false })}
            disabled={isEmpty(selectedRowKeys)}
            permissionList={[
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.list.delete`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </PermissionButton>
          <PermissionButton
            icon="check"
            onClick={throttle(this.handleSubmit, 1500, { trailing: false })}
            loading={loading}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            permissionList={[
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.submit`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </PermissionButton>
          <PermissionButton
            loading={loading}
            onClick={throttle(this.handleUnInspection, 1500, { trailing: false })}
            permissionList={[
              {
                code: `srm.sqam.business.incoming-inspection.incoming-inspection-maintain.ps.pengding`,
                type: 'button',
              },
            ]}
          >
            {`${intl.get(`${promptCode}.view.button.unInspection`).d('待质检')}(${
              count > 99 ? '99+' : count
            })`}
          </PermissionButton>
          {remote&&remote.render("SQAM_INCOMING_INSPECTION_MAINTAIN_LIST_HEADER_BTNS",null,{
            selectedRows,
            selectedRowKeys,
            onRefresh: this.fetchList,
          })}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          {customizeTable(
            {
              code: 'SQAM.INCOMING_INSPECTION_CREATE_LIST.GRID',
            },
            <Table {...tableProps} />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
