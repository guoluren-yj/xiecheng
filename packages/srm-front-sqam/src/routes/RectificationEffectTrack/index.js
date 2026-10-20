/**
 * 质量整改成效追踪
 * @date: 2020-5-14
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import AssociationModal from '../components/AssociationModal';

const promptCode = 'sqam.common.view.message.title';

@connect(({ rectificationEffectTrack, loading }) => ({
  rectificationEffectTrack,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['rectificationEffectTrack/fetch8D'],
  loadingAssociation: loading.effects['rectificationEffectTrack/fetchAssociation'],
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.roles',
    'entity.item',
    'entity.company',
    'entity.supplier',
    'entity.business',
    'entity.organization',
    'entity.attachment',
  ],
})
@withCustomize({
  unitCode: ['SQAM.EFFECT_TRACK_LIST.FILTER', 'SQAM.EFFECT_TRACK_LIST.GRID'],
})
export default class RectificationEffectTrack extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'rectificationEffectTrack/fetchLov' });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && !this.props.custLoading) {
      const {
        rectificationEffectTrack: { pagination = {} },
        location: { state: { _back } = {} },
      } = this.props;
      // 校验是否从详情页返回
      const page = isUndefined(_back) ? {} : pagination;
      this.handleSearch(page);
    }
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const { supplierCompanyIdStash, ...vals } = formValue;
      const values = {
        ...vals,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        validateDateFrom:
          formValue.validateDateFrom && formValue.validateDateFrom.format(DATETIME_MIN),
        validateDateTo: formValue.validateDateTo && formValue.validateDateTo.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'rectificationEffectTrack/fetch8D',
      payload: {
        tenantId,
        page,
        pageEntryPoint: 'CUSTOMER_OWNED',
        problemStatusCodes: ['COMPLETED', 'VALIDATED', 'VALIDATED_REJECTED'].join(),
        ...filterValues,
        supplierCompanyId: filterValues.supplierCompanyIdStash,
        customizeUnitCode: 'SQAM.EFFECT_TRACK_LIST.FILTER,SQAM.EFFECT_TRACK_LIST.GRID',
        problemStatusCodeParamList: filterValues?.problemStatus,
      },
    });
  }

  @Bind()
  showModal(problemHeaderId) {
    this.setState({ visible: true, problemHeaderId, isStartPage: true });
  }

  @Bind()
  hideModal() {
    this.setState({ visible: false });
  }

  /**
   * 关联8d查询
   */
  @Bind()
  fetchAssociation() {
    const { dispatch } = this.props;
    const { problemHeaderId } = this.state;
    dispatch({
      type: 'rectificationEffectTrack/fetchAssociation',
      payload: { problemHeaderId },
    });
  }

  render() {
    const { visible, problemHeaderId, isStartPage } = this.state;
    const {
      rectificationEffectTrack: {
        status,
        actions,
        list,
        pagination,
        associationList,
        issueType = [],
        significance = [],
        urgency = [],
        rectifyTypeCode = [],
        problemSource = [],
      },
      loading,
      dispatch,
      tenantId,
      loadingAssociation,
      customizeFilterForm,
      customizeTable,
    } = this.props;
    const filterProps = {
      problemSource,
      urgency,
      rectifyTypeCode,
      issueType,
      significance,
      actions,
      loading,
      tenantId,
      customizeFilterForm,
      status: status.filter((item) => ['COMPLETED', 'VALIDATED'].includes(item.value)),
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.form = (node.props || {}).form;
      },
    };
    const listProps = {
      loading,
      pagination,
      dataSource: list,
      showModal: this.showModal,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
      customizeTable,
    };
    const modalProps = {
      dispatch,
      visible,
      location,
      isStartPage,
      onCancel: this.hideModal,
      problemHeaderId,
      associationList,
      loadingAssociation,
      fetchAssociation: this.fetchAssociation,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`${promptCode}.qualityRectification.effectTrack`).d('质量整改成效追踪')}
        />
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
        {visible && <AssociationModal {...modalProps} />}
      </Fragment>
    );
  }
}
