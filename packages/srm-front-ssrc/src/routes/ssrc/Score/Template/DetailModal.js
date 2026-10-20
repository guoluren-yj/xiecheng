import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, InputNumber, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, sumBy } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';

/**
 * 评分要素模态框Table
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ score, loading }) => ({
  score,
  loading: loading.effects['score/fetchElementsDetailLine'],
  save: loading.effects['score/saveElementsDetail'],
}))
export default class DetailModal extends PureComponent {
  constructor(props) {
    super(props);
    const { onBindSearch } = props;
    if (onBindSearch) onBindSearch(this.fetchElementsDetailLine);
    this.state = {
      rowKey: 'indicateId',
      dataListName: 'elementsDetailLineList',
      pagination: 'elementsDetailLinePagination',
    };
  }

  componentDidMount() {
    const { score } = this.props;
    const { pagination } = this.state;
    this.fetchElementsDetailLine(score[pagination]);
  }

  /* eslint-disable-next-line */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { visible, score, dispatch } = this.props;
    const { pagination } = this.state;
    if (nextProps.visible === true && nextProps.visible !== visible && !isEmpty(nextProps.record)) {
      dispatch({
        type: 'score/fetchElementsDetailLine',
        payload: {
          page: score[pagination],
          parentIndicateId: nextProps.record.indicateId,
          indicateLevel: 'TWO',
          templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
          sourceType: nextProps.record.tmplAssignId ? 'TEMPLATE_MANUAL' : 'TEMPLATE', // 存在tmplAssignId 即TEMPLATE_MANUAL
        },
      });
    }
  }

  /**
   * 评分要素-行-查询
   * @param {Object} page
   */
  @Bind()
  fetchElementsDetailLine(page = {}) {
    const { dispatch, record } = this.props;
    dispatch({
      type: 'score/fetchElementsDetailLine',
      payload: {
        page,
        parentIndicateId: record.indicateId,
        indicateLevel: 'TWO',
        templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
        sourceType: record.tmplAssignId ? 'TEMPLATE_MANUAL' : 'TEMPLATE', // 存在tmplAssignId 即TEMPLATE_MANUAL
      },
    });
  }

  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRows() {
    const { dispatch, score, record = {}, updateTemplateDetail } = this.props;
    const { rowKey, dataListName } = this.state;

    const newDataList = getEditTableData(score[dataListName], [rowKey]);
    const filterRecord = getEditTableData([record], ['tmplAssignId'])[0];
    const endStatusData = record._status === 'create' ? filterRecord : record;
    if (isEmpty(newDataList)) return;
    if (sumBy(newDataList, 'weight') === 100) {
      const saveData = {
        ...endStatusData,
        objectVersionNumber: record.indicateVersion, // 为了解决版本记录不一致
        scoreIndicateList: newDataList,
      };
      dispatch({
        type: 'score/saveElementsDetailTwo',
        payload: saveData,
      }).then((res) => {
        if (res) {
          notification.success();
          updateTemplateDetail();
          this.props.onHideModal();
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
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.props.onHideModal();
  }

  render() {
    const { loading, visible, score = {}, save, scoreTemplateScoreType, remote } = this.props;
    const { rowKey, dataListName, pagination } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.score.model.score.indicateDetailCode`).d('评分要素细项编码'),
        dataIndex: 'indicateCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.score.model.score.indicateDetailName`).d('评分要素细项名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            <span>{val}</span>
          </Tooltip>
        ),
      },
      !(['SCORE', 'SCORE_NEW'].includes(scoreTemplateScoreType))
        ? {
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
          }
        : null,
      {
        title: intl.get(`ssrc.score.model.score.minScore`).d('最低分'),
        dataIndex: 'minScore',
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
                    min={
                      remote
                        ? remote.process(
                            'SSRC_SCORE_TEMPLATE_DEFINE_DETAIL_PROCESS_TWO_ELEMENT_MIN_SCORE_MIN_VALUE',
                            0
                          )
                        : 0
                    }
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
    ].filter(Boolean);
    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width={770}
          visible={visible}
          onOk={this.handleSaveRows}
          onCancel={this.handleModalHide}
          confirmLoading={save}
          title={intl.get('ssrc.score.view.title.elementsDetail').d('评分要素细项')}
          okText={intl.get('hzero.common.button.save').d('保存')}
        >
          <EditTable
            bordered
            loading={loading}
            rowKey={rowKey}
            dataSource={score[dataListName]}
            columns={columns}
            pagination={score[pagination]}
            onChange={this.fetchElementsDetailLine}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
