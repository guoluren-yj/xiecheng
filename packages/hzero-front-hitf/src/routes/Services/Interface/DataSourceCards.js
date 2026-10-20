import React from 'react';
import {
  Form,
  TextField,
  DataSet,
  Select,
  Table,
  Lov,
  TextArea,
  Modal,
  CheckBox,
} from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNull, omit, isUndefined } from 'lodash';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/serviceLang';
import {
  fetchColumn,
  sqlParser,
  deleteAllAttr,
  deleteAllParam,
  batchSaveModel,
} from '@/services/servicesService';
import {
  STRING_LIST,
  NUMBER_LIST,
  DATE_LIST,
  DATETIME_LIST,
  EXECUTION_TYPE_CONSTANT,
  EXPR_TYPE_CONSTANTS,
} from '@/constants/constants';
import { mainConfigFormDS, attrListDS, paramListDS } from '@/stores/Services/interfaceDS';
import CollapsePanel from '@/components/CollapsePanel';

class DataSourceCards extends React.Component {
  constructor(props) {
    super(props);
    this.mainConfigFormDS = new DataSet(
      mainConfigFormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );

    this.attrListDS = new DataSet({
      ...attrListDS({
        onAttrLoad: this.handleFieldLoad,
        onFieldUpdate: this.handleAttrFieldUpdate,
      }),
    });

    this.readOnlyParamDS = new DataSet(paramListDS());

    this.queryParamListDS = new DataSet({
      ...paramListDS({
        onFieldUpdate: this.handleParamFieldUpdate,
      }),
    });

    this.updateParamListDS = new DataSet(paramListDS());

    this.deleteParamListDS = new DataSet(paramListDS());

    props.onRef(this);
    this.state = {
      exprType: undefined,
      // 'none', 'all', 'indeterminate'
      resultCheckFlag: 'none',
      // 'none', 'all', 'indeterminate'
      queryCheckFlag: 'none',
      // 'none', 'all', 'indeterminate'
      updateCheckFlag: 'none',
      // 'none', 'all', 'indeterminate'
      deleteCheckFlag: 'none',
      allowCheckQueryFlag: false,
      allowCheckUpdateFlag: false,
      allowCheckDeleteFlag: false,
      cachedQueryList: [],
      cachedUpdateList: [],
      cachedDeleteList: [],
    };
  }

  componentDidMount() {
    const { interfaceId } = this.props;
    if (interfaceId) {
      this._query();
    }
  }

  async _validate() {
    const validates = await Promise.all([
      this.mainConfigFormDS.validate(),
      this.attrListDS.validate(),
      this.queryParamListDS.validate(),
    ]);
    if (validates.includes(false)) {
      return false;
    }
    return true;
  }

  @Bind()
  _toData() {
    const { executionType, ...others } = omit(this.mainConfigFormDS.current.toData(), [
      'dataSourceLov',
    ]);
    const mainConfigData = {
      ...others,
      executionType: executionType.toString(),
    };
    return mainConfigData;
  }

