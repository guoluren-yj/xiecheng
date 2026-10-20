/**
 * ElementTable - 评分要素定义
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router';
import { Form, Input, InputNumber, Select, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import withCustomize from 'hzero-front-hcuz';

import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { delItemToPagination } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
// import notification from 'utils/notification';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import { getCurrentScoreType } from '@/utils/utils';
import FilterForm from './FilterForm';

const { Option } = Select;
const promptCode = 'ssrc.score';

/**
 * 评分要素定义
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
class TemplateTable extends Component {
  constructor(props) {
    super(props);
    const { onBindSearch } = props;
    if (onBindSearch) onBindSearch(this.handleSearchTemplate);
    this.state = {
      rowKey: 'templateId',
      dataListName: 'templateList',
      pagination: 'templatePagination',
      // tenantId: getCurrentOrganizationId(),
    };
  }

  // getSnapshotBeforeUpdate(prevProps) {
  //   const flag = prevProps.custLoading && !this.props.custLoading;

  //   return flag;
  // }

  componentDidMount() {
    this.queryTableData();
  }

  componentDidUpdate() {
    // if (param[2]) {
    //   // 这时this.props.form.getFormFieldsValue()可以拿到正确值
    //   // 注意去掉原来didmount中的查询，并在此处做初始查询逻辑
    //   // 注意控制查询次数，避免死循环
    //   this.queryTableData();
    // }
  }

  componentWillUnmount() {
    this.clearInitQueryTimer();
  }

  clearInitQueryTimer = () => {
    clearTimeout(this.initQueryTimer);
  };

  /**
   * 初次查询，需要获取到个性化的默认值，但是历史和写法和设计，多tab不能保证
   * 所以延迟查询，确保可以获取到个性化值
   *
   * 需要在调用customizeFilterForm的组件中，增加componentDidUpdate函数，个性化初始化完成的判断通过后才可以获取到正确值
   */
  queryTableData = () => {
    const { score: { templatePagination = {} } = {} } = this.props;

    // this.handleSearchTemplate(templatePagination);

    this.initQueryTimer = setTimeout(() => this.handleSearchTemplate(templatePagination), 300);
  };

  /**
   * 查询评分模板定义
   * @param {Object} page
   */
  @Bind()
  handleSearchTemplate(page = {}) {
    const { dispatch } = this.props;
    const form = this.filterForm;
    const filterValues = form ? form.getFieldsValue() : {};

    dispatch({
      type: 'score/fetchTemplate',
      payload: {
        page,
        customizeUnitCode: 'SSRC.SCORE_TEMPLATE.SCORE_TEMPLATE_FILTER',
        ...filterValues,
      },
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  deleteRow(record) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    const newDataList = score[dataListName].filter((item) => item[rowKey] !== record[rowKey]);
    dispatch({
      type: 'score/updateState',
      payload: {
        [dataListName]: newDataList,
        [pagination]: delItemToPagination(score[dataListName].length, score[pagination]),
      },
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  cancelRow(record) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = score[dataListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return { ...other, _scoreMode: other.scoreMode };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'score/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  editRow(record) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = score[dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'score/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * 评分模式改变时触发
   * @param {Object} record 行数据
   * @param {String} value 改变的值
   */
  handleSelectChange(record, value) {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = score[dataListName].map((item) => {
      if (record[rowKey] === item[rowKey]) {
        return { ...item, _scoreMode: value };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'score/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 1;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * 跳转页面
   * @param {Object} pageParams
   */
  @Bind()
  handleJumpPage(pageParams = {}) {
    const {
      expertCategory,
      templateId,
      templatePurpose,
      scoreMode,
      scoreTemplateScoreType,
    } = pageParams;
    // 资格预审使用通过制
    const indicateType = ['PREQUALIFICATION', 'INITIAL_REVIEW'].includes(templatePurpose)
      ? 'PASS'
      : 'SCORE';
    this.props.history.push({
      pathname: `/ssrc/score/detail/${templateId}`,
      search: `?expertCategory=${expertCategory}&indicateType=${indicateType}&templatePurpose=${templatePurpose}&scoreMode=${scoreMode}&scoreTemplateScoreType=${scoreTemplateScoreType}`,
    });
  }

  /**
   * 切换模板用途
   * @param {string} value - 模板用途值
   * @param {Object} value - 行对象
   */
  @Bind()
  handleChangeTempPurpose(value, record) {
    const { setFieldsValue } = record.$form;
    const { newScoreFlag = false } = this.props;
    if (value === 'PREQUALIFICATION') {
      setFieldsValue({ scoreMode: 'NONE' });
    } else if (value === 'INITIAL_REVIEW') {
      setFieldsValue({
        scoreMode: 'NONE',
        scoreTemplateScoreType: newScoreFlag ? 'SCORE_NEW' : 'SCORE',
      });
    }
  }

  /**
   * columns
   * @protected （乐成教育二开）禁止修改、删除此方法名
   */
  renderColumns() {
    const { score = {}, customizeTable, scoreRemote, newScoreFlag = false } = this.props;
    const {
      code: { templatePurposeList = [], scoreModeList = [], scoreTemplateScoreType = [] } = {},
    } = score || {};

    // 新分值法 ['SCORE_NEW', 'WEIGHT] 原分值法['SCORE', 'WEIGHT]
    let newScoreType = getCurrentScoreType({ scoreTemplateScoreType, newScoreFlag });
    newScoreType = scoreRemote
      ? scoreRemote.process('SSRC_SCORE_TEMPLATE_DEFINE_PROCESS_NEW_SCORE_TYPE', newScoreType, {
          that: this,
          scoreTemplateScoreType,
          newScoreFlag,
        })
      : newScoreType;

    const columns = [
      {
        title: intl.get(`${promptCode}.model.score.templateCode`).d('评分模板编码'),
        dataIndex: 'templateCode',
        width: 165,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('templateCode', {
                  initialValue: record.templateCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.score.templateCode`).d('评分模板编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(
                  <Input
                    disabled={record._status === 'update'}
                    typeCase="upper"
                    inputChinese={false}
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
        title: intl.get(`${promptCode}.model.score.scoreTemplateName`).d('评分模板名称'),
        dataIndex: 'templateName',
        width: 175,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('templateName', {
                  initialValue: record.templateName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.score.scoreTemplateName`)
                          .d('评分模板名称'),
                      }),
                    },
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get(`${promptCode}.model.score.scoreTemplateName`)
                      .d('评分模板名称')}
                    field="templateName"
                    token={record._token}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip title={val} placement="topLeft">
                <span>{val}</span>
              </Tooltip>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.templatePurpose`).d('模板用途'),
        dataIndex: 'templatePurpose',
        width: 140,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('templatePurpose', {
                  initialValue: record.templatePurpose,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.score.templatePurpose`).d('模板用途'),
                      }),
                    },
                  ],
                })(
                  <Select
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(value) => this.handleChangeTempPurpose(value, record)}
                  >
                    {templatePurposeList.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return record.templatePurposeMeaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.scoreMode`).d('评分模式'),
        dataIndex: 'scoreMode',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('scoreMode', {
                  initialValue: record.scoreMode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.score.scoreMode`).d('评分模式'),
                      }),
                    },
                  ],
                })(
                  <Select
                    allowClear
                    disabled={['PREQUALIFICATION', 'INITIAL_REVIEW'].includes(
                      getFieldValue('templatePurpose')
                    )}
                    style={{ width: '100%' }}
                    onChange={(value) => this.handleSelectChange(record, value)}
                  >
                    {scoreModeList.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return record.scoreModeMeaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.scoreMethod`).d('评分方式'),
        dataIndex: 'scoreTemplateScoreType',
        width: 140,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <React.Fragment>
                <Form.Item>
                  {getFieldDecorator('scoreTemplateScoreType', {
                    initialValue: record.scoreTemplateScoreType
                      ? record.scoreTemplateScoreType
                      : newScoreFlag
                      ? 'SCORE_NEW'
                      : 'SCORE',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.model.score.scoreMethod`).d('评分方式'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }}>
                      {newScoreType.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator('scoreTemplateScoreTypeMeaning', {
                    initialValue: record.scoreTemplateScoreTypeMeaning,
                  })(<div />)}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return record.scoreTemplateScoreTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.technicalGroup`).d('技术组'),
        dataIndex: 'technicalGroup',
        width: 135,
        render: (_, record) => (
          <a
            disabled={record._status === 'create' || record.scoreMode === 'NONE'}
            onClick={() =>
              this.handleJumpPage({ expertCategory: 'TECHNOLOGY', ...record, customizeTable })
            }
          >
            {intl.get(`${promptCode}.view.message.elements`).d('评分要素')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.score.technologyWeight`).d('技术组权重（%）'),
        dataIndex: 'technologyWeight',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status) && record._scoreMode === 'DIFF') {
            const { getFieldDecorator, getFieldValue } = record.$form;
            // 新分值法 无须权重
            if (getFieldValue('scoreTemplateScoreType') === 'SCORE_NEW') return;
            return (
              <Form.Item>
                {getFieldDecorator('technologyWeight', {
                  initialValue: record.technologyWeight,
                  rules: [
                    {
                      required: record._scoreMode === 'DIFF',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.score.technologyWeight`)
                          .d('技术组权重（%）'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={record._scoreMode === 'NONE'}
                    style={{ width: '100%' }}
                    min={0}
                    max={99999999999999999}
                    precision={2}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record._scoreMode === 'NONE' ? null : val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.businessGroup`).d('商务组'),
        dataIndex: 'businessGroup',
        width: 135,
        align: 'center',
        render: (_, record) => (
          <a
            disabled={record._status === 'create' || record.scoreMode === 'NONE'}
            onClick={() => this.handleJumpPage({ expertCategory: 'BUSINESS', ...record })}
          >
            {intl.get(`${promptCode}.view.message.elements`).d('评分要素')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.score.businessWeight`).d('商务组权重（%）'),
        dataIndex: 'businessWeight',
        width: 120,
        render: (val, record) => {
          if (
            ['update', 'create'].includes(record._status) &&
            record._scoreMode === 'DIFF' &&
            record.scoreTemplateScoreType !== 'SCORE_NEW'
          ) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            // 新分值法 无须权重
            if (getFieldValue('scoreTemplateScoreType') === 'SCORE_NEW') return;
            return (
              <Form.Item>
                {getFieldDecorator('businessWeight', {
                  initialValue: record.businessWeight,
                  rules: [
                    {
                      required: record._scoreMode === 'DIFF',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.score.businessWeight`)
                          .d('商务组权重（%）'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={record._scoreMode === 'NONE'}
                    style={{ width: '100%' }}
                    min={0}
                    max={99999999999999999}
                    precision={2}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record._scoreMode === 'NONE' ? null : val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.score.indistinguishes`).d('不区分'),
        dataIndex: 'indistinguishes',
        width: 140,
        render: (_, record) => (
          <a
            disabled={record._status === 'create' || record.scoreMode === 'DIFF'}
            onClick={() => this.handleJumpPage({ expertCategory: 'NO', ...record })}
          >
            {intl.get(`${promptCode}.view.message.elements`).d('评分要素')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.score.remark`).d('模板说明'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: record.remark,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 90,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 90,
        fixed: 'right',
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.deleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.cancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.editRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return scoreRemote
      ? scoreRemote.process('SSRC_SCORE_TEMPLATE_DEFINE_PROCESS_TEMPLATE_COLUMNS', columns)
      : columns;
  }

  render() {
    const { loading, score = {}, customizeFilterForm } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    const { code: { templatePurposeList = [], scoreModeList = [] } = {} } = score || {};

    const filterProps = {
      scoreModeList,
      templatePurposeList,
      onSearch: this.handleSearchTemplate,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };

    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <EditTable
          bordered
          rowKey={rowKey}
          loading={loading}
          dataSource={score[dataListName]}
          columns={this.renderColumns()}
          pagination={score[pagination]}
          onChange={this.handleSearchTemplate}
          scroll={{ x: this.scrollWidth(this.renderColumns(), 0) }}
        />
      </React.Fragment>
    );
  }
}

const hocTemplateTable = (NewComponent) => {
  return connect(({ score, loading }) => ({
    score,
    loading: loading.effects['score/fetchTemplate'],
  }))(
    withRouter(
      formatterCollections({ code: ['ssrc.score', 'scux.ssrc'] })(
        remote({
          code: 'SSRC_SCORE_TEMPLATE_DEFINE',
          name: 'scoreRemote',
        })(NewComponent)
      )
    )
  );
};

export default hocTemplateTable(TemplateTable);
export { TemplateTable, hocTemplateTable };
