import React, { PureComponent } from 'react';
import { Button, Drawer, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import List from './List';
// import styles from './index.less';

@formatterCollections({
  code: ['spfm.supplierKpiIndicator'],
})
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };

    // 方法注册
    ['cancel', 'onTableChange', 'handleFetchFormulaList'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, indicatorRowDataSource = {} } = this.props;
    const { indicatorId } = indicatorRowDataSource;
    return visible && indicatorId && indicatorId !== prevProps.indicatorRowDataSource.indicatorId;
  }

  // applicationId !== prevProps.applicationId
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchFormulaList();
    }
  }

  /**
   * handleFetchFormulaList - 查询公式列表数据
   * @param {Object} params - 查询参数
   */
  handleFetchFormulaList(params = {}) {
    const { fetchFormulaList } = this.props;
    fetchFormulaList(params, (res) => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          dataSource,
          pagination,
        });
      }
    });
  }

  /**
   * onTableChange - 表格分页切换
   * @param {Object} page - 分页参数
   */
  onTableChange(page) {
    // const { getFieldsValue = () => {} } = (this.search || {}).props;
    this.handleFetchFormulaList({ page });
  }

  cancel() {
    const { close = (e) => e } = this.props;
    // const { resetFields = e => e } = this.editorForm;
    // resetFields();
    this.setState({
      dataSource: [],
      pagination: {},
    });
    close();
  }

  render() {
    const { visible, processing = {}, indicatorRowDataSource = {} } = this.props;
    const { dataSource, pagination } = this.state;

    const title = intl
      .get('spfm.supplierKpiIndicator.view.title.formulaConfiguration')
      .d('公式配置');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 600,
    };

    const { indicatorCode, indicatorName } = indicatorRowDataSource;

    const listProps = {
      dataSource,
      pagination,
      openDetail: this.openDetail,
      loading: processing.queryFormulaListOrgLoading,
      onChange: this.onTableChange,
    };

    return (
      <Drawer {...drawerProps}>
        <Row>
          <Col span={12}>
            <Row>
              <Col span={6}>
                {intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.indicatorCode`).d('指标编码')}:
              </Col>

              <Col span={18}>{indicatorCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={6}>
                {intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.releaseNum`).d('指标名称')}:
              </Col>
              <Col span={18}>{indicatorName}</Col>
            </Row>
          </Col>
        </Row>
        <br />
        <List {...listProps} />
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
          <Button onClick={this.cancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </Drawer>
    );
  }
}