  @Bind()
  _query(id) {
    const { interfaceId } = this.props;
    this.resetDataSet();
    this.mainConfigFormDS.setQueryParameter('interfaceId', id || interfaceId);
    return this.mainConfigFormDS.query().then((res) => {
      if (res) {
        const { modelId, exprType, exprContent, executionType } = res;
        const executionTypes = executionType.split(',');
        const allowCheckQueryFlag = executionTypes.includes(EXECUTION_TYPE_CONSTANT.SELECT);
        const allowCheckUpdateFlag = executionTypes.includes(EXECUTION_TYPE_CONSTANT.UPDATE);
        const allowCheckDeleteFlag = executionTypes.includes(EXECUTION_TYPE_CONSTANT.DELETE);
        this.mainConfigFormDS.current.set('executionType', executionTypes);
        this.attrListDS.setQueryParameter('modelId', modelId);
        this.readOnlyParamDS.setQueryParameter('modelId', modelId);
        this.queryParamListDS
          .getField('operatorCode')
          .set('required', exprType === EXPR_TYPE_CONSTANTS.DBO);
        this.updateParamListDS
          .getField('operatorCode')
          .set('required', exprType === EXPR_TYPE_CONSTANTS.DBO);
        this.deleteParamListDS
          .getField('operatorCode')
          .set('required', exprType === EXPR_TYPE_CONSTANTS.DBO);
        Promise.all([this.attrListDS.query(), this.readOnlyParamDS.query()]).then((results) => {
          if (results) {
            this.queryParamListDS.getField('fieldObj').set('options', this.attrListDS);
            const paramList = (results[1] || {}).content || [];
            const queryParamList = paramList.filter(
              (param) => param.paramCategory === EXECUTION_TYPE_CONSTANT.SELECT
            );
            const updateParamList = paramList.filter(
              (param) => param.paramCategory === EXECUTION_TYPE_CONSTANT.UPDATE
            );
            const deleteParamList = paramList.filter(
              (param) => param.paramCategory === EXECUTION_TYPE_CONSTANT.DELETE
            );
            // 为了解决autoQueryAfterSubmit设置为false，ds.delete如果不重新掉接口，删除记录仍然展示在页面的问题
            queryParamList.forEach((data) => this.queryParamListDS.create(data));
            updateParamList.forEach((data) => this.updateParamListDS.create(data));
            deleteParamList.forEach((data) => this.deleteParamListDS.create(data));
            this.setState({
              resultCheckFlag: this.handleGetCheckFlag('resultFlag'),
              queryCheckFlag: this.handleGetCheckFlag('queryFlag'),
              updateCheckFlag: this.handleGetCheckFlag('updateFlag'),
              deleteCheckFlag: this.handleGetCheckFlag('deleteFlag'),
            });
          }
        });
        this.setState({
          exprType,
          allowCheckQueryFlag,
          allowCheckUpdateFlag,
          allowCheckDeleteFlag,
          showSqlBtn: isEmpty(exprContent),
        });
      }
    });
  }

  @Bind()
  async _saveAttrAndParam({ tenantId, modelId }) {
    const { cachedQueryList, cachedUpdateList, cachedDeleteList } = this.state;
    const modelFields = this.attrListDS.toData().map((item) => ({ ...item, tenantId, modelId }));
    const queryParams = this.queryParamListDS
      .toData()
      .map((item) => ({ ...item, tenantId, modelId }));
    const updateParams = this.updateParamListDS
      .toData()
      .map((item) => ({ ...item, tenantId, modelId }));
    const deleteParams = this.deleteParamListDS
      .toData()
      .map((item) => ({ ...item, tenantId, modelId }));

    return batchSaveModel({
      modelFields,
      queryParams: [...queryParams, ...cachedQueryList],
      updateParams: [...updateParams, ...cachedUpdateList],
      deleteParams: [...deleteParams, ...cachedDeleteList],
    }).then((result) => {
      if (getResponse(result)) {
        this.setState({ cachedQueryList: [], cachedUpdateList: [], cachedDeleteList: [] });
        return true;
      } else {
        return false;
      }
    });
  }

  @Bind()
  handleFieldUpdate({ name, value, oldValue, record }) {
    if (name === 'dataSourceLov') {
      record.init('exprContent', null);
    }
    if (name === 'exprType') {
      record.init('exprContent', null);
      if (value === EXPR_TYPE_CONSTANTS.SQL) {
        record.set('executionType', [EXECUTION_TYPE_CONSTANT.SELECT]);
      }
      this.setState({
        exprType: value,
        showSqlBtn: true,
      });
    }
    if (name === 'exprContent') {
      const { exprType } = record.toData();
      if (exprType === EXPR_TYPE_CONSTANTS.DBO) {
        this.handleTableChange(value, oldValue, record);
      } else if (exprType === EXPR_TYPE_CONSTANTS.SQL) {
        this.setState({
          showSqlBtn: isEmpty(record.get('exprContent')),
        });
      }
    }
    if (name === 'executionType') {
      const allowCheckQueryFlag = value.includes(EXECUTION_TYPE_CONSTANT.SELECT);
      const allowCheckUpdateFlag = value.includes(EXECUTION_TYPE_CONSTANT.UPDATE);
      const allowCheckDeleteFlag = value.includes(EXECUTION_TYPE_CONSTANT.DELETE);
      if (!allowCheckQueryFlag) {
        this.toggleSelectAllAttr(allowCheckQueryFlag, 'queryCheckFlag', 'queryFlag');
      }
      if (!allowCheckUpdateFlag) {
        this.toggleSelectAllAttr(allowCheckUpdateFlag, 'updateCheckFlag', 'updateFlag');
      }
      if (!allowCheckDeleteFlag) {
        this.toggleSelectAllAttr(allowCheckDeleteFlag, 'deleteCheckFlag', 'deleteFlag');
      }
      this.setState({
        allowCheckQueryFlag,
        allowCheckUpdateFlag,
        allowCheckDeleteFlag,
      });
    }
  }

