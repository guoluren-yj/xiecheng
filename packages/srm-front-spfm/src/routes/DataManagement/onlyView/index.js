/**
 * dataManagementService.js - 资料管理
 * @date: 2019-4-3
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';
import { Table } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { filterNullValueObject } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import OperatorRecordModal from '../OperatorModel';

import FilterForm from './FilterForm';

const promptCode = 'spfm.dataManagement';

@connect(({ loading = {}, dataManagement = {} }) => ({
  fetchListLoading: loading.effects['dataManagement/fetchViewList'],
  fetchOperationRecordListLoading: loading.effects['dataManagement/fetchOperationRecordList'],
  enumMap: dataManagement.enumMap || {},
  dataManagement,
}))
@formatterCollections({
  code: [
    'spfm.dataManagement',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'sqam.incomingInspectionQuery',
    'himp.commentImport',
  ],
})
export default class extends React.Component {
  form;

  state = {
    operationRecordModalVisible: false,
    operationRecordList: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchList();
    dispatch({ type: 'dataManagement/fetchEnum' });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dataManagement/updateState',
      payload: { viewList: [], viewPagination: {} },
    });
  }

  // FilterForm绑定到这里
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  /**
   * fetchlist
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch, viewPagination } = this.props;
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const creationDateFrom = formValues.creationDateFrom
      ? formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const creationDateTo = formValues.creationDateTo
      ? formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT)
      : null;
    // const expireDateFrom = formValues.expireDateFrom
    //   ? formValues.expireDateFrom.format(DEFAULT_DATETIME_FORMAT)
    //   : null;
    // const expireDateTo = formValues.expireDateTo
    //   ? formValues.expireDateTo.format(DEFAULT_DATETIME_FORMAT)
    //   : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      creationDateFrom,
      creationDateTo,
      // expireDateFrom,
      // expireDateTo,
    });
    dispatch({
      type: 'dataManagement/fetchViewList',
      payload: { page: { ...viewPagination, ...page }, ...searchCondition },
    });
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchList({ current: 1, pageSize: 10 });
  }

  // @Bind()
  // async handleModalVisible(k, v, attachmentId) {
  //   if (v) {
  //     await this.setState({ attachmentId });
  //     if (k === 'operationRecordModalVisible') {
  //       this.handleOperationRecordSearch();
  //     }
  //   } else {
  //     this.setState({ attachmentId: -1 });
  //   }
  //   this.setState({ [k]: v });
  // }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { attachmentId } = this.state;
    dispatch({
      type: 'dataManagement/fetchOperationRecordList',
      payload: {
        attachmentId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result,
        });
      }
    });
  }

  render() {
    const {
      dataManagement = {},
      fetchListLoading = false,
      enumMap = {},
      fetchOperationRecordListLoading = false,
    } = this.props;
    const { operationRecordModalVisible = false, operationRecordList = [] } = this.state;
    const { viewList = [], viewPagination = {} } = dataManagement;

    const columns = [
      {
        title: intl.get(`${promptCode}.view.message.model.dataClassCode`).d('资料分类编码'),
        dataIndex: 'dataClassCode',
        key: 'dataClassCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.dataClassName`).d('分类名称'),
        dataIndex: 'dataClassName',
        key: 'dataClassName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.dataManagementTitle`).d('标题'),
        dataIndex: 'title',
        key: 'title',
        width: 150,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        key: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.categoryCode`).d('类别'),
        dataIndex: 'categoryCodeMeaning',
        key: 'categoryCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.file`).d('文件'),
        dataIndex: 'attachmentUuid',
        key: 'attachmentUuid',
        width: 120,
        render: (attachmentUuid, rowData) =>
          rowData.categoryCode === 'DATA' && (
            <Upload
              attachmentUUID={attachmentUuid}
              viewOnly
              filesNumber={rowData.attachmentCount}
              filePreview
              bucketName={PUBLIC_BUCKET}
              bucketDirectory="spfm-comp"
              btnText={`${intl.get(`hzero.common.download.modal.title`).d('附件下载')}`}
            />
          ),
      },
      {
        title: intl.get(`${promptCode}.view.message.model.foreverFlag`).d('是否长期'),
        dataIndex: 'foreverFlag',
        key: 'foreverFlag',
        render: yesOrNoRender,
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.expireDate`).d('到期日'),
        dataIndex: 'expireDate',
        key: 'expireDate',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.lastUpdateDate`).d('最后更新时间'),
        dataIndex: 'lastUpdateDate',
        key: 'lastUpdateDate',
        width: 150,
        render: (text) => text && moment(text).format(DEFAULT_DATETIME_FORMAT),
      },
      // {
      //   title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      //   dataIndex: 'attachmentId',
      //   key: 'attachmentId',
      //   width: 100,
      //   render: (attachmentId) => (
      //     <a
      //       onClick={() =>
      //         this.handleModalVisible('operationRecordModalVisible', true, attachmentId)
      //       }
      //     >
      //       {intl.get(`hzero.common.button.operating`).d('操作记录')}
      //     </a>
      //   ),
      // },
    ];
    const fiterProps = {
      bindForm: this.bindForm,
      handleSearch: this.handleSearch,
      enumMap,
    };
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 150;
    const tableProps = {
      columns,
      rowKey: 'attachmentId',
      dataSource: viewList,
      bordered: true,
      loading: fetchListLoading,
      scroll: { x: scrollX },
      pagination: viewPagination,
      onChange: this.fetchList,
    };
    const operationRecordProps = {
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      fetchOperationRecord: this.handleOperationRecordSearch,
      onCancel: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.dataDownLoad`).d('资料下载')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          <Table {...tableProps} />
          <OperatorRecordModal {...operationRecordProps} />
        </Content>
      </React.Fragment>
    );
  }
}
