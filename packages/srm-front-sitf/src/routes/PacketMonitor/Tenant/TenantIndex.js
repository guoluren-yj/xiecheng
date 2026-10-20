/**
 * PacketMonitor -TenantIndex 接口请求报文监控-index部分 租户请求入口
 * @date: 2018-11-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getDateTimeFormat,
  isTenantRoleLevel,
} from 'utils/utils';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
@formatterCollections({ code: ['sitf.PacketMonitor', 'entity.tenant', 'sitf.common'] })
export default class TenantIndex extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      format: getDateTimeFormat(),
      organizationRole: isTenantRoleLevel(),
    };
  }

  form;

  componentDidMount() {
    this.fetchPacketMonitorList();
    this.fetchCode();
  }

  @Bind()
  handlerRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 直接查询
  @Bind()
  fetchCode() {
    const { dispatch, modelName = 'packetMonitor' } = this.props;
    dispatch({
      type: `${modelName}/batchIdpValue`,
    });
  }

  @Bind()
  fetchPacketMonitorList(params = {}) {
    const { dispatch, modelName = 'packetMonitor' } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { requestDateFrom, requestDateTo, ...otherValue } = fieldValues;
    dispatch({
      type: `${modelName}/fetchPacketMonitor`,
      payload: {
        page: isEmpty(params) ? {} : params,
        requestDateFrom: requestDateFrom
          ? requestDateFrom.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        requestDateTo: requestDateTo ? requestDateTo.format(DEFAULT_DATETIME_FORMAT) : undefined,
        ...otherValue,
      },
    });
  }

  render() {
    const { modelName = 'packetMonitor', loading, dispatch } = this.props;
    const {
      [modelName]: { list = {}, pagination = {}, code = [] },
    } = this.props;
    const { organizationId, format, organizationRole } = this.state;
    const filterParams = {
      code,
      list,
      format,
      organizationRole,
      organizationId,
      onRef: this.handlerRef,
      onFetchPacketMonitor: this.fetchPacketMonitorList,
    };
    const tableParams = {
      loading,
      list,
      pagination,
      organizationId,
      dispatch,
      modelName,
      onFetchPacketMonitor: this.fetchPacketMonitorList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.PacketMonitor.model.PacketMonitor.title').d('接口请求报文监控')}
        />
        <Content>
          <FilterForm {...filterParams} />
          <ListTable {...tableParams} />
        </Content>
      </React.Fragment>
    );
  }
}