  @Bind()
  handleAttrFieldUpdate({ name, value, record }) {
    if (name === 'queryFlag') {
      if (value) {
        this.handleCreateParamRecord(
          record,
          EXECUTION_TYPE_CONSTANT.SELECT,
          this.queryParamListDS,
          'cachedQueryList'
        );
      } else {
        this.handleDeleteParamRecord(record, this.queryParamListDS, 'cachedQueryList');
      }
      this.setState({ queryCheckFlag: this.handleGetCheckFlag(name) });
    }
    if (name === 'updateFlag') {
      if (value) {
        this.handleCreateParamRecord(
          record,
          EXECUTION_TYPE_CONSTANT.UPDATE,
          this.updateParamListDS,
          'cachedUpdateList'
        );
      } else {
        this.handleDeleteParamRecord(record, this.updateParamListDS, 'cachedUpdateList');
      }
      this.setState({ updateCheckFlag: this.handleGetCheckFlag(name) });
    }
    if (name === 'deleteFlag') {
      if (value) {
        this.handleCreateParamRecord(
          record,
          EXECUTION_TYPE_CONSTANT.DELETE,
          this.deleteParamListDS,
          'cachedDeleteList'
        );
      } else {
        this.handleDeleteParamRecord(record, this.deleteParamListDS, 'cachedDeleteList');
      }
      this.setState({ deleteCheckFlag: this.handleGetCheckFlag(name) });
    }
  }

  @Bind()
  handleParamFieldUpdate({ name, value, oldValue, record }) {
    if (name === 'fieldObj') {
      const { fieldType, fieldName } = value;
      const paramType = this.handleTypeTransfer(fieldType);
      record.set('paramType', paramType);
      record.set('paramName', isNull(value) ? '' : fieldName);
      this.attrListDS
        .find((tempRecord) => tempRecord.get('fieldName') === fieldName)
        .init('queryFlag', true);
      this.attrListDS
        .find((tempRecord) => tempRecord.get('fieldName') === oldValue.fieldName)
        .init('queryFlag', false);
    }
  }

  /**
   * 获取属性列表中设为查询参数、设为更新标识、设为删除标识中的勾选状态
   */
  handleGetCheckFlag(filterName) {
    let checkFlag = 'none';
    if (this.attrListDS.length > 0) {
      const selectedLength = this.attrListDS.filter((tempRecord) => tempRecord.get(filterName))
        .length;
      if (selectedLength > 0 && selectedLength < this.attrListDS.length) {
        checkFlag = 'indeterminate';
      } else if (selectedLength === this.attrListDS.length) {
        checkFlag = 'all';
      }
    }
    return checkFlag;
  }

  /**
   * 属性列表，勾选时创建一条参数信息
   */
  @Bind()
  handleCreateParamRecord(attrRecord, paramCategory, dataSet, cachedDeleteStateName) {
    const attrData = omit(attrRecord.toData(), [
      'creationDate',
      'createdBy',
      'lastUpdateDate',
      'lastUpdatedBy',
      'objectVersionNumber',
      '_token',
    ]);
    const cachedDeletes = this.state[cachedDeleteStateName];
    const { fieldName, fieldType } = attrData;
    let paramData = {
      ...attrData,
      paramCategory,
      paramName: fieldName,
      paramType: this.handleTypeTransfer(fieldType),
      requiredFlag: false,
    };
    const existDeleteItem = cachedDeletes.find((item) => item.paramName === fieldName);
    if (existDeleteItem) {
      paramData = omit(existDeleteItem, ['deleteCandidate']);
      const temps = cachedDeletes.filter((item) => item.paramName !== fieldName);
      this.setState({ [cachedDeleteStateName]: temps });
    }
    const paramRecord = dataSet.create(paramData);
    paramRecord.set('seqNum', paramRecord.index + 1);
  }

