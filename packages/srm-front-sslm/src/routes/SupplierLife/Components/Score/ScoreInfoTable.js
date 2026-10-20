/**
 * Standard - 供应商生命周期配置 - 合格申请单评分信息表
 * @date: 2018-9-10
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Form, Drawer, Input, Row, Col, Select, Tooltip } from 'hzero-ui';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import ScoreForm from './ScorerForm';
import '../../../index.less';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 申请单供应商能力表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ScoreInfoTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentScorer: {}, // 当前编辑的评分人
      drawerVisible: false, // 评分人信息列表侧栏状态
      editDrawerVisible: false, // 维护评分人列表侧边栏
      selectedRows: [], // 评分人信息选择列表
      indicateLineId: undefined, // 当前选中的评分信息 id
      evalTplIndId: undefined, // 评分信息头 id
      listSelectedRowKeys: [], // 评分信息选中行key集合
      batchFlag: 0, // 是否是批量维护评分人
      // collapse: false,
      tooptipNum: null,
      tooptipIndex: 0,
    };
  }

  scorerForm; // 评分人表单信息

  componentDidMount() {
    const { onRef = (e) => e } = this.props;
    onRef(this);
  }

  /**
   * 打开侧边模态框
   */
  @Bind()
  onOpen(record = {}, batchFlag = 0) {
    const {
      tableProps: { dispatch, queryScorer, requisitionId, stageCode, templateId },
    } = this.props;
    const { indicateLineId, evalTplIndId } = record;
    this.setState({ batchFlag });

    if (indicateLineId || indicateLineId === 0) {
      this.setState(
        {
          indicateLineId,
          evalTplIndId,
          drawerVisible: true,
        },
        () => {
          queryScorer({
            dispatch,
            templateId,
            indicateLineId,
            requisitionId,
            stageCode,
          });
        }
      );
    } else {
      this.setState({
        drawerVisible: true,
      });
    }
  }

  @Bind()
  onClose() {
    const {
      tableProps: { dispatch, cleanState },
    } = this.props;
    this.setState(
      {
        drawerVisible: false,
        selectedRows: [],
        listSelectedRowKeys: [],
      },
      () => {
        cleanState(dispatch);
      }
    );
  }

  @Bind()
  onEditOpen(record = {}) {
    this.setState({
      currentScorer: record,
      editDrawerVisible: true,
    });
  }

  @Bind()
  onEditClose() {
    this.setState({
      currentScorer: {},
      editDrawerVisible: false,
    });
  }

  /**
   * 保存或更新评分人列表
   * @param {Number} indicateLineId - 评分人信息行 id
   */
  @Bind()
  saveScorer() {
    const {
      tableProps: { saveScorer = (e) => e, onBatchMaintainGrader = (e) => e },
    } = this.props;
    const { indicateLineId, batchFlag, listSelectedRowKeys = [] } = this.state;
    if (batchFlag) {
      onBatchMaintainGrader(listSelectedRowKeys);
    } else {
      saveScorer(indicateLineId);
    }
  }

  /**
   * 清空评分勾选行
   */
  @Bind()
  clearScorerSelectRow() {
    this.setState({
      listSelectedRowKeys: [],
    });
  }

  // func是用户传入需要防抖的函数
  @Bind()
  debounce(func, wait = 500) {
    // 缓存一个定时器id
    let timer = 0;
    return function time(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  // 删除评分人列表
  @Bind()
  deleteScorer() {
    const { selectedRows, indicateLineId, evalTplIndId } = this.state;
    const {
      tableProps: { deleteScorer, stageCode },
    } = this.props;

    const params = {
      indicateLineId,
      evalTplIndId,
      rows: selectedRows,
      stageCode,
    };
    deleteScorer(params);
  }

  /**
   * 评分信息table rowSelection onChange事件
   */
  @Bind()
  listSelectChange(selectedRowKeys) {
    this.setState({ listSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 评分人信息详情列表 select Change 事件
   * @param {Array} selectedRows - 勾选的列表 rowKey
   */
  @Bind()
  detailSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  addScorer(params) {
    const {
      tableProps: { addScorer = (e) => e },
    } = this.props;
    addScorer(params);
    this.setState({
      editDrawerVisible: false,
    });
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  @Bind()
  handleSearch() {
    const {
      onSearch,
      form: { getFieldsValue },
    } = this.props;
    const values = getFieldsValue();
    if (onSearch) {
      onSearch(values);
    }
  }

  /**
   *handleReset - 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  changeOnMouseOver(e, index, record) {
    record.$form.setFieldsValue({ evalStandard: e.target.value });
    this.setState({ tooptipNum: e.target.value, tooptipIndex: index });
  }

  @Bind()
  focusOnMouseOver(e, index) {
    this.setState({ tooptipNum: e.target.value ? e.target.value : null, tooptipIndex: index });
  }
  // @Bind()
  // handleToggle(collapseFlag) {
  //   this.setState({ collapse: collapseFlag });
  // }

  render() {
    const {
      drawerVisible,
      editDrawerVisible,
      selectedRows,
      currentScorer,
      listSelectedRowKeys,
      // collapse,
      tooptipNum,
      tooptipIndex,
    } = this.state;
    const {
      tableProps = {},
      isEdit = false,
      readOnly = true,
      customizeTable = () => {},
      code = '',
      form: { getFieldDecorator },
      indicatorTypeList = [],
    } = this.props;
    const {
      listLoading,
      scorerLoading,
      saveScorerLoading,
      deleteScorerLoading,
      scorerDataSource,
      listDataSource = [],
      requisitionId,
      stageCode,
      batchGraderFlag = true,
      templateId,
      customizeBtnGroup,
      customizeBtnGroupCode,
    } = tableProps;
    const rowKeyId =
      requisitionId && listDataSource[0] && listDataSource[0].indicateLineId !== null
        ? 'indicateLineId'
        : 'evalTplIndId';
    const isBatch = isEdit && requisitionId;
    // && stageCode === 'RECOMMEND';

    const listColumns = [
      {
        title: intl
          .get(`sslm.commonApplication.model.commonApplication.indicateCode`)
          .d('评价项目编号'),
        width: 150,
        dataIndex: 'indicatorCode',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
        width: 100,
        dataIndex: 'indicatorName',
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.itemRemark`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 100,
        onCell: this.onCell,
        render: (val, record, index) =>
          isEdit ? (
            <FormItem>
              {record.$form.getFieldDecorator('evalStandard', {
                initialValue: val || record.evalStandard,
              })(
                <Tooltip
                  visible={tooptipNum && index === tooptipIndex}
                  title={tooptipNum}
                  trigger="focus"
                >
                  <Input
                    defaultValue={val || record.evalStandard}
                    onChange={(e) => this.changeOnMouseOver(e, index, record)}
                    onFocus={(e) => this.focusOnMouseOver(e, index)}
                    onBlur={() => this.setState({ tooptipIndex: 99999 })}
                  />
                </Tooltip>
              )}
            </FormItem>
          ) : (
            val || record.evalStandard
          ),
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.scoreType`).d('评分方式'),
        width: 100,
        dataIndex: 'scoreTypeMeaning',
      },
      {
        title: intl
          .get(`sslm.commonApplication.model.commonApplication.indicatorType`)
          .d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.scoreFrom`).d('分值从'),
        width: 80,
        dataIndex: 'scoreFrom',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.scoreTo`).d('分值到'),
        width: 80,
        dataIndex: 'scoreTo',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.indiScore`).d('指标分值'),
        dataIndex: 'indicatorScore',
        key: 'indicatorScore',
        width: 100,
      },
      {
        title: intl.get('sslm.commonApplication.view.message.score').d('得分'),
        width: 80,
        dataIndex: 'score',
      },
      {
        title: intl
          .get('sslm.commonApplication.model.commonApplication.totalScore')
          .d('未加权评分'),
        width: 100,
        dataIndex: 'totalScore',
      },
      {
        title: intl.get('sslm.commonApplication.model.commonApplication.scoreInfo').d('评分人信息'),
        width: 100,
        dataIndex: 'scoreInfo',
        render: (_, record) =>
          record.indicateLineId && (
            <a onClick={() => this.onOpen(record, 0)}>
              {intl.get('sslm.commonApplication.model.commonApplication.scoreInfo').d('评分人信息')}
            </a>
          ),
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.allExplain`).d('反馈备注'),
        dataIndex: 'allExplain',
        onCell: this.onCell,
        width: 120,
      },
    ];
    if (stageCode === 'QUALIFIED' && !readOnly) {
      listColumns.push({
        title: intl.get('sslm.commonApplication.model.commonApplication.scoreUser').d('评分人明细'),
        width: 100,
        dataIndex: 'scoreUserCollect',
        onCell: this.onCell,
      });
    }
    const scorerColumns = [
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.loginName`).d('用户名'),
        width: 100,
        dataIndex: 'respLoginName',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.realNameDes`).d('用户描述'),
        width: 100,
        dataIndex: 'respUserName',
      },
      {
        title: `${intl
          .get(`sslm.commonApplication.model.commonApplication.weight`)
          .d('权重')}（%）`,
        width: 100,
        dataIndex: 'respWeight',
        render: (value) => `${value}`,
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.procStatus`).d('评分状态'),
        width: 100,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.score`).d('评分'),
        width: 80,
        dataIndex: 'score',
      },
      {
        title: intl
          .get(`sslm.commonApplication.model.commonApplication.isStandard`)
          .d('符合评分标准'),
        dataIndex: 'isStandard',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.isVeto`).d('否决该项'),
        dataIndex: 'isVeto',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sslm.commonApplication.view.message.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 120,
      },
      {
        title: intl.get('sslm.commonApplication.model.commonApplication.scoreRemark').d('评分说明'),
        dataIndex: 'remark',
      },
    ];
    if (isEdit) {
      scorerColumns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 60,
        dataIndex: 'option',
        render: (_, record) => (
          <a
            onClick={() => {
              if (record.respUserId) {
                this.onEditOpen(record);
              } else {
                this.onEditOpen();
              }
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      });
    }

    // 评分信息 rowSelection
    const listRowSelection = {
      selectedRowKeys: listSelectedRowKeys,
      onChange: this.listSelectChange,
    };

    // 详情 rowSelection
    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item.respUserId),
      onChange: this.detailSelectChange,
    };
    const listScrollX = sum(listColumns.map((n) => (isNumber(n.width) ? n.width : 150)));
    const scorerScrollX = sum(scorerColumns.map((n) => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        <div className="table-list-search">
          {requisitionId && templateId && batchGraderFlag && (
            <Form layout="inline" className="more-fields-form">
              <Row gutter={24}>
                <Col span={18}>
                  <Row>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`sslm.commonApplication.model.commonApplication.indicatorCode`)
                          .d('指标编码')}
                        {...formLayout}
                      >
                        {getFieldDecorator('indicatorCode')(<Input />)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`sslm.commonApplication.model.commonApplication.indicatorName`)
                          .d('指标名称')}
                        {...formLayout}
                      >
                        {getFieldDecorator('indicatorName')(<Input />)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`sslm.commonApplication.model.commonApplication.indicatorType`)
                          .d('指标类型')}
                        {...formLayout}
                      >
                        {getFieldDecorator('indicatorType')(
                          <Select allowClear>
                            <OptGroup
                              label={intl
                                .get(`sslm.commonApplication.model.commonApplication.systemRate`)
                                .d('系统评分')}
                            >
                              <Option value="SYSTEM" key="SYSTEM">
                                {intl
                                  .get(
                                    `sslm.commonApplication.model.commonApplication.systemCalculate`
                                  )
                                  .d('系统计算')}
                              </Option>
                            </OptGroup>
                            <OptGroup
                              label={intl
                                .get(`sslm.commonApplication.model.commonApplication.manualScoring`)
                                .d('手工评分')}
                            >
                              {indicatorTypeList.map((item) => (
                                <Option value={item.value} key={item.value}>
                                  {item.meaning}
                                </Option>
                              ))}
                            </OptGroup>
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={6} className="search-btn-more">
                  <Form.Item>
                    {/* {!collapse ? (
                     <Button onClick={() => this.handleToggle(true)}>
                       {intl.get('hzero.common.button.viewMore').d('更多查询')}
                     </Button>
                   ) : (
                     <Button onClick={() => this.handleToggle(false)}>
                       {intl.get('hzero.common.button.collected').d('收起查询')}
                     </Button>
                   )} */}
                    <Button data-code="reset" onClick={this.handleReset}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                    <Button
                      data-code="search"
                      type="primary"
                      htmlType="submit"
                      onClick={this.handleSearch}
                    >
                      {intl.get('hzero.common.status.search').d('查询')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </div>
        {isBatch && batchGraderFlag && (
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            {customizeBtnGroup ? (
              customizeBtnGroup(
                {
                  code: customizeBtnGroupCode,
                },
                [
                  <Button
                    data-name="batchMaintainGrader"
                    type="primary"
                    disabled={isEmpty(listSelectedRowKeys)}
                    onClick={() => this.onOpen({}, 1)}
                  >
                    {intl
                      .get('sslm.commonApplication.model.button.batchMaintainGrader')
                      .d('批量维护评分人')}
                  </Button>,
                ]
              )
            ) : (
              <Button
                type="primary"
                disabled={isEmpty(listSelectedRowKeys)}
                onClick={() => this.onOpen({}, 1)}
              >
                {intl
                  .get('sslm.commonApplication.model.button.batchMaintainGrader')
                  .d('批量维护评分人')}
              </Button>
            )}
          </div>
        )}
        {customizeTable(
          {
            code,
          },
          <EditTable
            loading={listLoading}
            rowKey={rowKeyId}
            bordered
            columns={listColumns}
            pagination={false}
            scroll={{ x: listScrollX }}
            dataSource={listDataSource || []}
            rowSelection={isBatch ? listRowSelection : null}
          />
        )}
        <Drawer
          destroyOnClose
          title={intl
            .get('sslm.commonApplication.view.message.maintainScoreInformation')
            .d('维护评分人信息')}
          width={850}
          placement="right"
          closable={false}
          visible={drawerVisible}
          onClose={this.onClose}
        >
          {isEdit && (
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button onClick={this.deleteScorer} loading={deleteScorerLoading}>
                {intl.get('sslm.commonApplication.view.button.deleteScorer').d('删除评分人')}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  this.onEditOpen();
                }}
                style={{ marginLeft: 8 }}
              >
                {intl.get('sslm.commonApplication.view.button.addScorer').d('新增评分人')}
              </Button>
            </div>
          )}
          <Table
            loading={scorerLoading}
            rowKey="respUserId"
            bordered
            columns={scorerColumns}
            rowSelection={isEdit ? rowSelection : null}
            dataSource={scorerDataSource}
            pagination={false}
            scroll={{ x: scorerScrollX }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={this.onClose}>
              {isEdit
                ? intl.get('hzero.common.button.cancel').d('取消')
                : intl.get('hzero.common.button.close').d('关闭')}
            </Button>
            <Button
              type="primary"
              onClick={this.debounce(this.saveScorer, 500)} // 保存逻辑
              style={{ display: isEdit ? 'inline-block' : 'none' }}
              loading={saveScorerLoading}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
          <Drawer
            destroyOnClose
            title={intl.get(`sslm.commonApplication.view.message.maintainScore`).d('维护评分人')}
            width={520}
            visible={editDrawerVisible}
            onClose={this.onEditClose}
          >
            <ScoreForm
              onRef={(ref) => {
                this.scorerForm = ref;
              }}
              currentScorer={currentScorer}
              onClose={this.onEditClose}
              addScorer={this.addScorer}
            />
          </Drawer>
        </Drawer>
      </Fragment>
    );
  }
}
