/**
 * ModalTable - 评分要素模态框Table
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';

import FilterForm from '../Elements/FilterForm';

const promptCode = 'ssrc.score';

/**
 * 评分要素模态框Table
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ score, loading }) => ({
  score,
  loading: loading.effects['score/fetchElementsModal'],
}))
export default class ModalTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onBindSearch } = props;
    if (onBindSearch) onBindSearch(this.handleSearchElements);
    this.state = {
      rowKey: 'indicateId',
      dataListName: 'modalList',
      pagination: 'modalPagination',
      selectedRows: [],
    };
  }

  componentDidMount() {
    const {
      score: { modalPagination = {} },
    } = this.props;
    this.handleSearchElements(modalPagination);
  }

  /* eslint-disable-next-line */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      visible,
      score: { modalPagination = {} },
    } = this.props;
    if (nextProps.visible === true && nextProps.visible !== visible) {
      this.handleSearchElements(modalPagination);
    }
  }

  /**
   * 查询评分模板定义
   * @param {Object} page
   */
  @Bind()
  handleSearchElements(page = {}) {
    const {
      dispatch,
      templatePurpose,
      // indicateType = 'SCORE',
      expertCategory,
      score: { elementsDetailList = [] },
    } = this.props;
    const form = this.filterForm;
    const filterValues = form ? form.getFieldsValue() : {};
    const indicateIds = elementsDetailList.map((o) => o.indicateId);
    let params = {};
    if (['PREQUALIFICATION', 'INITIAL_REVIEW', 'POSTQUALIFICATION'].includes(templatePurpose)) {
      params = {
        page,
        ...filterValues,
        enabledFlag: 1,
        indicateIds: indicateIds.join(','),
        indicateType: 'PASS',
        // expertCategory,
      };
    } else {
      params = {
        page,
        ...filterValues,
        enabledFlag: 1,
        indicateIds: indicateIds.join(','),
        // indicateType,
        expertCategory,
      };
    }
    dispatch({
      type: 'score/fetchElementsModal',
      payload: params,
    });
  }

  /**
   * 新增行
   */
  @Bind()
  handleCreateRows() {
    const { onCreateRows } = this.props;
    const { selectedRows } = this.state;
    onCreateRows(selectedRows);
    this.setState({ selectedRows: [] });
  }

  /**
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.setState({ selectedRows: [] });
    this.props.onHideModal();
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  render() {
    const { loading, visible, score = {} } = this.props;
    const { rowKey, dataListName, pagination, selectedRows } = this.state;

    const filterProps = {
      onSearch: this.handleSearchElements,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      selectedRowKeys: selectedRows.map((o) => o[rowKey]),
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.score.indicateCode`).d('评分要素编码'),
        dataIndex: 'indicateCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.score.indicateName`).d('评分要素名称'),
        dataIndex: 'indicateName',
        width: 150,
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.score.indicateType`).d('评分要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.score.elements.remark`).d('评分细则'),
        dataIndex: 'remark',
        width: 150,
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Modal
          width={770}
          bodyStyle={{ padding: 0 }}
          visible={visible}
          onOk={this.handleCreateRows}
          onCancel={this.handleModalHide}
        >
          <React.Fragment>
            <Header title={intl.get(`${promptCode}.view.message.elements`).d('评分要素')} />
            <Content>
              <div className="table-list-search">
                <FilterForm {...filterProps} />
              </div>
              <EditTable
                bordered
                loading={loading}
                rowKey={rowKey}
                dataSource={score[dataListName]}
                columns={columns}
                pagination={score[pagination]}
                rowSelection={rowSelection}
                onChange={this.handleSearchElements}
              />
            </Content>
          </React.Fragment>
        </Modal>
      </React.Fragment>
    );
  }
}