  /**
   * 属性列表：取消勾选时删除关联的参数信息
   */
  @Bind()
  handleDeleteParamRecord(attrRecord, dataSet, cachedDeleteStateName) {
    const cachedDeletes = this.state[cachedDeleteStateName];
    const deletedRecords = dataSet.records.filter(
      (record) => record.get('fieldName') === attrRecord.get('fieldName')
    );
    deletedRecords.forEach((record) => {
      if (
        record.get('paramId') &&
        !cachedDeletes.find((item) => item.paramId === record.get('paramId'))
      ) {
        cachedDeletes.push({ ...record.toData(), deleteCandidate: true });
      }
    });
    dataSet.delete(deletedRecords, false);
    this.setState({ [cachedDeleteStateName]: cachedDeletes });
  }

  /**
   * 设为查询参数、设为更新标识、设为删除标识
   * @param {boolean} val 是否勾选：true/false
   * @param {string} checkFlagName 对应state中checkFlag的名字：queryCheckFlag/updateCheckFlag/deleteCheckFlag
   * @param {string} checkFieldName 对应勾选的字段名称：queryIdentifyFlag/updateFlag/deleteFlag
   */
  toggleSelectAllAttr(val, checkFlagName, checkFieldName) {
    if (val) {
      this.attrListDS
        .filter((record) => !record.get(checkFieldName))
        .forEach((record) => {
          record.set(checkFieldName, true);
        });
    } else {
      this.attrListDS
        .filter((record) => record.get(checkFieldName))
        .forEach((record) => {
          record.set(checkFieldName, false);
        });
    }
    this.setState({ [checkFlagName]: val ? 'all' : 'none' });
  }

  /**
   * 类型转换
   */
  handleTypeTransfer(type) {
    if (STRING_LIST.includes(type)) {
      return 'STRING';
    }
    if (NUMBER_LIST.includes(type)) {
      return 'NUMBER';
    }
    if (DATE_LIST.includes(type)) {
      return 'DATE';
    }
    if (DATETIME_LIST.includes(type)) {
      return 'DATETIME';
    }
  }

  @Bind()
  async queryColumns(params) {
    const response = await fetchColumn(params);
    if (getResponse(response)) {
      return response.map((item) => ({
        fieldName: item.fieldName,
        seqNum: item.seqNum,
        fieldDesc: item.fieldDesc,
        fieldType: item.fieldType,
        fieldExpr: `$${item.seqNum}`,
        requiredFlag: false,
      }));
    }
  }

  /*
   * 解析sql
   */
  @Bind()
  async handleSqlAnalysis() {
    let confirm = 'ok';
    if (this.attrListDS.length > 0 || this.queryParamListDS.length > 0) {
      confirm = await Modal.confirm({
        title: getLang('ANALYSIS_SQL'),
        children: <p>{getLang('ANALYSIS')}</p>,
      });
    }
    if (confirm === 'ok') {
      this.deleteAllAttrAndParam();
      const sql = this.mainConfigFormDS.current.get('exprContent');
      if (!isNull(sql)) {
        this.setState({ sqlLoading: true });
        const response = await sqlParser({ exprContent: sql });
        this.setState({ sqlLoading: false });
        if (getResponse(response)) {
          const { modelField = [], requestParam = [] } = response;
          notification.success();
          this.resetDataSet();
          modelField.forEach((item) => {
            this.attrListDS.create(item);
          });
          this.queryParamListDS.getField('fieldObj').set('options', this.attrListDS);
          requestParam.forEach((item) => {
            const paramRecord = this.queryParamListDS.create(item);
            paramRecord.set('seqNum', paramRecord.index + 1);
          });
        }
      } else {
        notification.error({
          message: getLang('SQL_ERROR'),
        });
      }
    }
    return false;
  }

  @Bind()
  resetDataSet() {
    this.attrListDS.reset();
    this.attrListDS.loadData([]);
    this.queryParamListDS.reset();
    this.queryParamListDS.loadData([]);
    this.updateParamListDS.reset();
    this.updateParamListDS.loadData([]);
    this.deleteParamListDS.reset();
    this.deleteParamListDS.loadData([]);
  }

