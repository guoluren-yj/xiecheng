/**
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-1-25
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table, Form } from 'hzero-ui';
import { sum, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadModal from 'components/Upload';
import { dateTimeRender, approveNameRender } from 'utils/renderer';
import { queryLovData } from '@/services/create8DService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import ExcelExportPro from 'components/ExcelExportPro';
import moment from 'moment';
import intl from 'utils/intl';
import { isArray } from 'util';
import Search from './Search';

@formatterCollections({
  code: [
    'sqam.common',
    'entity.item',
    'hzero.common',
    'entity.roles',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.attachment',
  ],
})
@withRouter
@Form.create({ fieldNameProp: null })
export default class OperationRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actionList: [],
    };
  }

  componentDidMount() {
    const { handleOperationRecordSearch, isExport, form } = this.props;
    handleOperationRecordSearch();
    if (isExport) {
      if (form && form.resetFields) form.resetFields();
      this.handleGetActionList();
    }
  }

  handleGetActionList = async () => {
    const { formHeaderId } = this.props;
    const resOperate = getResponse(
      await queryLovData({
        lovCode: 'SQAM.CLAIM.RECORD.ACTION',
        formHeaderId,
      })
    );
    if (resOperate) {
      this.setState({ actionList: resOperate });
    }
  };

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  @Bind()
  stringRender(val) {
    if (isArray(val) && !isEmpty(val)) {
      const br = <br />;
      const content = val.map((item) => {
        return (
          <span>
            {item}
            {br}
          </span>
        );
      });
      return content;
    }
    return null;
  }

  @Bind()
  fileRender(val, record) {
    const { processTypeCode } = record;
    if (isArray(val) && !isEmpty(val) && processTypeCode === 'APPEAL') {
      const br = <br />;
      const uuidList = Array.from(new Set(val.map((item) => item.attachmentUuid)));
      const content = uuidList.map((item) => {
        const uploadModalProps = {
          viewOnly: true,
          showFilesNumber: false,
          attachmentUUID: item,
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sqam-claim',
        };
        return (
          <div>
            <UploadModal {...uploadModalProps} />
          </div>
        );
      });
      return content;
    }
    return null;
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['createdDateStart', 'createdDateEnd'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? moment(filterValues[item]).format(DATETIME_MIN)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  @Bind()
  fetchClaimList() {
    const {
      form: { getFieldsValue = (e) => e },
      handleOperationRecordSearch,
    } = this.props;
    const values = this.handleFormQuery(getFieldsValue());
    handleOperationRecordSearch({}, values);
  }

  render() {
    const {
      loading,
      dataSource,
      handleOperationRecordSearch,
      form,
      onCancel,
      pagination,
      isExport,
      formHeaderId,
    } = this.props;
    const { getFieldsValue = (e) => e } = form || {};
    const { actionList } = this.state;
    const columns = [
      {
        title: intl.get('entity.roles.operator').d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.operationTime`).d('操作时间'),
        width: 140,
        dataIndex: 'processedDate',
        render: dateTimeRender,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.action`).d('动作'),
        width: 120,
        dataIndex: 'processTypeMeaning',
        render: approveNameRender,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.common.operationRemarks`).d('操作备注'),
        dataIndex: 'processRemarkList',
        width: 150,
        render: this.stringRender,
      },
      {
        title: intl.get(`sqam.common.model.common.attachment`).d('附件'),
        width: 180,
        dataIndex: 'fileRecordList',
        render: (val, record) => this.fileRender(val, record),
      },
      {
        title: intl.get(`sqam.common.model.common.beforeModify`).d('修改前'),
        dataIndex: 'oldValues',
        onCell: this.onCell,
        width: 150,
        render: this.stringRender,
      },
      {
        title: intl.get(`sqam.common.model.common.afterModify`).d('修改后'),
        dataIndex: 'newValues',
        onCell: this.onCell,
        width: 150,
        render: this.stringRender,
      },
    ];
    // const modalProps = {
    //   visible,
    //   width: 1100,
    //   footer: null,
    //   onCancel: hideModal,
    //   bodyStyle: { maxHeight: '600px', overflow: 'auto' },
    //   title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    // };
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'recordId',
      onChange: handleOperationRecordSearch,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    const searchProps = {
      form,
      fetchClaim: this.fetchClaimList,
      actionList,
      isExport,
    };
    return (
      <>
        <Search {...searchProps} />
        <br />
        <Table {...tableProps} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e8e8e8',
            marginTop: '24px',
            padding: '10px 10px 0px 10px',
          }}
        > 
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SQAM_CLAIM_FORM_HEADER_RECORE" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
              color: 'primary',
            }}
            requestUrl={`/sqam/v1/${getCurrentOrganizationId()}/claim-form-records/record/export`}
            queryParams={{
              formHeaderId,
              ...this.handleFormQuery(getFieldsValue()),
            }}
            allBody
            method="POST"
            beforeClick={()=>{
              if(isFunction(onCancel)){
                onCancel();
              }
              return true;
            }}
          />
        </div>
      </>
    );
  }
}
