/*
 * 送货单审批规则定义Modal
 * @date: 2020/04/27 14:56:50
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Select } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getEditTableData } from 'utils/utils';

import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import EnterDefinition from '../../../sodr/EnterDefinition';

const FormItem = Form.Item;
const deliveryPrompt = 'spfm.configServer.view.delivery.message';
const { Option } = Select;

@connect(({ loading, configServer }) => ({
  saving: loading.effects['configServer/saveApprovalRules'],
  loading: loading.effects['configServer/fetchDeliveryApprovalRules'],
  allSelectLoading: loading.effects['configServer/saveDeliveryApprovalRules'],
  configServer,
}))
@Form.create({ fieldNameProp: null })
export default class ApprovalRulesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      enterDefinitionVisible: false,
      configHeaderId: '',
      companyIncludeAllFlag: '',
      supplierIncludeAllFlag: '',
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询送货单审批规则
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchDeliveryApprovalRules',
    }).then(res => {
      if (res) {
        const newRes = res.map(item => ({ ...item, _status: 'update' }));
        const orderedDataSource = this.getOrderedDataSource(newRes); //修改数据源数组顺序
        const initDataSource = this.initDataSource(orderedDataSource); //初始化数据源
        this.setState({
          dataSource: initDataSource,
        });
      }
    });
  }

  /**
   * 关闭送货单审批规则弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('approvalRulesVisible', false);
    }
  }

  /**
   * 保存送货单审批规则
   * @returns
   */
  @Bind()
  saveList(checked, configHeaderId, configType) {
    const { dataSource } = this.state;
    const lines = getEditTableData(dataSource, ['_status']);
    const checkFlag = this.checkData();
    if (checkFlag) {
      this.validSave(lines, checked, configHeaderId, configType);
    }
  }

  @Bind()
  validSave(lines, checked, configHeaderId, configType) {
    const { dispatch } = this.props;
    let newLines = lines;
    if (configType === 'COMPANY') {
      newLines = lines.map(item => {
        if (item.configHeaderId === configHeaderId) {
          return {
            ...item,
            companyIncludeAllFlag: checked ? 1 : 0,
          };
        } else {
          return item;
        }
      });
    } else if (configType === 'SUPPLIER') {
      newLines = lines.map(item => {
        if (item.configHeaderId === configHeaderId) {
          return {
            ...item,
            supplierIncludeAllFlag: checked ? 1 : 0,
          };
        } else {
          return item;
        }
      });
    }
    dispatch({
      type: 'configServer/saveDeliveryApprovalRules',
      payload: newLines,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const { dataSource } = this.state;
    const tableValues = getEditTableData(dataSource, ['configHeaderId']);
    const isEditing = !!dataSource.find(d => d._status === 'create' || d._status === 'update');
    if (isEditing) {
      if (Array.isArray(tableValues) && tableValues.length !== 0) {
        return tableValues;
      } else {
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 改变state
   */
  @Bind()
  handleStateChange(field, value, record = {}) {
    const { configHeaderId = '', companyIncludeAllFlag = '', supplierIncludeAllFlag = '' } = record;
    this.setState({
      [field]: value,
      configHeaderId,
      companyIncludeAllFlag,
      supplierIncludeAllFlag,
    });
  }

  @Bind()
  enableFlagChange(record, index, e) {
    const enableFlag = e.target.checked;
    const { dataSource } = this.state;
    const newDataSource = dataSource.map((n, i) => {
      if (i === index) {
        return {
          ...n,
          enableFlag: enableFlag === 1 ? 1 : 0,
        };
      } else {
        return n;
      }
    });
    const changedDataSource = this.handleEnableFlagChange(index, enableFlag, newDataSource);
    this.setState({ dataSource: changedDataSource });
  }

  @Bind()
  handleEnableFlagChange(index, enableFlag, newDataSource) {
    let changedDataSource = newDataSource;
    if (index === 0 && enableFlag === 0) {
      //当第一行不勾选时，第二行不可勾选,取消勾选
      changedDataSource = newDataSource.map((n, i) => {
        if (i === 1) {
          n.$form.setFieldsValue({ enableFlag: 0 });
          return {
            ...n,
            enableFlag: 0,
            disableFlag: true,
          };
        } else {
          return n;
        }
      });
    } else if (index === 0 && enableFlag === 1) {
      //当第一行勾选时，第二行可勾选
      changedDataSource = newDataSource.map((n, i) => {
        if (i === 1 && newDataSource[0].approveMethod === 'FUNCTIONAL') {
          return {
            ...n,
            disableFlag: false,
          };
        } else {
          return n;
        }
      });
    } else if (index === 2 && enableFlag === 0) {
      //当第三行不勾选时，第四行不可勾选，取消勾选
      changedDataSource = newDataSource.map((n, i) => {
        if (i === 3) {
          n.$form.setFieldsValue({ enableFlag: 0 });
          return {
            ...n,
            enableFlag: 0,
            disableFlag: true,
          };
        } else {
          return n;
        }
      });
    } else if (index === 2 && enableFlag === 1) {
      //当第三行勾选时，第四行可勾选
      changedDataSource = newDataSource.map((n, i) => {
        if (i === 3 && newDataSource[2].approveMethod === 'FUNCTIONAL') {
          return {
            ...n,
            disableFlag: false,
          };
        } else {
          return n;
        }
      });
    }
    return changedDataSource;
  }

  @Bind()
  approveMethodChange(record, index, approveMethod) {
    const { dataSource } = this.state;
    const newDataSource = this.handleApproveMethodChange(index, approveMethod, dataSource);
    this.setState({ dataSource: newDataSource });
  }

  @Bind()
  handleApproveMethodChange(index, approveMethod, dataSource) {
    let newDataSource = dataSource;
    if (index === 0) {
      // 如果第一行选择工作流审批或者外部系统审批，则第二行不可勾选，取消勾选
      if (approveMethod === 'EXTERNAL_SYSTEM' || approveMethod === 'WORKFLOW') {
        newDataSource = dataSource.map((n, i) => {
          if (i === 1) {
            return {
              ...n,
              enableFlag: 0,
              disableFlag: true,
            };
          } else {
            return n;
          }
        });
        // 如果第一行不选择工作流审批或者外部系统审批，则第二行可勾选
      } else {
        newDataSource = dataSource.map((n, i) => {
          if (i === 1) {
            return {
              ...n,
              disableFlag: false,
            };
          } else {
            return n;
          }
        });
      }
      // 如果第三行选择工作流审批或者外部系统审批，则第四行不可勾选，取消勾选
    } else if (index === 2) {
      if (approveMethod === 'EXTERNAL_SYSTEM' || approveMethod === 'WORKFLOW') {
        newDataSource = dataSource.map((n, i) => {
          if (i === 3) {
            return {
              ...n,
              enableFlag: 0,
              disableFlag: true,
            };
          } else {
            return n;
          }
        });
        // 如果第三行不选择工作流审批或者外部系统审批，则第四行可勾选
      } else {
        newDataSource = dataSource.map((n, i) => {
          if (i === 3) {
            return {
              ...n,
              disableFlag: false,
            };
          } else {
            return n;
          }
        });
      }
    }
    return newDataSource;
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked, configHeaderId, configType) {
    const { dataSource } = this.state;
    if (configType === 'COMPANY') {
      const companyIncludeAllFlag = checked ? 1 : 0;
      this.setState({ companyIncludeAllFlag });
      const newDataSource = dataSource.map(item => {
        if (item.configHeaderId === configHeaderId) {
          return { ...item, companyIncludeAllFlag };
        } else {
          return item;
        }
      });
      this.setState({ dataSource: newDataSource });
    } else if (configType === 'SUPPLIER') {
      const supplierIncludeAllFlag = checked ? 1 : 0;
      this.setState({ supplierIncludeAllFlag });
      const newDataSource = dataSource.map(item => {
        if (item.configHeaderId === configHeaderId) {
          return { ...item, supplierIncludeAllFlag };
        } else {
          return item;
        }
      });
      this.setState({ dataSource: newDataSource });
    }
    this.saveList(checked, configHeaderId, configType);
  }

  /**
   * 修改数据源数组顺序
   * @param {*} dataSource
   */
  @Bind()
  getOrderedDataSource(dataSource) {
    const array = ['ASN_APPROVE', 'ASN_REVIEW', 'ASN_CANCEL_APPROVE', 'ASN_CANCEL_REVIEW'];
    let orderedDataSource = dataSource;
    if (dataSource.length > 0) {
      orderedDataSource = array.map(item => {
        const filteredDataSource = dataSource.filter(n => n.approveType === item);
        return filteredDataSource[0];
      });
    }
    return orderedDataSource;
  }

  /**
   * 初始化数据源
   */
  @Bind()
  initDataSource(dataSource) {
    const { enableFlag: oneEnableFlag, approveMethod: oneApproveMethod } = dataSource[0];
    const { enableFlag: threeEnableFlag, approveMethod: threeApproveMethod } = dataSource[2];
    const newDataSource = dataSource.map((n, index) => {
      if (index === 1) {
        if (
          oneEnableFlag === 0 ||
          oneApproveMethod === 'EXTERNAL_SYSTEM' ||
          oneApproveMethod === 'WORKFLOW'
        ) {
          return {
            ...n,
            enableFlag: 0,
            disableFlag: true,
          };
        } else {
          return n;
        }
      } else if (index === 3) {
        if (
          threeEnableFlag === 0 ||
          threeApproveMethod === 'EXTERNAL_SYSTEM' ||
          threeApproveMethod === 'WORKFLOW'
        ) {
          return {
            ...n,
            enableFlag: 0,
            disableFlag: true,
          };
        } else {
          return n;
        }
      } else {
        return n;
      }
    });
    return newDataSource;
  }

  render() {
    const {
      visible,
      saving,
      loading,
      allSelectLoading,
      configServer: { enumMap },
    } = this.props;
    const {
      enterDefinitionVisible,
      dataSource,
      configHeaderId,
      companyIncludeAllFlag,
      supplierIncludeAllFlag,
    } = this.state;
    const { purchaserApproval } = enumMap;
    const enterDefinitionProps = {
      configHeaderId,
      companyIncludeAllFlag,
      supplierIncludeAllFlag,
      allSelectLoading,
      visible: enterDefinitionVisible,
      includeAllFlag: this.includeAllFlag,
      handleModal: this.handleStateChange,
    };
    const columns = [
      {
        title: intl.get(`${deliveryPrompt}.approveType`).d('审批列表'),
        dataIndex: 'approveTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${deliveryPrompt}.enableFlag`).d('启用'),
        dataIndex: 'enableFlag',
        width: 150,
        render: (val, record, index) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('enableFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={record.disableFlag}
                  checked={val}
                  onChange={enableFlag => {
                    this.enableFlagChange(record, index, enableFlag);
                  }}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`${deliveryPrompt}.approveMethod`).d('审批方式'),
        dataIndex: 'approveMethod',
        width: 150,
        render: (val, record, index) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('approveMethod', {
                initialValue: val,
                rules: [
                  {
                    required: record.enableFlag === 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${deliveryPrompt}.approveMethod`).d('审批方式'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={approveMethod => {
                    this.approveMethodChange(record, index, approveMethod);
                  }}
                >
                  {purchaserApproval.map(n => (
                    <Option key={n.value} value={n.value} disabled={record.enableFlag === 0}>
                      {record.enableFlag === 0 ? null : n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`${deliveryPrompt}.definitionList`).d('定义列表'),
        dataIndex: 'definitionList',
        render: (val, record) => {
          const { enableFlag } = record;
          return (
            <a
              onClick={() => this.handleStateChange('enterDefinitionVisible', true, record)}
              style={{ display: enableFlag !== 1 ? 'none' : 'block' }}
            >
              {intl.get(`${deliveryPrompt}.enterDefinitionList`).d('进入定义列表')}
            </a>
          );
        },
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 200;
    return (
      <React.Fragment>
        <Modal
          title={intl.get(`${deliveryPrompt}.approvalRuleDefinition`).d('送货单审批规则定义')}
          visible={visible}
          footer={null}
          width={800}
          onCancel={this.hideModal}
        >
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginBottom: 8 }}>
            <Button type="primary" onClick={this.saveList} loading={saving}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <EditTable
            bordered
            rowKey="configHeaderId"
            loading={loading}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            columns={columns}
            pagination={false}
          />
        </Modal>
        {enterDefinitionVisible && <EnterDefinition {...enterDefinitionProps} />}
      </React.Fragment>
    );
  }
}
