/**
 * InterfaceSegment -接口段同步(接口表结构定义)
 * @date: 2018-9-20
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form, Radio } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import InterfaceSegmentModal from './InterfaceSegmentModal';
import FitlerForm from './FitlerForm';
@connect(({ interfaceSegment, loading }) => ({
  interfaceSegment,
  loading: loading.effects['interfaceSegment/queryInterfaceSegment'],
  modelLoading: loading.effects['interfaceSegment/querySegmentFields'],
  syncLoading: loading.effects['interfaceSegment/syncSegmentFields'],
}))
@formatterCollections({
  code: ['sitf.interfaceSegment'],
})
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/interface-segment' })
export default class InterfaceSegment extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      segmentId: '',
      selectGroupState: 'SAP', // ebs还是sap
    };
  }

  form;

  componentDidMount() {
    this.queryInterfaceSegment();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }
  /**
   * 查询接口段定义
   * @param {object} params 查询参数
   * @memberof InterfaceConstrucDef
   */
  @Bind()
  queryInterfaceSegment(params = {}) {
    const {
      dispatch,
      interfaceSegment: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    // 若为验证情况则取消验证
    const { idocType } = fieldValues;
    dispatch({
      type: 'interfaceSegment/queryInterfaceSegment',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
        relationValue: idocType,
        erpSystemType: this.state.selectGroupState,
      },
    });
  }

  /**
   * 取消新建
   */
  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * 查看接口表
   * @param {object} record 当前行记录
   */
  @Bind()
  showInterfaceTable(record = {}) {
    const {
      dispatch,
      interfaceSegment: { fieldPagination = {} },
    } = this.props;
    const { segmentId } = record;
    const fieldValues = isUndefined(this.props.form)
      ? {}
      : filterNullValueObject(this.props.form.getFieldsValue());
    this.setState({
      modalVisible: true,
      segmentId: record.segmentId,
    });
    dispatch({
      type: 'interfaceSegment/querySegmentFields',
      payload: {
        segmentId,
        ...fieldValues,
        page: isEmpty(record) ? fieldPagination : record,
      },
    });
  }

  /**
   * 同步数据
   * 备注：查询条件与同步接口共用，其中查询条件两个分别是sap与relationValue(基本类型)
   * 同步字段：表单数据加erpSystemType(sap)
   */
  @Bind()
  synchronous() {
    const { dispatch } = this.props;
    this.form.validateFields((err, values) => {
      const { externalSystemCode, idocType, ...otherValue } = values;
      if (idocType === undefined || externalSystemCode === undefined) {
        notification.warning({
          message: intl
            .get(`sitf.interfaceSegment.view.interfaceSegment.warning`)
            .d('IDOC基本类型与外部系统类型不可为空'),
        });
        return;
      }
      if (isEmpty(err)) {
        dispatch({
          type: 'interfaceSegment/syncSegmentFields',
          payload: {
            idocType,
            externalSystemCode,
            erpSystemType: this.state.selectGroupState,
            ...otherValue,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.queryInterfaceSegment();
          }
        });
      }
    });
  }

  /**
   * 选择EBS还是sap
   * @memberof InterfaceSegment
   */
  @Bind()
  selectGroupState(e) {
    this.setState({
      selectGroupState: e.target.value,
    });
  }

  render() {
    const {
      loading,
      interfaceSegment: { list = {}, fieldsList, pagination = {}, fieldPagination = {} },
      modelLoading,
      syncLoading,
    } = this.props;
    const { modalVisible, segmentId } = this.state;
    const columns = [
      {
        title: intl
          .get(`sitf.interfaceSegment.model.interfaceSegment.relationValue`)
          .d('IDOC基本类型'),
        dataIndex: 'relationValue',
        width: 150,
        align: 'left',
      },
      {
        title: intl
          .get(`sitf.interfaceSegment.model.interfaceSegment.erpSystemType`)
          .d('erp系统类别'),
        dataIndex: 'erpSystemType',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.segmentType`).d('段代码'),
        dataIndex: 'segmentType',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.segmentDef`).d('段描述'),
        dataIndex: 'segmentDef',
        align: 'left',
      },
      {
        title: intl.get(`sitf.common.data.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.edit`).d('接口字段表'),
        align: 'left',
        dataIndex: 'edit',
        width: 120,
        render: (text, record) => {
          return (
            <a
              onClick={() => {
                this.showInterfaceTable(record);
              }}
            >
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          );
        },
      },
    ];
    const filterProps = {
      onRef: this.handleRef,
      synchronous: this.synchronous,
      onFetchInterface: this.queryInterfaceSegment,
    };
    const detailProps = {
      modalVisible,
      modelLoading,
      segmentId,
      fieldsList,
      onCancel: this.handleCancel,
      anchor: 'right',
      fieldPagination,
      onShowInterfaceTable: this.showInterfaceTable,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sitf.interfaceSegment.view.interfaceSegment.headerTitle`)
            .d('接口段结构表')}
        >
          <React.Fragment>
            <Radio.Group defaultValue="SAP" buttonStyle="solid" onChange={this.selectGroupState}>
              <Radio.Button value="SAP">SAP</Radio.Button>
              <Radio.Button value="EBS">EBS</Radio.Button>
            </Radio.Group>
          </React.Fragment>
        </Header>
        <Content>
          <div className="table-list-search">
            <FitlerForm {...filterProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content}
            rowKey="segmentId"
            columns={columns}
            loading={loading || syncLoading}
            bordered
            onChange={page => this.queryInterfaceSegment(page)}
          />
        </Content>
        <InterfaceSegmentModal {...detailProps} />
      </React.Fragment>
    );
  }
}