  /**
   * 表或视图切换
   */
  @Bind()
  async handleTableChange(value, oldValue, record) {
    const { datasourceId, datasourceCode, dsPurposeCode } = record.toData();
    let confirm = 'ok';
    if (this.attrListDS.length > 0 || this.queryParamListDS.length > 0) {
      confirm = await Modal.confirm({
        title: getLang('CHANGE_TABLE'),
        children: <p>{getLang('CHANGE_VIEW')}</p>,
      });
    }
    if (confirm === 'ok') {
      this.deleteAllAttrAndParam();
      if (!isNull(value)) {
        this.queryColumns({ datasourceId, datasourceCode, dsPurposeCode, table: value }).then(
          (res) => {
            if (res) {
              this.resetDataSet();
              res.forEach((item) => {
                this.attrListDS.create(item);
              });
              this.queryParamListDS.getField('fieldObj').set('options', this.attrListDS);
            }
          }
        );
      }
    } else {
      this.mainConfigFormDS.current.set('exprContent', oldValue);
    }
  }

  /**
   * 删除所有的属性列表和参数列表
   */
  deleteAllAttrAndParam() {
    const modelId = this.mainConfigFormDS.current.get('modelId');
    if (modelId) {
      deleteAllAttr({ modelId });
      deleteAllParam({ modelId });
    }
  }

  @Bind()
  handleFieldOptionFilter(record) {
    const existFieldName = this.queryParamListDS.toData().map((item) => item.fieldName);
    return !existFieldName.includes(record.get('fieldName'));
  }

  @Bind()
  getAttrColumns() {
    const { disabledFlag } = this.props;
    const {
      resultCheckFlag,
      queryCheckFlag,
      updateCheckFlag,
      deleteCheckFlag,
      allowCheckQueryFlag,
      allowCheckUpdateFlag,
      allowCheckDeleteFlag,
      exprType,
    } = this.state;
    const editable = !disabledFlag;
    return [
      {
        name: 'resultFlag',
        width: 160,
        editor: editable,
        header: () => (
          <>
            <CheckBox
              disabled={!editable}
              indeterminate={resultCheckFlag === 'indeterminate'}
              checked={resultCheckFlag === 'all'}
              onChange={(val) => this.toggleSelectAllAttr(val, 'resultCheckFlag', 'resultFlag')}
            >
              {getLang('RESULT_FLAG')}
            </CheckBox>
          </>
        ),
      },
      {
        name: 'queryFlag',
        width: 180,
        editor: editable && allowCheckQueryFlag,
        header: () => (
          <>
            <CheckBox
              disabled={!(editable && allowCheckQueryFlag)}
              indeterminate={queryCheckFlag === 'indeterminate'}
              checked={queryCheckFlag === 'all'}
              onChange={(val) => this.toggleSelectAllAttr(val, 'queryCheckFlag', 'queryFlag')}
            >
              {getLang('QUERY_FLAG')}
            </CheckBox>
          </>
        ),
      },
      {
        name: 'updateFlag',
        width: 180,
        editor: editable && allowCheckUpdateFlag,
        hidden: exprType === EXPR_TYPE_CONSTANTS.SQL,
        header: () => (
          <>
            <CheckBox
              disabled={!(editable && allowCheckUpdateFlag)}
              indeterminate={updateCheckFlag === 'indeterminate'}
              checked={updateCheckFlag === 'all'}
              onChange={(val) => this.toggleSelectAllAttr(val, 'updateCheckFlag', 'updateFlag')}
            >
              {getLang('UPDATE_FLAG')}
            </CheckBox>
          </>
        ),
      },
      {
        name: 'deleteFlag',
        width: 180,
        editor: editable && allowCheckDeleteFlag,
        hidden: exprType === EXPR_TYPE_CONSTANTS.SQL,
        header: () => (
          <>
            <CheckBox
              disabled={!(editable && allowCheckDeleteFlag)}
              indeterminate={deleteCheckFlag === 'indeterminate'}
              checked={deleteCheckFlag === 'all'}
              onChange={(val) => this.toggleSelectAllAttr(val, 'deleteCheckFlag', 'deleteFlag')}
            >
              {getLang('DELETE_FLAG')}
            </CheckBox>
          </>
        ),
      },
      {
        name: 'fieldName',
        width: 150,
      },
      {
        name: 'fieldType',
        width: 150,
        editor: editable,
      },
      {
        name: 'fieldDesc',
        editor: editable,
        width: 180,
      },
    ];
  }

