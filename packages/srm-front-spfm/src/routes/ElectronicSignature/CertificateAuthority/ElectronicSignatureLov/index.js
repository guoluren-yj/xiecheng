import React, { Component } from 'react';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import electronicSignatureDs from './electronicSignatureDs';

@formatterCollections({
  code: ['entity.company', 'hzero.common'],
})
export default class ElectronicSignatureLov extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 获取开通电子签服务地址
   *
   */
  @Bind()
  fetchElectronicSignatureUrl(select) {
    const { dispatch, onRefreshList = () => {} } = this.props;
    dispatch({
      type: 'certificateAuthority/fetchElectronicSignatureUrl',
      payload: {
        tenantId: getCurrentOrganizationId(),
        ...select,
      },
    }).then((res) => {
      if (res && res.includes('http')) {
        window.open(res);
      } else {
        const parseStr = JSON.parse(res);
        notification.error({ message: parseStr.message });
        onRefreshList();
      }
    });
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        title: intl.get(`entity.company.companyCode`).d('公司编码'),
        name: 'companyNum',
        width: 250,
      },
      {
        title: intl.get('entity.company.companyName').d('公司名称'),
        name: 'companyName',
        width: 250,
      },
    ];
    return columns;
  }

  @Bind()
  openModel() {
    const { queryParams } = this.props;
    const columns = this.getColumns();
    const title = intl.get(`entity.company.selectGroupCompany`).d('请选择集团公司');
    this.recordDS = new DataSet(electronicSignatureDs(queryParams));
    this.recordDS.query();
    Modal.open({
      key: Modal.key(),
      title,
      closable: true,
      style: {
        width: 800,
      },
      children: (
        <div>
          <Table
            border={false}
            queryFieldsLimit={2}
            rowHeight={32}
            dataSet={this.recordDS}
            columns={columns}
          />
        </div>
      ),
      onOk: () => {
        const select = this.recordDS.selected[0]?.toData();
        this.fetchElectronicSignatureUrl(select);
      },
      onCancel: () => null,
      afterClose: () => null,
    });
  }

  render() {
    const { disabled } = this.props;
    return (
      <span>
        <Button
          icon="approval-o"
          funcType="flat"
          onClick={disabled ? () => {} : this.openModel}
          disabled={disabled}
        >
          {intl.get(`hzero.common.button.openElectronicSignatureService`).d('开通电子签章服务')}
        </Button>
      </span>
    );
  }
}
