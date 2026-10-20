import React, { Component, Fragment } from 'react';
import { DataSet, Lov as C7NLov } from 'choerodon-ui/pro';
import { Modal, Button, Row, Col, Form, Input, InputNumber, Tooltip, Icon } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import { sum, isNumber, isEmpty, isNil, throttle, forEach } from 'lodash';
import intl from 'utils/intl';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import { getAddScorerDS } from './stores/getAddScorerDS';
import './styles.less';

const organizationId = getCurrentOrganizationId();

/**
 *考评档案管理各个 modal 组件
 *
 * @export
 * @class DetailModal
 * @extends {Component} - React.element
 * @reactProps {boolean} visible - modal 是否可以
 * @reactProps {object} modalData - modal 中表格的数据源
 * @reactProps {object} pagination - modal 中表格的分页数据
 * @reactProps {function} onLoad - 加载 modal 中的数据的方法
 * @reactProps {function} onClose - 关闭 modal 的方法
 * @returns React.element
 */
@formatterCollections({
  code: ['sslm.supplierDocManage', 'sslm.common'],
})
export default class DetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      rowKey: null,
      columns: [],
      selectedRows: [],
      dataSource: [],
      addDataCount: 0,
      isSaved: false,
      operateLoading: false,
    };
  }

  /**
   *react 组件更新
   * @memberof DetailModal
   */
  componentDidUpdate(prevProps) {
    const { modalCode = '', onLoad, visible } = this.props;
    if (!prevProps.visible && visible) {
      onLoad(modalCode).then(() => {
        this.setModalProps(modalCode);
      });
    }
  }

  setModalProps = (modalCode = '') => {
    const {
      modalData = [],
      docStatus,
      isPub,
      basicInfo = {},
      openParamVauleModal = () => {},
      averageFlag,
      docManageRemote,
      granularityList,
      popType,
    } = this.props;
    const { checkDetailFlag = false, weightedFlag } = basicInfo;
    const { indicatorType } = granularityList || {};
    let dataSource = [];
    const rowKeyObj = {
      evaluationPerson: 'evalDtlRespId',
      evaluationStatus: 'evalDtlRespId',
      sumScore: 'evalDtlId',
      productName: 'itemId',
      viewLog: 'evalOprHistoryId',
    };
    const titleObj = {
      evaluationPerson: (
        <Fragment>
          {intl
            .get(`sslm.supplierDocManage.model.docManage.evaluationPersonTitle`)
            .d('维护评分人信息')}
        </Fragment>
      ),
      evaluationStatus: intl
        .get(`sslm.supplierDocManage.model.docManage.evaluationStatusTitle`)
        .d('评分完成情况'),
      sumScore: intl.get(`sslm.supplierDocManage.model.evalDocManage.scoreDetail`).d('评分明细'),
      productName: intl
        .get(`sslm.supplierDocManage.model.docManage.productDetailTitle`)
        .d('采购品类明细'),
      viewLog: intl.get(`sslm.supplierDocManage.model.docManage.activityLog`).d('操作记录'),
    };
    const colsObj = {
      evaluationPerson: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreUser`).d('评分用户'),
          dataIndex: 'loginName',
          width: 120,
          render: (val, record) => {
            if (!isPub && (record._status === 'update' || record._status === 'create')) {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`loginName`, {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.supplierDocManage.model.docManage.scoreUser`)
                            .d('评分用户'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      textValue={record.loginName}
                      code="SSLM.KPI_CHOOSE_USER"
                      queryParams={{ tenantId: organizationId }}
                      lovOptions={{ displayField: 'loginName' }}
                      onChange={(lovValue, lovRecord) =>
                        this.handleLovChange(lovValue, lovRecord, record)
                      }
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.loginName;
            }
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.userName`).d('评分用户描述'),
          dataIndex: 'userName',
          onCell: this.onCell,
          width: 120,
          render: (val, record) => {
            if (!isPub && (record._status === 'update' || record._status === 'create')) {
              return (
                <Fragment>
                  <Form.Item style={{ display: 'none' }}>
                    {record.$form.getFieldDecorator('respUserId', {
                      initialValue: record.respUserId,
                    })(<div />)}
                  </Form.Item>
                  <Form.Item>
                    {record.$form.getFieldDecorator(`userName`, {
                      initialValue: val,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sslm.supplierDocManage.model.docManage.userName`)
                              .d('评分用户描述'),
                          }),
                        },
                        {
                          max: 100,
                          message: intl.get('hzero.common.validation.max', {
                            max: 100,
                          }),
                        },
                      ],
                    })(<Input disabled />)}
                  </Form.Item>
                </Fragment>
              );
            } else {
              return record.userName;
            }
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.department`).d('部门'),
          dataIndex: 'userDepartment',
          width: 80,
          render: (val, record) => {
            if (!isPub && (record._status === 'update' || record._status === 'create')) {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`userDepartment`, {
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
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
          dataIndex: 'respWeight',
          width: 80,
          render: (val, record) => {
            if (!isPub && (record._status === 'update' || record._status === 'create')) {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`respWeight`, {
                    initialValue: val,
                    rules: [
                      {
                        required: !averageFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.supplierDocManage.model.docManage.scoreWeight`)
                            .d('权重'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.01}
                      precision={2}
                      disabled={averageFlag}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.respWeight;
            }
          },
        },
      ],
      evaluationStatus: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.loginName`).d('评分人账户'),
          dataIndex: 'loginName',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.graderDesc`).d('评分人描述'),
          dataIndex: 'userName',
          onCell: this.onCell,
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.completeFlag`).d('评分状态'),
          dataIndex: 'completeFlagMeaning',
          onCell: this.onCell,
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeightPrec`).d('权重%'),
          dataIndex: 'respWeight',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.defaultScore`).d('缺省分值'),
          dataIndex: 'defaultScore',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.isStandard`).d('符合评分标准'),
          dataIndex: 'isStandard',
          width: 120,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : yesOrNoRender(val);
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.isVeto`).d('否决该项'),
          dataIndex: 'isVeto',
          width: 100,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : yesOrNoRender(val);
          },
        },
        {
          title: intl.get('sslm.supplierDocManage.model.archiveFilled.indOptName').d('评分选项'),
          dataIndex: 'indOptName',
          width: 100,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : val;
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
          dataIndex: 'score',
          width: 80,
          render: (val, record) => {
            const { completeFlag } = record;
            // 否决项不展示得分
            return completeFlag !== 1 || indicatorType === 'VETO' ? '-' : val;
          },
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.respWeightScore`)
            .d('评分人权重得分'),
          dataIndex: 'respWeightScore',
          width: 130,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : val;
          },
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.feedbackDescription`)
            .d('反馈备注'),
          dataIndex: 'feedback',
          width: 100,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : val;
          },
        },
        {
          width: 120,
          dataIndex: 'scorerAttachmentUuid',
          title: intl.get('sslm.common.model.attachment.upload').d('附件上传'),
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? (
              ''
            ) : (
              <Upload viewOnly bucketName={PRIVATE_BUCKET} attachmentUUID={val} filePreview />
            );
          },
        },
      ],
      sumScore: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
          dataIndex: 'indicatorCode',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
          dataIndex: 'indicatorName',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.benchmarkScore`).d('基准分值'),
          dataIndex: 'benchmarkScore',
          width: 120,
          render: (value, record) => (record.parentId === -1 ? value : ''),
        },
        weightedFlag && {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evalWeight`).d('指标权重%'),
          dataIndex: 'evalWeight',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreFrom`).d('分值从'),
          dataIndex: 'scoreFrom',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreTo`).d('分值至'),
          dataIndex: 'scoreTo',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreType`).d('评分方式'),
          dataIndex: 'scoreTypeMeaning',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorType`).d('指标类型'),
          dataIndex: 'indicatorTypeMeaning',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.vetoFlag`).d('否决项'),
          dataIndex: 'vetoFlag',
          width: 100,
          render: yesOrNoRender,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStatus`).d('评分状态'),
          dataIndex: 'completeFlag',
          width: 120,
          render: (val, record) => {
            if (docStatus === 'NEW') {
              return intl.get(`sslm.supplierDocManage.model.docManage.unScore`).d('尚未进行评分');
            }
            if (record.scoreType === 'SYSTEM') {
              return (
                <a onClick={() => openParamVauleModal(record)}>{record.processStatusMeaning}</a>
              );
            } else {
              return record.completeFlagMeaning || val;
            }
          },
        },
        {
          title: intl.get('sslm.supplierDocManage.model.docManage.processRemark').d('系统计算说明'),
          dataIndex: 'processRemark',
          width: 130,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
          dataIndex: 'finalScore',
          width: 80,
          render: (val, record) => {
            const {
              kpiEvalTplIndRemind,
              checkDetailScore,
              indicatorType: recordIndicatorType,
            } = record;
            const { remindDesc } = kpiEvalTplIndRemind || {};
            const showTipFlag = isNil(checkDetailScore);
            const showIcon = !isNil(val) && !isEmpty(kpiEvalTplIndRemind);
            return [
              'FINAL_COLLECTED',
              'PUBLISHED',
              'APPROVING',
              'COMPLETED',
              'APPEALING',
              'PARTIAL_PUBLISHED',
              'REJECTED',
            ].includes(docStatus) ? (
              checkDetailFlag && !showTipFlag ? (
                recordIndicatorType === 'VETO' ? (
                  '-'
                ) : (
                  val
                )
              ) : (
                <Tooltip title={isEmpty(kpiEvalTplIndRemind) ? '' : remindDesc}>
                  <span style={isEmpty(kpiEvalTplIndRemind) ? {} : { color: '#F05434' }}>
                    {recordIndicatorType === 'VETO' ? '-' : val}
                  </span>
                  {showIcon && (
                    <Icon
                      style={{ margin: '10px 5px', color: '#F05434' }}
                      type="exclamation-circle"
                    />
                  )}
                </Tooltip>
              )
            ) : null;
          },
        },
        weightedFlag && {
          title: intl
            .get('sslm.supplierDocManage.model.docManage.evalWeightScore')
            .d('指标权重得分'),
          dataIndex: 'evalWeightScore',
          width: 130,
        },
      ].filter(Boolean),
      productName: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.itemCode`).d('物品编码'),
          dataIndex: 'itemCode',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.productName`).d('物品名称'),
          dataIndex: 'itemName',
          width: 120,
        },
      ],
      viewLog: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.activityPerson`).d('操作人'),
          dataIndex: 'operatedName',
          width: 150,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.activityTime`).d('操作时间'),
          dataIndex: 'operatedDate',
          width: 170,
          render: dateTimeRender,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          dataIndex: 'operationCodeMeaning',
          width: 150,
        },
        {
          title: intl.get('sslm.common.model.operate.remark').d('操作说明'),
          dataIndex: 'operatedRemark',
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        },
      ],
    };
    if (checkDetailFlag) {
      colsObj.sumScore.push({
        title: intl
          .get(`sslm.supplierDocManage.model.docManage.checkDetailScore`)
          .d('校准明细得分'),
        dataIndex: 'checkDetailScore',
        width: 170,
        render: (val, record) => {
          const { kpiEvalTplIndRemind } = record;
          const { remindDesc } = kpiEvalTplIndRemind || {};
          const showTipFlag = !isNil(val);
          const showIcon = showTipFlag && !isEmpty(kpiEvalTplIndRemind);
          return showTipFlag ? (
            <Tooltip title={isEmpty(kpiEvalTplIndRemind) ? '' : remindDesc}>
              <span style={isEmpty(kpiEvalTplIndRemind) ? {} : { color: '#F05434' }}>{val}</span>
              {showIcon && (
                <Icon style={{ margin: '10px 5px', color: '#F05434' }} type="exclamation-circle" />
              )}
            </Tooltip>
          ) : (
            val
          );
        },
      });
    }
    if (modalCode === 'evaluationPerson' && docStatus === 'NEW') {
      dataSource = modalData.map(item => ({ ...item, _status: 'update' }));
    } else if (modalCode === 'sumScore') {
      const filterParent = (data = []) => {
        return data.map(n => {
          const d = n;
          if (!d.leafFlag) {
            d.scoreTypeMeaning = null;
          }
          if (Array.isArray(d.children)) {
            d.children = filterParent(d.children);
          }
          return d;
        });
      };
      dataSource = filterParent(modalData);
    } else {
      dataSource = modalData;
    }

    // 供应商申诉情况弹窗columns埋点
    if (docManageRemote) {
      const sumScoreProps = {
        modalCode,
        dataSource,
        rowKey: rowKeyObj[modalCode],
        that: this,
        popType,
      };
      const remoteColumns =
        docManageRemote.process('SSLM.EVALUATION_DOC_MANAGE_SUM_SCORE_ROW', [], sumScoreProps) ||
        [];
      if (!isEmpty(remoteColumns)) {
        forEach(remoteColumns, column => {
          colsObj[modalCode].push(column);
        });
      }
    }

    this.setState({
      title: titleObj[modalCode] || null,
      rowKey: rowKeyObj[modalCode] || null,
      columns: colsObj[modalCode] || null,
      dataSource,
    });
  };

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 120,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   *表格的操作按钮或表格信息
   *
   * @memberof DetailModal
   */
  getHead = () => {
    const { selectedRows, operateLoading } = this.state;
    const {
      modalCode,
      productInfo = {},
      docStatus,
      granularity,
      granularityList,
      isPub,
    } = this.props;
    if (modalCode === 'evaluationPerson') {
      const addScorerDs = new DataSet(getAddScorerDS());
      return (
        <div style={{ textAlign: 'right', margin: '-8px 0 16px' }}>
          {!isPub && (
            <Fragment>
              <Button
                onClick={this.handleDeleteEvaluationPerson}
                style={{ marginRight: 8 }}
                loading={operateLoading}
                disabled={!(docStatus === 'NEW' && !!selectedRows.length)}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button
                loading={operateLoading}
                onClick={this.handleSaveEvaluationPerson}
                style={{ marginRight: 8 }}
                disabled={docStatus !== 'NEW'}
              >
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
              <C7NLov
                multiple
                mode="button"
                name="addScorer"
                color="primary"
                clearButton={false}
                dataSet={addScorerDs}
                loading={operateLoading}
                disabled={docStatus !== 'NEW'}
                onBeforeSelect={this.handleMultipleAdd}
                modalProps={{
                  className: 'sslm-add-scorer-modal',
                  beforeOpen: () => {
                    const lovDs = addScorerDs.getField('addScorer').getOptions(addScorerDs.current);
                    if (lovDs) {
                      lovDs.unSelectAll();
                      lovDs.clearCachedSelected();
                    }
                  },
                }}
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </C7NLov>
            </Fragment>
          )}
        </div>
      );
    } else if (modalCode === 'productName') {
      return (
        <Row style={{ marginTop: '-10px', marginBottom: '10px' }}>
          <Col span={8}>
            <Col span={6}>
              {intl.get('sslm.supplierDocManage.model.docManage.productCode').d('品类编码')}:
            </Col>
            <Col span={18}>{productInfo.productCode || ''}</Col>
          </Col>
          <Col span={8}>
            <Col span={6}>
              {intl.get('sslm.supplierDocManage.model.docManage.categoryName').d('品类名称')}:
            </Col>
            <Col span={18}>{productInfo.productName || ''}</Col>
          </Col>
        </Row>
      );
    } else if (modalCode === 'sumScore') {
      return (
        <Row style={{ marginTop: '-10px', marginBottom: '10px' }}>
          <Col span={3}>
            {intl
              .get('sslm.supplierDocManage.model.docManage.choseEvalGranularity')
              .d('考评颗粒度')}
            :
          </Col>
          {granularity === 'SU' && <Col span={21}>{granularityList.supplierName || ''}</Col>}
          {granularity === 'SU+CA' && (
            <Col span={21}>
              {`${granularityList.supplierName}+${granularityList.categoryName}` || ''}
            </Col>
          )}
          {granularity === 'SU+IT' && (
            <Col span={21}>
              {`${granularityList.supplierName}+${granularityList.itemName}` || ''}
            </Col>
          )}
        </Row>
      );
    }
  };

  /**
   *当lov变化是执行
   */
  handleLovChange = (val, lovRecord = {}, record) => {
    const {
      $form: { setFieldsValue },
    } = record;
    const { userName, unitName } = lovRecord;
    setFieldsValue({ userName, respUserId: lovRecord.userId, userDepartment: unitName });
  };

  /**
   * 关闭 Modal
   */
  handleClose = () => {
    const { isSaved } = this.state;
    const { onClose = e => e } = this.props;
    if (isSaved) {
      this.setState({
        addDataCount: 0,
        selectedRows: [],
      });
    } else {
      this.setState({
        dataSource: [],
        columns: [],
        addDataCount: 0,
        selectedRows: [],
      });
    }
    onClose();
  };

  /**
   *维护评分人信息 modal 保存
   *
   * @memberof DetailModal
   */
  handleSaveEvaluationPerson = throttle(() => {
    const { dataSource } = this.state;
    const { onSaveEvaluationPerson, onLoad, handleRefresh } = this.props;
    const dataArray = getEditTableData(dataSource, ['_status', 'evalDtlRespId']);

    if (onSaveEvaluationPerson && Array.isArray(dataArray)) {
      this.handleLoading(true);
      onSaveEvaluationPerson(dataArray)
        .then(res => {
          if (res) {
            this.setState({
              addDataCount: 0,
              isSaved: true,
            });
            notification.success();
            handleRefresh();
            onLoad('evaluationPerson').then(() => {
              this.setModalProps('evaluationPerson');
            });
          }
        })
        .finally(() => {
          this.handleLoading(false);
        });
    }
  }, 1000);

  /**
   *维护评分人信息 modal 新增评分人
   *
   * @memberof DetailModal
   */
  handleAddEvaluationPerson = () => {
    const {
      granularityList: { isStandard },
    } = this.props;
    const { addDataCount, dataSource } = this.state;
    const newData = {
      _status: 'create',
      loginName: '',
      userName: '',
      respWeight: '',
      evalDtlRespId: uuidv4(),
      isStandard,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      isSaved: false,
      addDataCount: addDataCount + 1,
    });
  };

  /**
   *维护评分人信息 modal 新增评分人（改为支持多选带出）
   *
   * @memberof DetailModal
   */
  handleMultipleAdd = lovRecords => {
    const {
      granularityList: { isStandard },
    } = this.props;
    const { addDataCount, dataSource } = this.state;
    const lovRecordsData = (lovRecords || []).map(record => record.toData());
    const newData = lovRecordsData.map(({ loginName, userId, userName, unitName }) => ({
      _status: 'create',
      loginName,
      userName,
      respWeight: '',
      respUserId: userId,
      userDepartment: unitName,
      evalDtlRespId: uuidv4(),
      isStandard,
    }));
    this.setState({
      dataSource: [...dataSource, ...newData],
      isSaved: false,
      addDataCount: addDataCount + 1,
    });
  };

  /**
   *维护评分人信息 modal 删除评分人
   *
   * @memberof DetailModal
   */
  handleDeleteEvaluationPerson = throttle(() => {
    const { selectedRows, dataSource } = this.state;
    const lastArray = dataSource.filter(
      n => !selectedRows.find(d => d.evalDtlRespId === n.evalDtlRespId)
    );
    const dataArray = getEditTableData(lastArray);
    if (!selectedRows.length) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一条数据'),
      });
    } else {
      this.setState({
        dataSource: dataArray,
        selectedRows: [],
      });
    }
  }, 1000);

  /**
   *选中的行
   *
   * @param {string[]} selectedRows - 被选中的行
   * @memberof DetailModal
   */
  handleSelectChange = (_, selectedRows) => {
    this.setState({
      selectedRows,
    });
  };

  /**
   * 分页change事件
   */
  handleChange = (pagination = {}) => {
    const { onLoad, modalCode } = this.props;
    onLoad(modalCode, pagination).then(() => {
      this.setModalProps(modalCode);
    });
  };

  handleLoading = flag => {
    this.setState({
      operateLoading: flag,
    });
  };

  getRowSelection = () => {
    const { selectedRows } = this.state;
    const { modalCode, docStatus } = this.props;
    if (modalCode === 'evaluationPerson' && docStatus === 'NEW') {
      return {
        selectedRowKeys: selectedRows.map(n => n.evalDtlRespId),
        onChange: this.handleSelectChange,
      };
    }
    return null;
  };

  /**
   * @return React.element
   */
  render() {
    const { title, columns, dataSource, rowKey, operateLoading } = this.state;
    const {
      visible,
      modalPagination,
      loading,
      customizeTable = () => {},
      modalCode = '',
      docManageRemote,
      handleRefresh,
      popType,
    } = this.props;
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    let code = '';
    switch (modalCode) {
      case 'sumScore':
        code =
          popType === 'complaints'
            ? 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTS_SUMSCORE'
            : 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SUMSCORE';
        break;
      case 'evaluationPerson':
        code = 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.EVALUATIONPERSON';
        break;
      case 'evaluationStatus':
        code = 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORING_COMPLETION';
        break;
      default:
        break;
    }
    const footBtnProps = {
      popType,
      operateLoading,
      handleLoading: this.handleLoading,
      getEditTableData,
      dataSource,
      onRefresh: handleRefresh,
      handleClose: this.handleClose,
    };
    return (
      <Modal title={title} visible={visible} onCancel={this.handleClose} footer={null} width={900}>
        {this.getHead()}
        {customizeTable(
          {
            code,
          },
          <EditTable
            columns={columns}
            dataSource={dataSource}
            bordered
            loading={loading}
            pagination={modalPagination}
            rowSelection={this.getRowSelection()}
            onChange={page => this.handleChange(page)}
            rowKey={rowKey}
            scroll={{ x: scrollX }}
          />
        )}
        {docManageRemote &&
          docManageRemote.render(
            'SSLM.EVALUATION_DOC_MANAGE_MODAL_FOOT_RENDER',
            <></>,
            footBtnProps
          )}
      </Modal>
    );
  }
}