  @Bind
  getParamColumns(type) {
    const { disabledFlag } = this.props;
    const editable = !disabledFlag;
    const columns = [
      {
        name: 'paramName',
        width: 160,
        editor: editable && <TextField />,
        lock: 'left',
      },
      {
        name: 'paramType',
        width: 150,
        editor: editable,
      },
      {
        name: 'operatorCode',
        width: 120,
        editor: editable,
      },
      {
        name: 'fieldObj',
        width: 150,
        editor: editable && type === 'query' && (
          <Select optionsFilter={this.handleFieldOptionFilter} />
        ),
      },
      {
        name: 'requiredFlag',
        width: 100,
        editor: editable,
      },
      {
        name: 'paramDesc',
        width: 180,
        editor: editable,
      },
      {
        name: 'defaultValue',
        width: 120,
        editor: editable,
      },
    ];
    return columns;
  }

  render() {
    const { disabledFlag, isHistory, path, interfaceId } = this.props;
    const { exprType, sqlLoading, showSqlBtn } = this.state;
    const isNew = isUndefined(interfaceId);
    return (
      <CollapsePanel
        key="mainCollapse"
        eles={[
          {
            key: 'MAIN_CONFIG',
            title: getLang('MAIN_CONFIG'),
            ele: (
              <>
                <Form
                  dataSet={this.mainConfigFormDS}
                  columns={2}
                  labelWidth={130}
                  disabled={disabledFlag || isHistory}
                >
                  <Lov name="dataSourceLov" disabled={!isNew} />
                  <Select name="dsType" disabled />
                  <Select name="exprType" disabled={!isNew} />
                  <TextField name="remark" />
                  {exprType === EXPR_TYPE_CONSTANTS.DBO && (
                    <Select name="exprContent" disabled={!isNew} />
                  )}
                  <Select name="executionType" />
                  {exprType === EXPR_TYPE_CONSTANTS.SQL && (
                    <TextArea
                      newLine
                      name="exprContent"
                      resize="vertical"
                      colSpan={2}
                      rows={12}
                      label={getLang('SQL')}
                      help={getLang('SQL_EXTRA')}
                    />
                  )}
                </Form>
                {exprType === EXPR_TYPE_CONSTANTS.SQL && !disabledFlag && (
                  <Row>
                    <Col push={3} span={3} style={{ marginLeft: 10 }}>
                      <ButtonPermission
                        permissionList={[
                          {
                            code: `${path}.button.analysis`,
                            type: 'button',
                            meaning: '服务注册-接口配置-解析',
                          },
                        ]}
                        type="c7n-pro"
                        color="primary"
                        loading={sqlLoading}
                        onClick={() => this.handleSqlAnalysis()}
                        disabled={showSqlBtn || isHistory}
                      >
                        {getLang('BUTTON_ANALYSIS')}
                      </ButtonPermission>
                    </Col>
                  </Row>
                )}
                <CollapsePanel
                  key="attrCollapse"
                  eles={[
                    {
                      key: 'ATTR_LIST',
                      title: getLang('ATTR_LIST'),
                      ele: <Table dataSet={this.attrListDS} columns={this.getAttrColumns()} />,
                    },
                    {
                      key: 'QUERY_PARAM_LIST',
                      title: getLang('QUERY_PARAM_LIST'),
                      ele: (
                        <Table
                          dataSet={this.queryParamListDS}
                          columns={this.getParamColumns('query')}
                        />
                      ),
                    },
                    {
                      key: 'UPDATE_PARAM_LIST',
                      title: getLang('UPDATE_PARAM_LIST'),
                      hidden: exprType === EXPR_TYPE_CONSTANTS.SQL,
                      ele: (
                        <Table
                          dataSet={this.updateParamListDS}
                          columns={this.getParamColumns('update')}
                        />
                      ),
                    },
                    {
                      key: 'DELETE_PARAM_LIST',
                      title: getLang('DELETE_PARAM_LIST'),
                      hidden: exprType === EXPR_TYPE_CONSTANTS.SQL,
                      ele: (
                        <Table
                          dataSet={this.deleteParamListDS}
                          columns={this.getParamColumns('delete')}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
    );
  }
}
export default DataSourceCards;
