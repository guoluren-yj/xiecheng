import React, { PureComponent } from 'react';
import { Form, InputNumber, Row, Col, Input, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, sumBy, compose, isUndefined } from 'lodash';
import uuidv4 from 'uuid/v4';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { Header, Content } from 'components/Page';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import {
  delItemToPagination,
  addItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import { FORM_COL_2_LAYOUT, EDIT_FORM_ITEM_LAYOUT, ROW_READ_ONLY_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import TLEditor from 'components/TLEditor';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import FilterForm from './DetailFilterForm';
import styles from '../index.less';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

const unitCode = ['SSRC.SCORE_TEMPLATE.SCORE_DETAIL'];
const { TextArea } = Input;

class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params: { indicateId } = {} },
    } = props;

    this.state = {
      indicateId,
      query: JSON.parse(sessionStorage.getItem('query') || '{}'),
      rowKey: 'indicateId',
      dataListName: 'elementsDetailLineList',
      pagination: 'elementsDetailLinePagination',
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const { score } = this.props;
    const { pagination, indicateId } = this.state;
    if (indicateId !== 'create') {
      this.fetchElementsDetailLine(score[pagination]);
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'score/updateState',
      payload: {
        elementsDetailLineList: [],
        elementsDetailLinePagination: {},
      },
    });
  }

  /**
   * 评分要素细项-行-查询
   */
  @Bind()
  fetchElementsDetailLine(page = {}) {
    const { dispatch } = this.props;
    const { indicateId } = this.state;
    const form = this.filterForm;
    const filterValues = form ? form.getFieldsValue() : {};
    dispatch({
      type: 'score/fetchElementsDetailLine',
      payload: {
        indicateLevel: 'TWO',
        parentIndicateId: indicateId,
        page,
        customizeUnitCode: unitCode.join(),
        ...filterValues,
      },
    });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props?.form;
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRows() {
    const { dispatch, score = {} } = this.props;
    const { rowKey, dataListName, pagination, indicateId } = this.state;
    dispatch({
      type: 'score/updateState',
      payload: {
        [dataListName]: [
          {
            [rowKey]: uuidv4(),
            enabledFlag: 1,
            parentIndicateId: indicateId === 'create' ? undefined : indicateId,
            indicateLevel: 'TWO',
            _status: 'create',
          },
          ...(score[dataListName] || []),
        ],
        [pagination]: addItemToPagination((score[dataListName] || []).length, score[pagination]),
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
        return other;
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
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch, score } = this.props;
    const { rowKey, dataListName, query, indicateId, pagination } = this.state;
    const newDataList = getEditTableData(score[dataListName], [rowKey]);
    const remoteData = score[dataListName].filter((item) => !item._status && item.enabledFlag);
    // 校验必输
    if (isEmpty(newDataList)) return;
    // 校验权重之和为100
    let remoteWeightSum = 0;
    if (score[dataListName].filter((item) => !item._status)) {
      remoteWeightSum = sumBy(remoteData, 'weight');
    }
    const allEditFlag =
      remoteWeightSum +
        (sumBy(
          newDataList.filter((item) => item.enabledFlag),
          'weight'
        ) || 0) ===
      100;
    const allNotEditFlag =
      remoteWeightSum +
        (sumBy(
          newDataList.filter((item) => item.enabledFlag),
          'weight'
        ) || 0) ===
      0;

    const exitsNotOne = remoteData.length && remoteData.some((item) => item.weight !== 100);
    const allOneFlag =
      (remoteData.length && remoteData.every((item) => item.weight === 100)) || !remoteData.length;
    const editNoOneFlag = newDataList.every((item) => !item.weight);
    if (allEditFlag || allNotEditFlag || (allOneFlag && editNoOneFlag)) {
      const weightNewDataList = newDataList.map((item) => ({
        ...item,
        weight:
          (allOneFlag || editNoOneFlag) && !exitsNotOne && !item.weight ? 100 : item.weight || 0,
      }));

      const saveData = {
        ...query,
        indicateId: indicateId === 'create' ? undefined : indicateId,
        scoreIndicList: weightNewDataList,
        customizeUnitCode: unitCode.join(),
      };
      dispatch({
        type: 'score/saveElementsDetail',
        payload: saveData,
      }).then((res) => {
        if (res) {
          const { scoreIndicList, ...others } = res;
          sessionStorage.setItem('query', JSON.stringify(others));
          this.setState({ query: others, indicateId: res.indicateId });
          notification.success();
          // 保存成功跳转页面
          if (indicateId === 'create') {
            this.props.history.push({
              pathname: `/ssrc/score/elements/detail/${res.indicateId}`,
            });
          }
          this.fetchElementsDetailLine(score[pagination]);
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.score.view.notification.weight.sum')
          .d('保存失败，请保持评分要素细项权重之和为100！'),
      });
    }
  }

  /**
   * 删除
   * 真删除，至少保留一条二级要素存在
   */
  @Bind()
  handleDelete() {
    const { dispatch, score } = this.props;
    const { selectedRowKeys, pagination, dataListName } = this.state;
    let localData = 0;
    if (score[dataListName].some((item) => item._status === 'create')) {
      localData = score[dataListName].filter((item) => item._status === 'create').length;
    }
    if (selectedRowKeys.length === score[pagination].total - localData) {
      notification.warning({
        message: intl
          .get('ssrc.score.view.notification.elementsDetail.one')
          .d('请至少保留一项评分要素细项！'),
      });
    } else {
      dispatch({
        type: 'score/deleteElementsDetail',
        payload: selectedRowKeys,
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ selectedRowKeys: [] });
          this.fetchElementsDetailLine(score[pagination]);
        }
      });
    }
  }

  /**
   * 设置勾选行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 渲染头信息
   */
  renderDetailHeader() {
    const { query } = this.state;
    return (
      <Form className={styles['ued-line-height']}>
        <Row gutter={48} className={ROW_READ_ONLY_CLASSNAME}>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.score.model.score.indicateCode`).d('评分要素编码')}
              value={query.indicateCode}
            />
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.score.model.score.indicateName`).d('评分要素名称')}
              value={query.indicateName}
            />
          </Col>
        </Row>
        <Row gutter={48} className={ROW_READ_ONLY_CLASSNAME}>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.score.model.score.indicateType`).d('评分要素类型')}
              value={
                query.indicateTypeMeaning ||
                intl.get('ssrc.score.model.score.indicateType.score').d('打分制')
              }
            />
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.score.model.score.elements.remark').d('评分细则')}
              value={query.remark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  getColunms() {
    const columns = [
      {
        title: intl.get(`ssrc.score.model.score.indicateDetailCode`).d('评分要素细项编码'),
        dataIndex: 'indicateCode',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('indicateCode', {
                  initialValue: record.indicateCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.score.model.score.indicateDetailCode`)
                          .d('评分要素细项编码'),
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
        title: intl.get(`ssrc.score.model.score.indicateDetailName`).d('评分要素细项名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('indicateName', {
                  initialValue: record.indicateName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.score.model.score.indicateDetailName`)
                          .d('评分要素细项名称'),
                      }),
                    },
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get(`ssrc.score.model.score.indicateDetailName`)
                      .d('评分要素细项名称')}
                    field="indicateName"
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
        title: intl.get(`ssrc.score.model.score.elements.remark`).d('评分细则'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: record.remark,
                })(<TextArea autosize={{ maxRows: 5 }} />)}
              </Form.Item>
            );
          } else {
            return (
              <Tooltip
                popupStyle={{
                  whiteSpace: 'pre-wrap',
                  minWidth: '400',
                }}
                title={() => <span>{val}</span>}
                placement="topLeft"
              >
                {val}
              </Tooltip>
            );
          }
        },
      },
      {
        title: <span>{intl.get(`ssrc.score.model.score.weight`).d('权重')}%</span>,
        dataIndex: 'weight',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('weight', {
                  initialValue: record.weight,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.weight`).d('权重'),
                      }),
                    },
                    {
                      pattern: /^[0-9]{1,3}(.[0-9]{1,2})?/,
                      message: intl
                        .get(`ssrc.score.model.score.unsetsocore`)
                        .d('只能输入两位精度的非负数'),
                    },
                  ],
                })(<InputNumber style={{ width: '100%' }} precision={2} min={0} max={100} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.score.model.score.minScore`).d('最低分'),
        dataIndex: 'minScore',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('minScore', {
                  initialValue: record.minScore,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
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
        title: intl.get(`ssrc.score.model.score.maxScore`).d('最高分'),
        dataIndex: 'maxScore',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('maxScore', {
                  initialValue: record.maxScore,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
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
        title: intl.get(`ssrc.score.model.score.defaultScore`).d('缺省分'),
        dataIndex: 'defaultScore',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('defaultScore', {
                  initialValue: record.defaultScore,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    min={0}
                    max={99999999999999999}
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
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        align: 'center',
        width: 75,
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
        width: 75,
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
    return columns;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { indicateId } = this.state;
    const form = this.filterForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...(formValues || {}),
      indicateLevel: 'TWO',
      parentIndicateId: indicateId,
      customizeUnitCode: 'SSRC.SCORE_TEMPLATE.SCORE_DETAIL',
    };
    return filterValues;
  }

  @Bind()
  getButtons() {
    const { saving, deleting, score = {} } = this.props;
    const { dataListName, selectedRowKeys, indicateId } = this.state;
    const isSave = (score[dataListName] || []).filter(
      (o) => o._status === 'create' || o._status === 'update'
    );
    const buttons = [
      {
        name: 'create',
        btnType: 'h0',
        btnProps: {
          icon: 'plus',
          type: 'primary',
          onClick: this.handleCreateRows,
        },
        child: intl.get('hzero.common.button.create').d('新建'),
      },
      {
        name: 'save',
        btnType: 'h0',
        btnProps: {
          icon: 'save',
          disabled: isEmpty(isSave),
          loading: saving,
          onClick: this.handleSave,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'delete',
        btnType: 'h0',
        btnProps: {
          icon: 'delete',
          disabled: isEmpty(selectedRowKeys),
          loading: deleting,
          onClick: this.handleDelete,
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      {
        name: 'export',
        btnComp: ExcelExportPro,
        btnType: 'h0',
        hidden: indicateId === 'create', // 创建时，不显示导出
        btnProps: {
          templateCode: 'SRM_C_SRM_SSRC_SCORE_INDIC_TWO',
          name: 'allExport',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/score-indicate/export`,
          method: 'GET',
          queryParams: this.handleGetFormValue,
        },
      },
    ];
    return buttons;
  }

  render() {
    const {
      loading,
      score = {},
      customizeTable = () => {},
      customizeBtnGroup = () => {},
    } = this.props;
    const { rowKey, dataListName, pagination, indicateId } = this.state;
    const filterProps = {
      indicateId,
      onSearch: this.fetchElementsDetailLine,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };

    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/score"
          title={intl.get('ssrc.score.view.message.title.elementDetail').d('评分要素细项维护')}
        >
          {customizeBtnGroup(
            {
              code: 'SSRC.SCORE_TEMPLATE.SCORE_DETAIL.HEADER_BUTTONS',
              pro: true,
            },
            <DynamicButtons buttons={this.getButtons()} defaultBtnType="h0" />
          )}
        </Header>
        <Content>
          <div className={styles['score-detail-header']}>{this.renderDetailHeader()}</div>
          <div className="table-list-search" style={{ marginTop: '16px' }}>
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SSRC.SCORE_TEMPLATE.SCORE_DETAIL',
            },
            <EditTable
              bordered
              loading={loading}
              rowKey={rowKey}
              dataSource={score[dataListName]}
              columns={this.getColunms()}
              pagination={score[pagination]}
              rowSelection={rowSelection}
              onChange={this.fetchElementsDetailLine}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}

const Hooc = (Com) => {
  return compose(
    withCustomize({
      unitCode: [...(unitCode || []), 'SSRC.SCORE_TEMPLATE.SCORE_DETAIL.HEADER_BUTTONS'],
    }),
    connect(({ score, loading }) => ({
      score,
      loading: loading.effects['score/fetchElementsDetailLine'],
      saving: loading.effects['score/saveElementsDetail'],
      deleting: loading.effects['score/deleteElementsDetail'],
    }))
  )(Com);
};

export { Hooc, Detail };
export default Hooc(Detail);
