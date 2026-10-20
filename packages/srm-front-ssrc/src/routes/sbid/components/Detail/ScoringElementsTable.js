import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox } from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/sbid/components/CPopover';
import styles from './index.less';

export default class ScoringElementsTable extends PureComponent {
  /**
   * 显示权重
   *
   * @param {*} [dataLists=[]]
   * @returns
   * @memberof ScoringElementsTable
   */
  renderWeight(type = '', dataLists = []) {
    if (!dataLists.length || !type) {
      return null;
    }

    const weightType = this.getWeightType(type);
    const hasWeight = dataLists.filter((data) => data && weightType in data);
    if (!hasWeight) {
      return null;
    }

    const ScoreElementWeight = hasWeight[0][weightType] || 0;

    return (
      <div>
        {intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重')} : &nbsp; {ScoreElementWeight}%
      </div>
    );
  }

  /**
   * 判断权重的类型
   *
   * @param {string} [title='']
   * @returns
   * @memberof ScoringElementsTable
   */
  getWeightType(title = '') {
    let type = '';
    switch (title) {
      case 'BUSINESS':
        type = 'businessWeight';
        break;
      case 'TECHNOLOGY':
        type = 'technologyWeight';
        break;
      default:
        type = 'weight';
        break;
    }

    return type;
  }

  _renderTableList(title = '', type = '', dataLists = []) {
    const { loading, openAssignExpertModal, customizeTable } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateCode`).d('要素编码'),
        dataIndex: 'indicateCode',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.remark`).d('评分细则'),
        dataIndex: 'indicateRemark',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重'),
        dataIndex: 'weight',
        width: 120,
        render: (val, record) => (
          <React.Fragment>{record.indicateType === 'SCORE' ? val : ''}</React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.minScore`).d('最低分'),
        dataIndex: 'minScore',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.maxScore`).d('最高分'),
        dataIndex: 'maxScore',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertAssign`).d('专家分配'),
        dataIndex: 'action',
        width: 100,
        render: (val, record) =>
          record._status === 'update' ? (
            <Form.Item>
              <a onClick={() => openAssignExpertModal(record)}>
                {intl.get(`ssrc.bidHall.view.message.button.view`).d('查看')}
              </a>
            </Form.Item>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'start', marginTop: '20px' }}
        >
          <h4 style={{ marginRight: title ? '40px' : '' }}>{title}</h4>
          {this.renderWeight(type, dataLists)}
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: 'SSRC.BID_HALL_DETAIL.SCORE_INDICS',
            },
            <EditTable
              bordered
              rowKey="evaluateIndicId"
              loading={loading}
              columns={columns}
              pagination={false}
              scroll={{ x: scrollX }}
              dataSource={dataLists}
            />
          )
        ) : (
          <EditTable
            bordered
            rowKey="evaluateIndicId"
            loading={loading}
            columns={columns}
            pagination={false}
            scroll={{ x: scrollX }}
            dataSource={dataLists}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      evaluateAssignModalVisible,
      cancelAssignExpert,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
    } = this.props;

    const expertColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.scoring.expertSubAccount`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.scoring.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.scoring.whetherAssign`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <React.Fragment>
            <Form.Item>
              {record.$form.getFieldDecorator('assignFlag', {
                initialValue: record.assignFlag,
              })(
                <Checkbox
                  disabled
                  defaultValue={record.assignFlag}
                  checkedValue={1}
                  unCheckedValue={0}
                />
              )}
            </Form.Item>
          </React.Fragment>
        ),
      },
    ];

    const scrollX = sum(expertColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        {header.bidRuleType === 'NONE' && this._renderTableList('', '', scoringNoneTempelate)}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList(
            intl.get(`ssrc.bidHall.model.bidHall.businessTeam`).d('商务组'),
            'BUSINESS',
            scoringBusinessTempelate
          )}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList(
            intl.get(`ssrc.bidHall.model.bidHall.technologyTeam`).d('技术组'),
            'TECHNOLOGY',
            scoringTechnologyTempelate
          )}
        <Modal
          visible={evaluateAssignModalVisible}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{intl.get(`ssrc.bidHall.model.bidHall.assignExpert`).d('分配专家')}</span>
            </div>
          }
          footer={null}
          onCancel={cancelAssignExpert}
        >
          <Form>
            <EditTable
              bordered
              columns={expertColumns}
              rowKey="evaluateExpertId"
              loading={fetchEvaluateIndicAssignLoading}
              dataSource={currentScoringExperts}
              srcoll={{ x: scrollX }}
              pagination={false}
            />
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
