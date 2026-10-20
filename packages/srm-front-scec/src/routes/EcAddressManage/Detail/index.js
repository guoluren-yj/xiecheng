/**
 * EcAddressManage -Detail 电商地址管理-详情
 * @date: 2018-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import qs from 'querystring';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getEditTableData, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import FilterForm from './FilterForm';

const modelPrompt = 'scec.ecAddressManage';
@connect(({ loading, ecAddressManage }) => ({
  ecAddressManage,
  loading: loading.effects['ecAddressManage/fetchEcAddressManage'],
  updateLoading: loading.effects['ecAddressManage/ecReginAssociation'],
}))
@formatterCollections({ code: ['scec.ecAddressManage', 'scec.common'] })
export default class index extends Component {
  constructor(props) {
    super(props);
    const { regionCode, regionName } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      regionCode,
      regionName,
    };
  }

  form;

  @Bind()
  handleRef(refs = {}) {
    this.form = (refs.props || {}).form;
  }

  componentDidMount() {
    this.fetchBatchIdpValue();
    this.fetchEcAddressManageDetail();
  }

  /**
   * 获取映射状态值级
   */
  @Bind()
  fetchBatchIdpValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecAddressManage/batchIdpValue',
      payload: {},
    });
  }

  @Bind()
  fetchEcAddressManageDetail(params = {}) {
    const { dispatch } = this.props;
    const { regionCode } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecAddressManage/fetchEcAddressManage',
      payload: {
        page: isEmpty(params) ? {} : params,
        ecPlatform: regionCode,
        ...filterValues,
      },
    });
  }

  /**
   * 将数据更改为编辑状态
   * @param record 当前行历史数据
   */
  handleEditData(record = {}, flag) {
    const {
      dispatch,
      ecAddressManage: {
        list: { content = {} },
      },
    } = this.props;
    const flagIndex = content.findIndex(item => item.srmRegionId === record.srmRegionId);
    const updateFlag = flag ? 'update' : '';
    dispatch({
      type: 'ecAddressManage/updateState',
      payload: {
        list: {
          content: [
            ...content.slice(0, flagIndex),
            {
              ...record,
              _status: updateFlag,
            },
            ...content.slice(flagIndex + 1),
          ],
        },
      },
    });
  }

  /**
   * 保存数据接口
   */
  @Bind()
  handleSaveData() {
    const {
      dispatch,
      ecAddressManage: {
        list: { content = [] },
      },
    } = this.props;
    const params = getEditTableData(content);
    if (Array.isArray(params) && params.length === 0) {
      return;
    }
    dispatch({
      type: 'ecAddressManage/ecReginAssociation',
      payload: [...params],
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchEcAddressManageDetail();
      }
    });
  }

  render() {
    const {
      ecAddressManage: { list = {}, pagination = {}, queryCode },
      loading,
      updateLoading,
    } = this.props;
    const { regionName } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.model.regionCode`).d('地址编码'),
        dataIndex: 'regionCode',
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('externalSystemCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.model.regionCode`).d('地址编码'),
                      }),
                    },
                  ],
                  initialValue: record.regionCode,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.model.regionName`).d('地址名称'),
        dataIndex: 'addressName',
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('addressName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.model.regionName`).d('地址名称'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.model.regionalLevel`).d('区域等级'),
        dataIndex: 'levelNumber',
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('levelNumber', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.model.regionalLevel`).d('区域等级'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.model.mappingArea`).d('映射区域'),
        dataIndex: 'mappingAddress',
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('regionId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.model.mappingArea`).d('映射区域'),
                      }),
                    },
                  ],
                  initialValue: record.mappingAddress,
                })(
                  <Lov
                    textValue={record.mappingAddress}
                    code="SCEC.REGION_LEAFNODE"
                    queryParams={{ ecPlatform: this.state.regionCode }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        align: 'center',
        render: (val, record) => {
          if (record._status === 'update') {
            return (
              <a
                onClick={() => {
                  this.handleEditData(record, false);
                }}
              >
                {intl.get('scec.common.action.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a
                onClick={() => {
                  this.handleEditData(record, true);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
    const filterList = {
      queryCode,
      onRef: this.handleRef,
      onFetchData: this.fetchEcAddressManageDetail,
    };
    return (
      <React.Fragment>
        <Header title={regionName} backPath="/scec/ec-address-manage/list">
          <Button
            icon="save"
            type="primary"
            onClick={() => this.handleSaveData()}
            loading={updateLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <EditTable
            bordered
            scroll={{ x: 950 }}
            loading={loading}
            rowKey="srmRegionId"
            dataSource={list.content || []}
            columns={columns}
            pagination={pagination}
            onChange={page => this.fetchEcAddressManageDetail(page)}
          />
        </Content>
      </React.Fragment>
    );
  }
}
