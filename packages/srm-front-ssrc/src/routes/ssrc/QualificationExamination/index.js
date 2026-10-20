/**
 * Recommend - 资格审查
 * @date: 2019-03-27
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { isUndefined, isNil } from 'lodash';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import querystring from 'querystring';
import intl from 'utils/intl';
import FilterForm from './FilterForm';

@withCustomize({
  unitCode: ['SSRC_PREQUAL.LIST_TABLE'],
})
@connect(({ qualificationExamination, loading }) => ({
  qualificationExamination,
  loading: loading.effects['qualificationExamination/fetchQualificationDataList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.qualification', 'ssrc.qualiExam', 'ssrc.common'],
})
export default class Qualification extends Component {
  form;

  /**
   *  初始化查询
   */
  componentDidMount() {
    const {
      qualificationExamination: { qualificationPagination = {} },
    } = this.props;
    this.handleSearch(qualificationPagination);
  }

  /**
   *  跳转详情页面
   */
  @Bind()
  goDetail(record) {
    const { sourceProjectId, prequalGroupHeaderId } = record;
    if (isNil(prequalGroupHeaderId)) {
      // 不分组
      return this.props.dispatch(
        routerRedux.push({
          pathname: `/ssrc/qualification-examination/detail/${record.prequalHeaderId}`,
        })
      );
    }
    const search = querystring.stringify({
      sourceProjectId,
    });
    this.props.dispatch(
      routerRedux.push({
        pathname: `/ssrc/qualification-examination/section-detail/${prequalGroupHeaderId}`,
        search,
      })
    );
  }

  /**
   *  跳转rfx详情页面
   */
  @Bind()
  goRfx(record) {
    // 资格审查跳转招标大厅明细
    if (record.prequalCategory === 'BID') {
      this.props.history.push({
        pathname: `/ssrc/qualification-examination/bid-detail/${record.rfxHeaderId}`,
        search: querystring.stringify({
          typeName: 'examinationDetail',
          subjectMatterRule: record.subjectMatterRule,
        }),
      });
      // 资格审查跳转询价大厅明细
    } else {
      this.props.history.push({
        pathname: `/ssrc/qualification-examination/rfx-detail/${record.rfxHeaderId}`,
        search: querystring.stringify({ typeName: 'returnExaminationDetail' }),
      });
    }
    this.props.dispatch({
      type: 'qualificationExamination/updateState',
      payload: {
        historys: '/ssrc/qualification-examination/list',
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      creationDateFrom: fieldValues.creationDateFrom
        ? fieldValues.creationDateFrom.format(DATETIME_MIN)
        : undefined,
      creationDateTo: fieldValues.creationDateTo
        ? fieldValues.creationDateTo.format(DATETIME_MAX)
        : undefined,
    };
    dispatch({
      type: 'qualificationExamination/fetchQualificationDataList',
      payload: {
        page,
        ...fieldValues,
        ...values,
        organizationId,
        customizeUnitCode: 'SSRC_PREQUAL.LIST_TABLE',
      },
    });
  }

  render() {
    const {
      qualificationExamination: { qualificationList = [], qualificationPagination = {} },
      dispatch,
      loading,
      customizeTable = () => {},
    } = this.props;
    const qualificationColumns = [
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.qualificationExamination`).d('资格审查'),
        dataIndex: 'prequalStatus',
        width: 100,
        render: (val, record) =>
          record.enabledSubmitFlag > 0 ? (
            <a onClick={() => this.goDetail(record)}>
              {`${intl.get(`ssrc.qualiExam.model.qualiExam.quotationpre`).d('资格预审')}`}
            </a>
          ) : (
            <a onClick={() => this.goDetail(record)}>
              {`${intl.get(`ssrc.qualiExam.model.qualiExam.quotationView`).d('预审查看')}`}
            </a>
          ),
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.rfxNum`).d('寻源单号'),
        dataIndex: 'rfxNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.goRfx(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.rfxTitle`).d('寻源标题'),
        dataIndex: 'rfxTitle',
        width: 200,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.rfxMethod`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.prequalUserName`).d('审查员'),
        dataIndex: 'prequalUserName',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.quotationStartDate`).d('报价开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.quotationEndDate`).d('报价截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.prequalEndDate`).d('预审截止时间'),
        dataIndex: 'prequalEndDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.releasedDate`).d('创建时间'),
        dataIndex: 'releasedDate',
        width: 150,
      },
    ];
    const filterProps = {
      dispatch,
      onRef: this.handleRef,
      onConditional: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.qualiExam.view.message.qualificationExamination`).d('资格审查')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            { code: 'SSRC_PREQUAL.LIST_TABLE' },
            <Table
              bordered
              rowKey="recordId"
              loading={loading}
              columns={qualificationColumns}
              dataSource={qualificationList}
              pagination={qualificationPagination}
              onChange={(page) => this.handleSearch(page)}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
