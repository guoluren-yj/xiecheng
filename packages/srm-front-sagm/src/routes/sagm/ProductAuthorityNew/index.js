import React, { Component } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SAGM } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';

import AuthorityTable from './AuthorityTable';
import { tableDs } from './ds';

@formatterCollections({ code: ['sagm.common', 'sagm.productAuthority'] })
@withProps(
  () => {
    const _tableDs = new DataSet(tableDs());
    return { tableDs: _tableDs };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class StrategyConfig extends Component {
  handleCreate = () => {
    this.props.history.push('/s2-mall/sagm/product-authority/detail/create');
  };

  render() {
    return (
      <>
        <Header title={intl.get('sagm.productAuthority.view.buyAuthorityManage').d('采买权限管理')}>
          <Button icon="add" color="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <ExcelExportPro
            templateCode="SAGM_AUTHORITY_LIST_EXPORT"
            buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
            requestUrl={`${SRM_SAGM}/v1/${getCurrentOrganizationId()}/authority-lists/export`}
            queryParams={() => {
              const queryRecord = this.props.tableDs?.queryDataSet?.current;
              if (queryRecord) {
                const queryParams = queryRecord.toJSONData();
                delete queryParams.__dirty;
                delete queryParams.__id;
                delete queryParams._status;
                return filterNullValueObject({ showFlag: 1, ...queryParams });
              }
            }}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
            }}
          />
        </Header>
        <Content>
          <AuthorityTable
            tableDs={this.props.tableDs}
            searchBarTable
            searchBarCode="SAGM.AUTHORITY.LIST.SEARCHBAR"
            customizedCode="SAGM.AUTHORITY.LIST"
            handleCreate={this.handleCreate}
            push={this.props.history.push}
          />
        </Content>
      </>
    );
  }
}
