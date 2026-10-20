import React, { Component, Fragment } from 'react';
import { Lov, DataSet, Icon } from 'choerodon-ui/pro';
import { Button, Drawer, Row, Col, Radio, Modal } from 'hzero-ui';
import { isEmpty, sum, uniq, uniqBy, isNil } from 'lodash';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEditTableData, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';

import List from './List';
import Search from './Search';
import MultiSelectModal from './MultiSelectModal';

const defaultTableRowKey = 'evalTplIndRespId';
const { Group: RadioGroup } = Radio;
const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['sslm.supplierKpiIndicator', 'sslm.common', 'sslm.investMaintain'],
})
@connect(({ loading, evaluationTemplate }) => ({
  evaluationTemplate,
  querySupplierLoading: loading.effects['evaluationTemplate/fetchSupplierLovData'],
  queryClassifyLoading: loading.effects['evaluationTemplate/fetchSupplierClassify'],
}))
export default class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      radioValue: null,
      classifyVisible: false,
    };
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    const { indicatorRowDataSource } = nextProps;
    const { radioValue } = nextState;
    if (radioValue !== null) {
      return { radioValue };
    }
    if (Object.keys(indicatorRowDataSource).includes('evalDimension')) {
      return {
        radioValue: indicatorRowDataSource.evalDimension || 'RESP',
      };
    }
  }

  list;

  @Bind()
  deleteRow() {
    const { selectedRowKeys, selectedRows } = this.state;
    const {
      fetchList,
      detailPermissionCode,
      evaluationTemplate: { permissionsList: dataSource },
    } = this.props;
    if (selectedRowKeys.length === 0) {
      notification.error({
        message: intl
          .get('sslm.supplierKpiIndicator.view.message.needSelectedData')
          .d('请先勾选一条数据再删除！'),
      });
      return false;
    }
    const {
      indicatorRowDataSource: { evalTplIndId: indicatorId },
      dispatch,
    } = this.props;
    // 新增数据
    const creatData = dataSource.filter(
      record => !record.evalTplIndId && record._status === 'create'
    );
    // 更新数据
    const updateData = selectedRows.filter(
      record => record.evalTplIndId && record._status === 'update'
    );
    // 只存在新增数据，移除数据
    if (isEmpty(updateData)) {
      dispatch({
        type: 'evaluationTemplate/deletePermissionsList',
        payload: {
          selectedRowKeys,
        },
      });
      this.setState({ selectedRowKeys: [], selectedRows: [] });
    } else {
      // 当存在更新的数据时，提示有新增数据未保存
      const modalTitle = isEmpty(creatData)
        ? intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?')
        : intl
            .get('hzero.common.message.confirm.saveAndRemove')
            .d('有新增数据未保存，确定删除选中数据?');
      Modal.confirm({
        title: modalTitle,
        onOk: () => {
          dispatch({
            type: 'evaluationTemplate/deleteIndicators',
            indicatorId,
            payload: {
              customizeUnitCode: detailPermissionCode,
              kpiEvalTplIndResps: selectedRows,
            },
          }).then(res => {
            if (getResponse(res)) {
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
              if (this.withParamsSearch) {
                this.withParamsSearch();
              } else {
                fetchList();
              }
              notification.success();
            }
          });
        },
      });
    }
  }

  @Bind()
  add(data = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/addPermissionsList',
      payload: {
        data: {
          ...data,
          _status: 'create',
          evalTplIndRespId: uuidv4(),
        },
      },
    });
  }

  @Bind()
  update(data = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/updatePermissionsList',
      payload: {
        data,
      },
    });
  }

  @Bind()
  cancel() {
    const { close, refresh = () => {} } = this.props;
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
      radioValue: null,
    });
    refresh();
    close();
  }

  @Bind()
  save() {
    const { radioValue } = this.state;
    const {
      close = () => {},
      refresh = () => {},
      dispatch,
      detailPermissionCode,
      indicatorRowDataSource: { evalTplIndId: indicatorId, evalDimension },
      evaluationTemplate: { permissionsList: dataSource },
    } = this.props;
    // 为空时默认 评分人维度：‘RESP’
    const oldEvalDimension = isNil(evalDimension) ? 'RESP' : evalDimension;
    // 评分人打分维度变更标识
    const dimensionalChangeFlag = oldEvalDimension !== radioValue;
    const tableData = getEditTableData(dataSource);
    if (isEmpty(tableData) && !isEmpty(dataSource)) {
      notification.error({
        message: intl.get('hzero.common.notification.invalid').d('校验不通过'),
      });
    } else {
      if (radioValue === 'RESP_SUPPLIER') {
        const total = {};
        tableData.forEach(item => {
          if (Object.keys(total).includes(item.supplierCompanyId)) {
            total[item.supplierCompanyId].push(item.respWeight);
          } else {
            total[item.supplierCompanyId] = [item.respWeight];
          }
        });
        let flag = false;
        for (const key in total) {
          if (sum(total[key]) > 100) {
            flag = true;
            break;
          }
        }
        if (flag) {
          notification.error({
            message: intl
              .get('sslm.supplierKpiIndicator.view.message.noSurpassWeight')
              .d('相同供应商下的权重不能超过100！'),
          });
          return false;
        }
      }
      if (dimensionalChangeFlag) {
        Modal.confirm({
          title: intl
            .get(`sslm.supplierKpiIndicator.view.message.dimensionalChangeTip`)
            .d('已切换评分人打分维度，其他指标评分人信息会被清空，确认保存吗？'),
          onOk: () => {
            dispatch({
              type: 'evaluationTemplate/insertOrUpdateIndicators',
              indicatorId,
              payload: {
                evalDimension: radioValue,
                kpiEvalTplIndResps: tableData,
                customizeUnitCode: detailPermissionCode,
              },
            }).then(res => {
              if (res && !res.failed) {
                notification.success();
                refresh();
                close();
                this.setState({
                  radioValue: null,
                  selectedRowKeys: [],
                  selectedRows: [],
                });
              }
            });
          },
        });
      } else {
        dispatch({
          type: 'evaluationTemplate/insertOrUpdateIndicators',
          indicatorId,
          payload: {
            evalDimension: radioValue,
            kpiEvalTplIndResps: tableData,
            customizeUnitCode: detailPermissionCode,
          },
        }).then(res => {
          if (res && !res.failed) {
            notification.success();
            refresh();
            close();
            this.setState({
              radioValue: null,
              selectedRowKeys: [],
              selectedRows: [],
            });
          }
        });
      }
    }
  }

  @Bind()
  onRadioChange(e) {
    this.setState({
      radioValue: e.target.value,
      selectedRowKeys: [],
      selectedRows: [],
    });
    const { fetchList } = this.props;
    fetchList();
  }

  @Bind()
  selectedRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  // 细项权限供应商查询
  @Bind()
  handleSupplierSearch(fieldsValue = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/fetchSupplierLovData',
      payload: {
        enabledFlag: 1,
        tenantId: organizationId,
        ...fieldsValue,
      },
    });
  }

  // 处理勾选数据，返回重复数据的用户名
  @Bind()
  repeatSelectedRows(selectedRows) {
    // 去重后的数组
    const notRepeatIds = [];
    // 重复数据
    const repeatIds = [];
    selectedRows.forEach(rows => {
      if (notRepeatIds.includes(rows.respUserId)) {
        repeatIds.push(rows.respUserId);
      } else {
        notRepeatIds.push(rows.respUserId);
      }
    });
    const repeatRows = uniqBy(
      selectedRows.filter(rows => repeatIds.includes(rows.respUserId)),
      'respUserId'
    );
    const repeatName = repeatRows.map(n => n.respUserName).join(',');
    return repeatName;
  }

  // 分配供应商
  @Bind()
  handleAssignSuppliers() {
    const { selectedRows, classifyVisible } = this.state;
    const personIdList = selectedRows.map(n => n.respUserId);
    // 去重后的用户id集合
    const uniqPersonIds = uniq(personIdList);
    // 存在的用户id集合
    const existPersonIds = personIdList.filter(Boolean);

    if (existPersonIds.length !== selectedRows.length) {
      notification.warning({
        message: intl
          .get('sslm.supplierKpiIndicator.view.message.userNotNull')
          .d('评分账户不能为空'),
      });
      this.setState({ selectedRows: [], selectedRowKeys: [] });
    } else if (uniqPersonIds.length !== selectedRows.length) {
      const repeatName = this.repeatSelectedRows(selectedRows);
      notification.warning({
        message: intl
          .get('sslm.supplierKpiIndicator.view.message.userNotRepeat', {
            name: repeatName,
          })
          .d(`同一用户【${repeatName}】不允许批量分配供应商`),
      });
    } else {
      this.setState({ classifyVisible: !classifyVisible });
      if (this.AssignCategoryModal) {
        this.AssignCategoryModal.setState({ selectedRowKeys: [], selectedRows: [] });
      }
      if (classifyVisible) {
        this.setState({ selectedRows: [], selectedRowKeys: [] });
      }
    }
  }

  // 分配供应商选中项发生改变时的回调
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    const { selectedRows: personSelectedRows } = this.state;
    const {
      evaluationTemplate: { permissionsList },
    } = this.props;
    const personIds = personSelectedRows.map(person => person.respUserId);
    const newPersonList = permissionsList.filter(item => personIds.includes(item.respUserId));
    const errList = [];
    selectedRows.forEach(supplier => {
      newPersonList.forEach(person => {
        if (person.supplierCompanyId === supplier.supplierCompanyId) {
          errList.push({
            respUserName: person.respUserName,
            supplierCompanyName: supplier.supplierCompanyName,
          });
        }
      });
    });
    if (!isEmpty(errList)) {
      notification.warning({
        message: intl
          .get('sslm.supplierKpiIndicator.view.message.supplierNotRepeat')
          .d('存在同一用户分配重复的供应商'),
        description: (
          <Fragment>
            {errList.map(err => (
              <div>{`【${err.respUserName}】【${err.supplierCompanyName}】`}</div>
            ))}
          </Fragment>
        ),
      });
      return;
    }
    if (this.AssignCategoryModal) {
      this.AssignCategoryModal.setState({ selectedRows, selectedRowKeys });
    }
  }

  // 分配供应商确认回调
  @Bind()
  handleOk() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      evaluationTemplate: { permissionsList },
    } = this.props;
    const supplierSelectedRows = this.AssignCategoryModal?.state.selectedRows;
    const newList = [];
    supplierSelectedRows.forEach((supplier, index) => {
      selectedRows.forEach(person => {
        const { respWeight, ...others } = person;
        const coverFlag = index === 0 && !person.supplierCompanyId;
        if (coverFlag) {
          newList.push({
            ...others,
            ...supplier,
          });
        } else {
          newList.push({
            ...others,
            ...supplier,
            _status: 'create',
            [defaultTableRowKey]: uuidv4(),
          });
        }
      });
    });
    // 勾选的评分人未选择供应商时，点击分配供应商确认按钮时过滤掉
    const selectedRowsIds = selectedRows.map(n => n.evalTplIndRespId);
    const dataSource = permissionsList.filter(
      item => !(selectedRowsIds.includes(item.evalTplIndRespId) && !item.supplierCompanyId)
    );
    dispatch({
      type: 'evaluationTemplate/updateState',
      payload: {
        permissionsList: [...dataSource, ...newList],
      },
    });
    this.handleAssignSuppliers();
  }

  addScorerDs = new DataSet({
    fields: [
      {
        name: 'addScorer', // 新增评分人
        type: 'object',
        multiple: true,
        noCache: true,
        ignore: 'always',
        lovCode: 'SSLM.KPI_CHOOSE_USER',
        lovPara: { tenantId: organizationId },
      },
    ],
  });

  // 批量新增评分人
  @Bind()
  handleBatchAdd(records) {
    const {
      dispatch,
      evaluationTemplate: { permissionsList = [] },
    } = this.props;
    const newList = records.map(record => {
      const item = record.toData();
      const { userId, userName, loginName, ...others } = item;
      return {
        ...others,
        respUserId: userId,
        respUserName: userName,
        respLoginName: loginName,
        _status: 'create',
        evalTplIndRespId: uuidv4(),
      };
    });
    dispatch({
      type: 'evaluationTemplate/updateState',
      payload: {
        permissionsList: [...permissionsList, ...newList],
      },
    });
  }

  render() {
    const {
      visible,
      customizeTable,
      processing = {},
      indicationAssignStatus,
      indicatorRowDataSource: { evalTplType = '' } = {},
      averageFlag,
      detailPermissionCode,
      fetchList = () => {},
      evaluationTemplate: { supplierList, supplierPagination, supplierClassifyList },
      queryClassifyLoading,
      querySupplierLoading,
    } = this.props;
    const { radioValue, selectedRowKeys, selectedRows, classifyVisible } = this.state;

    const title = intl.get('sslm.supplierKpiIndicator.view.title.indicationAssign').d('细项权限');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 700,
      zIndex: 500,
    };

    const listProps = {
      ref: node => {
        this.list = node;
      },
      add: this.add,
      update: this.update,
      radioValue,
      customizeTable,
      detailPermissionCode,
      loading: processing.queryIndicatorsResponsibleListLoading,
      defaultTableRowKey,
      indicationAssignStatus,
      averageFlag,
      handleSearch: this.handleSupplierSearch,
    };

    if (indicationAssignStatus === 'edit') {
      listProps.rowSelection = {
        onChange: this.selectedRows,
        selectedRowKeys,
        selectedRows,
      };
    }

    const multiSelectModalProps = {
      classifyVisible,
      supplierClassifyList,
      supplierList,
      supplierPagination,
      queryClassifyLoading,
      querySupplierLoading,
      onRef: node => {
        this.AssignCategoryModal = node;
      },
      onOk: this.handleOk,
      onCancel: this.handleAssignSuppliers,
      onSearch: this.handleSupplierSearch,
      onSelectChange: this.handleSelectChange,
    };

    return (
      <Drawer {...drawerProps}>
        <div style={{ marginBottom: 40 }}>
          {indicationAssignStatus === 'edit' && (
            <Fragment>
              <Row>
                <Col span={6}>
                  {intl
                    .get('sslm.supplierKpiIndicator.view.redio.respLabel')
                    .d('选择评分人打分维度')}
                  :
                </Col>
                <Col span={18}>
                  <RadioGroup onChange={this.onRadioChange} value={radioValue}>
                    <Radio value="RESP">
                      {intl.get('sslm.supplierKpiIndicator.view.radio.resp').d('评分人')}
                    </Radio>
                    {(evalTplType === 'GYSKP' || evalTplType === 'GYSKP_AUTO') && (
                      <Radio value="RESP_SUPPLIER">
                        {intl
                          .get('sslm.supplierKpiIndicator.view.radio.respsupplier')
                          .d('评分人+供应商')}
                      </Radio>
                    )}
                  </RadioGroup>
                </Col>
              </Row>
              <Search
                onSearch={fetchList}
                radioValue={radioValue}
                onWithParamsSearch={node => {
                  this.withParamsSearch = node;
                }}
              />
              <div style={{ paddingTop: 16, paddingBottom: 16, textAlign: 'right' }}>
                <CommonImport
                  businessObjectTemplateCode="SSLM.KPI_TPL_IND_RESP"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
                  successCallBack={() => {
                    fetchList();
                  }}
                  buttonProps={{
                    style: { marginRight: 8, marginTop: -3 },
                    permissionList: [
                      {
                        code: 'srm.partner.evaluation-template.evaluation-template.button.detail',
                        type: 'button',
                        meaning: '评分模板定义-细项权限弹窗(新)导入',
                      },
                    ],
                  }}
                />
                {radioValue === 'RESP_SUPPLIER' && (
                  <Button
                    style={{ marginRight: 8 }}
                    disabled={isEmpty(selectedRows)}
                    onClick={this.handleAssignSuppliers}
                  >
                    {intl
                      .get('sslm.supplierKpiIndicator.view.button.assignSuppliers')
                      .d('分配供应商')}
                  </Button>
                )}
                <Button
                  icon="delete"
                  onClick={this.deleteRow}
                  disabled={isEmpty(selectedRows)}
                  style={{ marginRight: 8 }}
                >
                  {intl
                    .get('sslm.supplierKpiIndicator.view.button.deleteEvalParticipant')
                    .d('移除评分人')}
                </Button>
                <Lov
                  mode="button"
                  name="addScorer"
                  clearButton={false}
                  color="primary"
                  dataSet={this.addScorerDs}
                  onBeforeSelect={this.handleBatchAdd}
                  modalProps={{
                    beforeOpen: () => {
                      const lovDs = this.addScorerDs
                        .getField('addScorer')
                        .getOptions(this.addScorerDs.current);
                      if (lovDs) {
                        lovDs.unSelectAll();
                        lovDs.clearCachedSelected();
                      }
                    },
                  }}
                >
                  <Icon
                    type="add"
                    style={{ fontSize: 14, marginRight: 5, marginTop: -2, fontWeight: 400 }}
                  />
                  {intl
                    .get('sslm.supplierKpiIndicator.view.button.addEvalParticipant')
                    .d('新增评分人')}
                </Lov>
              </div>
            </Fragment>
          )}
          <List {...listProps} />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button onClick={this.cancel} style={{ marginRight: 12 }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          {indicationAssignStatus === 'edit' && (
            <Button
              type="primary"
              loading={processing.insertOrUpdateIndicatorsLoading}
              disabled={processing.queryIndicatorsResponsibleListLoading}
              onClick={this.save}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          )}
        </div>
        <MultiSelectModal {...multiSelectModalProps} />
      </Drawer>
    );
  }
}
