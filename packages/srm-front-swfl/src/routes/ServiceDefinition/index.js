import React from 'react';
import { connect } from 'dva';
import { Button, Icon, Popconfirm, Table, Tag, Form } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { Modal, Form as C7NForm, DataSet, TextField, IntlField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import { Header } from 'components/Page';

import {
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  tableScrollWidth,
  getResponse,
} from 'utils/utils';
import { enableRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import cacheComponent from 'components/CacheComponent';

import AutoRestHeight from '@/components/AutoRestHeight';
import { copyService } from '@/services/serviceDefinitionService';
import FilterForm from './FilterForm';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import styles from './index.less';

@connect(({ loading, serviceDefinition }) => ({
  serviceDefinition,
  isSiteFlag: !isTenantRoleLevel(),
  currentTenantId: getCurrentOrganizationId(),
  listLoading: loading.effects['serviceDefinition/fetchList'],
  deleteLoading: loading.effects['serviceDefinition/deleteService'],
}))
@formatterCollections({
  code: ['hwfp.serviceDefinition', 'hwfp.interfaceMap', 'entity.tenant', 'srm.common'],
})
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hwfp/service-definition/list' })
export default class ServiceDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.filterForm = null;
    this.tableRef = null;
  }

  state = {
    currentRecord: {},
  };

  componentDidMount() {
    const { dispatch, currentTenantId } = this.props;
    dispatch({
      type: 'serviceDefinition/init',
      payload: {
        tenantId: currentTenantId,
      },
    });
    this.fetchList();
  }

  @Bind()
  fetchList(params = {}) {
    const {
      dispatch,
      serviceDefinition: { pagination = {} },
    } = this.props;
    const fieldValues =
      this.filterForm === undefined ? {} : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'serviceDefinition/fetchList',
      payload: { ...fieldValues, page: pagination, ...params },
    });
  }

  @Bind()
  handleSearch() {
    this.fetchList({ page: {} });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = (ref.props || {}).form;
  }

  @Bind()
  handleBindTableRef(ref = {}) {
    this.tableRef = ref;
  }

  @Bind()
  handleExpandForm() {
    if (this.tableRef) {
      this.tableRef.handler();
    }
  }

  @Bind()
  handlePagination(page) {
    this.fetchList({ page });
  }

  @Bind()
  handleCreate() {
    const { history } = this.props;
    history.push(`/hwfp/service-definition/detail/create`);
  }

  @Bind()
  handleEdit(record) {
    const { history, dispatch } = this.props;
    // 清除缓存
    dispatch({
      type: 'serviceDefinition/updateState',
      payload: { serviceDetail: {}, parameterList: [] },
    });
    history.push(`/hwfp/service-definition/detail/${record.serviceId}`);
  }

  @Bind()
  handleCopy(record) {
    const {
      serviceId,
      categoryDescription,
      serviceModeMeaning,
      serviceTypeMeaning,
      documentDescription,
      description,
    } = record;
    const formDs = new DataSet({
      fields: [
        {
          label: intl.get('hwfp.serviceDefinition.model.service.serviceCode').d('服务编码'),
          name: 'serviceCode',
          type: 'string',
          required: true,
          maxLength: 30,
          format: 'uppercase',
          validator: (value) => {
            if (value && !/^[A-Z][A-Z0-9-_.]*$/.test(value)) {
              return intl.get('hzero.common.validation.codeUpperBegin.noSlash').d('全大写及数字，必须以字母开头，可包含“-”、“_”、“.”');
            }
          },
        },
        {
          label: intl.get('hwfp.serviceDefinition.model.service.categoryDescription').d('流程分类'),
          name: 'categoryDescription',
        },
        {
          label: intl.get('hwfp.serviceDefinition.model.service.serviceModeMeaning').d('服务方式'),
          name: 'serviceModeMeaning',
        },
        {
          label: intl.get('hwfp.serviceDefinition.model.service.serviceTypeMeaning').d('服务类别'),
          name: 'serviceTypeMeaning',
        },
        {
          label: intl.get('hwfp.serviceDefinition.model.service.documentDescription').d('流程单据'),
          name: 'documentDescription',
        },
        {
          label: intl.get('hwfp.serviceDefinition.model.service.description').d('服务描述'),
          name: 'description',
          type: 'intl',
          required: true,
          maxLength: 240,
        },
      ],
    });
    const formRecord = formDs.create({
      categoryDescription,
      serviceModeMeaning,
      serviceTypeMeaning,
      documentDescription,
      description,
    });
    Modal.open({
      title: intl.get('hzero.common.button.copy').d('复制'),
      drawer: true,
      style: { width: '380px' },
      children: (
        <C7NForm record={formRecord} labelLayout="float" columns={1}>
          <TextField name="serviceCode" />
          <TextField name="categoryDescription" disabled />
          <TextField name="serviceModeMeaning" disabled />
          <TextField name="serviceTypeMeaning" disabled />
          <TextField name="documentDescription" disabled />
          <IntlField name="description" />
        </C7NForm>
      ),
      onOk: async () => {
        const flag = await formRecord.validate();
        if (flag) {
          const { serviceCode: newServiceCode, description: newDescription } = formRecord.get([
            'serviceCode',
            'description',
          ]);
          const res = await copyService({
            serviceId,
            serviceCode: newServiceCode,
            description: newDescription,
          });
          if (getResponse(res)) {
            notification.success();
            this.handleSearch();
            return true;
          }
        }
        return false;
      },
    });
  }

  @Bind()
  deleteService(record = {}) {
    const { dispatch } = this.props;
    this.setState({ currentRecord: record });
    dispatch({
      type: 'serviceDefinition/deleteService',
      payload: record,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }

  @Bind()
  getColumns() {
    const { isSiteFlag, currentTenantId } = this.props;
    if (!this.columns) {
      this.columns = [
        isSiteFlag && {
          title: intl.get('hzero.common.model.tenantName').d('租户'),
          dataIndex: 'tenantName',
          width: 200,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.categoryDescription').d('流程分类'),
          dataIndex: 'categoryDescription',
          width: 150,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.serviceCode').d('服务编码'),
          dataIndex: 'serviceCode',
          width: 250,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.serviceModeMeaning').d('服务方式'),
          dataIndex: 'serviceModeMeaning',
          width: 250,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.serviceTypeMeaning').d('服务类别'),
          dataIndex: 'serviceTypeMeaning',
          width: 120,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.documentDescription').d('流程单据'),
          dataIndex: 'documentDescription',
          width: 200,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.description').d('服务描述'),
          dataIndex: 'description',
          width: 200,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.interface.expression').d('执行表达式'),
          dataIndex: 'expression',
          width: 200,
          render: (value) => <Text>{value}</Text>,
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          width: 100,
          align: 'center',
          dataIndex: 'enabledFlag',
          render: enableRender,
        },
        !isSiteFlag && {
          title: intl.get('hzero.common.source').d('来源'),
          width: 100,
          align: 'center',
          render: (_, record) =>
            currentTenantId === record.tenantId ? (
              <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
            ) : (
              <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
            ),
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          dataIndex: 'operator',
          width: 180,
          fixed: 'right',
          render: (val, record) => {
            const { deleteLoading = false } = this.props;
            const { currentRecord } = this.state;
            const operators = [
              {
                key: 'edit',
                ele: (
                  <a
                    onClick={() => {
                      this.handleEdit(record);
                    }}
                  >
                    {currentTenantId === record.tenantId || isSiteFlag
                      ? intl.get('hzero.common.button.edit').d('编辑')
                      : intl.get('hzero.common.button.look').d('查看')}
                  </a>
                ),
                len: 2,
                title:
                  currentTenantId === record.tenantId || isSiteFlag
                    ? intl.get('hzero.common.button.edit').d('编辑')
                    : intl.get('hzero.common.button.look').d('查看'),
              },
            ];
            if (!isSiteFlag && currentTenantId === record.tenantId) {
              operators.push({
                key: 'copy',
                ele: (
                  <a
                    onClick={() => {
                      this.handleCopy(record);
                    }}
                  >
                    {intl.get('hzero.common.button.copy').d('复制')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.copy').d('复制'),
              });
            }
            if (isSiteFlag || currentTenantId === record.tenantId) {
              if (!(record.serviceId === currentRecord.serviceId && deleteLoading)) {
                operators.push({
                  key: 'delete',
                  ele: (
                    <Popconfirm
                      placement="topRight"
                      title={intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？')}
                      onConfirm={() => this.deleteService(record)}
                    >
                      <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                    </Popconfirm>
                  ),
                  len: 2,
                  title: intl.get('hzero.common.button.delete').d('删除'),
                });
              } else {
                operators.push({
                  key: 'loading',
                  ele: <Icon type="loading" style={{ marginLeft: 20 }} />,
                  len: 2,
                });
              }
            }
            return operatorRender(operators, record);
          },
        },
      ].filter(Boolean);
    }
    return this.columns;
  }

  render() {
    const {
      isSiteFlag,
      currentTenantId,
      listLoading = false,
      serviceDefinition: {
        pagination = {},
        serviceList = [],
        serviceTypeList = [],
        serviceModeList = [],
        processCategoryList = [],
        serviceEnableList = [],
      },
      form,
    } = this.props;
    const filterProps = {
      isSiteFlag,
      currentTenantId,
      processCategoryList,
      serviceModeList,
      serviceTypeList,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      onExpandForm: this.handleExpandForm,
      serviceEnableList,
      form,
    };
    return (
      <>
        <Header
          title={intl.get('hwfp.serviceDefinition.view.title.serviceDefinition').d('服务定义')}
        >
          <Button icon="plus" type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <ExportButton />
          <ImportButton />
        </Header>
        <div className={styles.content}>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <div className={styles.list}>
            <AutoRestHeight
              topSelector=".ant-spin-container"
              type="hzero-ui"
              onRef={this.handleBindTableRef}
            >
              <Table
                bordered
                rowKey="serviceId"
                columns={this.getColumns()}
                scroll={{ x: tableScrollWidth(this.getColumns()) }}
                dataSource={serviceList}
                pagination={pagination}
                loading={listLoading}
                onChange={this.handlePagination}
              />
            </AutoRestHeight>
          </div>
        </div>
      </>
    );
  }
}
