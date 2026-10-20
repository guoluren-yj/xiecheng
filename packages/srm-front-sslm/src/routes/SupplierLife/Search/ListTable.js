import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { sum, isNumber } from 'lodash';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'querystring';
import { Record } from 'choerodon-ui/dataset';
import EditTable from 'components/EditTable';
import ListTooltip from '@/routes/components/AiApprove/ListTooltip';

/**
 * 申请单数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
@formatterCollections({ code: ['sslm.supplierLifeSearch', 'sslm.common'] })
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   *
   */
  render() {
    const {
      dataSource,
      pagination,
      loading,
      onChange,
      custLoading,
      currentStage,
      customizeTable,
      customizeTableCode,
    } = this.props;
    const reviewFlag = !['REGISTER', 'RECOMMEND', 'POTENTIAL', 'RESERVED', 'ELIMINATED'].includes(
      currentStage.stageCode
    );
    const columns = [
      {
        title: intl
          .get(`sslm.supplierLifeSearch.model.supplierLifeSearch.applyCode`)
          .d('申请单编号'),
        width: 170,
        dataIndex: 'documentNumber',
        render: (val, record) => {
          const { requisitionId, toStageId, gradeCode } = record;
          const queryParams = {
            requisitionId,
            toStageId,
          };
          const dimensionPath = record[`${gradeCode.toLowerCase()}${'ReadPath'}`];
          return <Link to={`${dimensionPath}?${qs.stringify(queryParams)}`}>{val}</Link>;
        },
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.supplierLifeSearch.status`).d('单据状态'),
        width: 100,
        dataIndex: 'processStatusMeaning',
      },
      reviewFlag && {
        dataIndex: 'aiApproveStatus',
        title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
        width: 140,
        render: (value, record) => {
          return value ? (
            <ListTooltip value={value} name="aiApproveStatus" record={new Record(record)} />
          ) : (
            '-'
          );
        },
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.template.code`).d('评分要素编码'),
        dataIndex: 'templateCode',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.template.name`).d('评分要素名称'),
        dataIndex: 'templateName',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.supplierLifeSearch.type`).d('单据类型'),
        width: 100,
        dataIndex: 'gradeCodeMeaning',
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.supplierLifeSearc.from`).d('当前阶段'),
        width: 100,
        dataIndex: 'fromStageDescription',
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.supplierLifeSearc.to`).d('目标阶段'),
        width: 100,
        dataIndex: 'toStageDescription',
      },
      {
        title: intl.get(`sslm.supplierLifeSearch.model.supplierLifeSearch.remark`).d('说明'),
        width: 200,
        dataIndex: 'remark',
      },
      {
        title: intl.get(`sslm.common.view.company.code`).d('公司编码'),
        width: 150,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sslm.common.view.creator.name`).d('创建人'),
        width: 120,
        dataIndex: 'createUserName',
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        width: 120,
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get('sslm.common.model.approve.approveDate').d('审批完成日期'),
        width: 120,
        dataIndex: 'approveDate',
        render: dateRender,
      },
    ].filter(Boolean);

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return customizeTable(
      {
        code: customizeTableCode, // 后端导出原因，个性化暂时不加，后期放开即可
        // code: '',
      },
      <EditTable
        bordered
        resizable
        loading={loading}
        rowKey="requisitionId"
        scroll={{ x: scrollX }}
        custLoading={custLoading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}
