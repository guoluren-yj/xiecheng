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
import { isFunction, sum, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadModal from 'components/Upload';
import { dateTimeRender } from 'utils/renderer';
import { DATETIME_MIN } from 'utils/constants';
import moment from 'moment';
import intl from 'utils/intl';
import { isArray } from 'util';
import { BKT_HWFP } from 'utils/config';
import { approveNameRender } from '@/utils/utils';

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
    this.state = {};
  }

  componentDidMount() {
    const { handleOperationRecordSearch } = this.props;
    handleOperationRecordSearch();
  }

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
    if (isFunction(handleOperationRecordSearch)) {
      handleOperationRecordSearch({}, values);
    }
  }

  render() {
    const { loading, dataSource, handleOperationRecordSearch, pagination } = this.props;
    const columns = [
      {
        title: intl.get('sqam.common.model.qualityRectification.approvalSequence').d('审批流'),
        dataIndex: 'processDefinitionMeaning',
        width: 100,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.approveName`).d('审批节点'),
        width: 140,
        dataIndex: 'name',
        render: (val, record) => {
          return ['startEvent', 'endEvent'].includes(record.actType)
            ? approveNameRender(record.actType)
            : val;
        },
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.assigneeName`).d('审批人'),
        width: 120,
        dataIndex: 'assigneeName',
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.common.action`).d('审批操作'),
        dataIndex: 'action',
        width: 150,
        render: approveNameRender,
      },
      {
        title: intl.get(`sqam.common.model.common.endTime`).d('审批时间'),
        width: 180,
        dataIndex: 'endTime',
        render: dateTimeRender,
      },
      {
        title: intl.get(`sqam.common.model.common.comment`).d('审批说明'),
        dataIndex: 'comment',
        width: 150,
      },
      {
        title: intl.get('sqam.common.model.common.attachment').d('附件'),
        dataIndex: 'attachmentUuid',
        render: (val, record) => {
          if (record.attachmentUuid) {
            return (
              <UploadModal
                attachmentUUID={val}
                bucketName={BKT_HWFP}
                bucketDirectory="hwfp01"
                viewOnly
              />
            );
          }
        },
      },
    ];
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
    return <Table {...tableProps} />;
  }
}
