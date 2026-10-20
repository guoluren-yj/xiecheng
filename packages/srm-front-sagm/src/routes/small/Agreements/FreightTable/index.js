import React from 'react';
import { Table, Switch, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import { fetchFreight, handleFreight } from '@/services/mallProtocolManagementService';
import FreightModal from './FreightModal';

export default class FreightTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      indexNum: undefined,
      loading: false,
      changeLoading: false,
      list: [],
      pagination: {},
    };
  }

  componentDidMount() {
    this.fetchCodes();
    this.handleSearchFreight();
  }

  componentWillReceiveProps(nextProps) {
    const { supplierTenantId } = nextProps;
    const { supplierTenantId: prevTenantId } = this.props;
    if (prevTenantId !== supplierTenantId) {
      this.handleSearchFreight({}, supplierTenantId);
    }
  }

  @Bind()
  handleToggleModal() {
    this.setState({ visible: !this.state.visible });
  }

  @Bind
  fetchCodes() {
    queryMapIdpValue({
      agreementPricingMethods: 'SMAL.AGREEMENT_PRICING_METHOD',
      agreementPricingTypes: 'SMAL.AGREEMENT_PRICING_TYPE',
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({ ...result });
      }
    });
  }

  // 运费查询
  @Bind()
  handleSearchFreight(page = { page: 0, size: 10 }, _supplierTenantId) {
    const { supplierTenantId } = this.props;
    const supTenantId = _supplierTenantId || supplierTenantId;
    if (supTenantId) {
      this.setState({ loading: true });
      fetchFreight({
        page,
        supplierTenantId: supTenantId,
      })
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            this.setState({
              list: result.content || [],
              pagination: createPagination(result),
            });
          }
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  }

  @Bind()
  handleChange(checked, record) {
    const { pagination } = this.state;
    handleFreight({ ...record, enabled: checked ? 1 : 0, onlyEnable: 0 }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.handleSearchFreight(pagination);
      }
    });
  }

  render() {
    const {
      visible,
      indexNum,
      loading,
      changeLoading,
      list,
      pagination,
      agreementPricingMethods = [],
      agreementPricingTypes = [],
    } = this.state;
    const { readOnly, supplierTenantId, allCity = [] } = this.props;
    const modalProps = {
      allCity,
      visible,
      supplierTenantId,
      agreementPricingTypes,
      agreementPricingMethods,
      onlyRead: readOnly,
      postages: list[indexNum] || {},
      onToggleModal: this.handleToggleModal,
      onFetchList: () => this.handleSearchFreight(pagination),
    };
    const columns = [
      {
        title: intl.get('small.freight.model.freightRuleName').d('运费规则名称'),
        width: 200,
        dataIndex: 'postageName',
      },
      {
        title: intl.get('hzero.common.enable').d('启用'),
        width: 200,
        dataIndex: 'enabled',
        render: (_, record) => (
          <Switch
            disabled={readOnly}
            checked={record.enabled}
            onChange={(checked) => this.handleChange(checked, record)}
          />
        ),
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        width: 200,
        render: (_, record, index) =>
          readOnly ? (
            <a onClick={() => this.setState({ visible: true, indexNum: index })}>
              {intl.get('hzero.common.button.look').d('查看')}
            </a>
          ) : (
            <a onClick={() => this.setState({ visible: true, indexNum: index })}>
              {intl.get('hzero.common.edit').d('编辑')}
            </a>
          ),
      },
    ];

    return (
      <React.Fragment>
        {!readOnly && (
          <div className="table-operator" style={{ marginTop: 16 }}>
            <Button
              onClick={() => this.setState({ visible: true, indexNum: -1 })}
              disabled={!supplierTenantId}
              type="primary"
            >
              {intl.get('small.common.view.addFreightRule').d('新建运费规则')}
            </Button>
          </div>
        )}
        <Table
          rowKey="postageId"
          columns={columns}
          loading={loading || changeLoading}
          dataSource={list}
          pagination={pagination}
          onChange={(page) => this.handleSearchFreight(page)}
        />
        {visible && <FreightModal {...modalProps} />}
      </React.Fragment>
    );
  }
}
