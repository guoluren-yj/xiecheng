import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Button } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { throttle } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import RemarkForm from './remark';

const prefix = `sqam.qualityInspectApproval`;

@formatterCollections({
  code: [
    'sqam.qualityInspectApproval',
    'sqam.incomingInspectionQuery',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'entity.supplier',
    'himp.commentImport',
    'sqam.common',
  ],
})
@connect(({ loading = {}, qualityInspectApproval = {} }) => ({
  fetchListLoading: loading.effects['qualityInspectApproval/fetchList'],
  approvalLoading: loading.effects['qualityInspectApproval/approval'],
  qualityInspectApproval,
  tenantId: getCurrentOrganizationId(),
}))
export default class QualityInspectApproval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    dispatch({ type: 'qualityInspectApproval/fetchLov', payload: { tenantId } });
    setTimeout(this.fetchList, 0);
  }

  @Bind()
  bindForm(form) {
    this.form = form;
  }

  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const { supplierCompanyIdStash, ...vals } = formValues;
    const decisionResults = [];
    Object.keys(vals).forEach((key) => {
      if (key === 'decisionResult' && vals[key] && vals[key].length) {
        decisionResults.push(vals[key]);
        vals[key] = undefined;
      }
    });
    const searchCondition = filterNullValueObject({
      ...vals,
      statusCodes: ['WITHCONFIRM'],
      supplierCompanyId: supplierCompanyIdStash,
      decisionResults,
    });
    dispatch({
      type: 'qualityInspectApproval/fetchList',
      payload: { page, ...searchCondition },
    });
  }

  @Bind()
  handleApproval(approvedCode) {
    const { qualityInspectApproval, dispatch } = this.props;
    const { pagination = {} } = qualityInspectApproval;
    const title =
      approvedCode === 'APPROVED'
        ? intl.get(`hzero.common.view.message.title.approved`).d('审批通过')
        : intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝');
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      style: { width: 400 },
      title,
      children: (
        <RemarkForm
          onRef={(e) => {
            this.remarkRorm = (e.props || {}).form;
          }}
        />
      ),
      okText: intl.get(`hzero.common.view.message.confirm`).d('确认'),
      onOk: () =>
        new Promise((resolve) => {
          const { approvedRemark } = this.remarkRorm.getFieldsValue();
          const { selectedRows } = this.state;
          selectedRows.map((item) => {
            const obj = item;
            obj.approvedRemark = approvedRemark;
            obj.approvedCode = approvedCode;
            return obj;
          });
          dispatch({
            type: 'qualityInspectApproval/approval',
            payload: selectedRows,
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchList(pagination);
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
              resolve();
              this.remarkRorm.resetFields();
            } else {
              resolve(false);
            }
          });
        }),
    });
  }

  @Bind()
  handleSelectRow(selectedRowKeys, rows) {
    const { selectedRows } = this.state;
    // 出现跨页勾选保存勾选数据
    const obj = {};
    const arr = [...selectedRows, ...rows]
      .reduceRight((item, next) => {
        if (!obj[next.inspectionId]) {
          obj[next.inspectionId] = true;
          item.push(next);
        }
        return item;
      }, [])
      .filter((v) => selectedRowKeys.indexOf(v.inspectionId) > -1);
    this.setState({ selectedRowKeys, selectedRows: arr });
  }

  render() {
    const { qualityInspectApproval, fetchListLoading, approvalLoading = false } = this.props;
    const { selectedRowKeys } = this.state;
    const { list = [], enumMap = {}, pagination = {} } = qualityInspectApproval;
    const fiterProps = {
      bindForm: this.bindForm,
      onSearch: this.fetchList,
      enumMap,
    };
    const listProps = {
      dataSource: list,
      loading: fetchListLoading,
      pagination,
      onFetchList: this.fetchList,
      onSelectRow: this.handleSelectRow,
      selectedRowKeys,
    };
    const loading = approvalLoading || fetchListLoading;
    return (
      <Fragment>
        <Header title={intl.get(`${prefix}.view.title.qualityInspectApprval`).d('质量检验审批')}>
          <Button
            icon="check"
            type="primary"
            disabled={selectedRowKeys.length === 0}
            loading={loading}
            onClick={throttle(() => this.handleApproval('APPROVED'), 1500, { trailing: false })}
          >
            {intl.get(`hzero.common.view.message.title.approved`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            disabled={selectedRowKeys.length === 0}
            loading={loading}
            onClick={throttle(() => this.handleApproval('REJECTED'), 1500, { trailing: false })}
          >
            {intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...fiterProps} />
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
