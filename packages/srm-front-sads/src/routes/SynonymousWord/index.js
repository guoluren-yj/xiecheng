import React, { useMemo } from 'react';
import { flowRight } from 'lodash';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import ExcelExportPro from 'components/ExcelExportPro';
import ImportButton from 'components/Import';

import { Header, Content } from 'components/Page';
import { DataSet, Form, Button, Icon, TextField, Select } from 'choerodon-ui/pro';

import { ObserverBtn, DropdownMenuBtns } from '@/components/CommonButtons';
import c7nModal from '@/utils/c7nModal';
import { tableDS, formDS } from './ds';

function SynonymousWord() {
  const tableDs = useMemo(() => new DataSet(tableDS()), []);

  const columns = useMemo(
    () => [
      {
        name: 'synonymGroupCode',
        width: 250,
        renderer: ({ value, record }) => <a onClick={() => handleEdit(record)}>{value}</a>,
      },
      {
        name: 'synonymGroup',
      },
    ],
    []
  );

  const handleSearch = () => {
    tableDs.query(tableDs.currentPage);
  };
  const getQueryParams = () => {
    return tableDs.queryDataSet?.current?.toData();
  };
  const handleDelete = async () => {
    const data = tableDs.selected;
    const res = getResponse(
      await tableDs.delete(data, {
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('sads.synonymousWord.view.confirm.delete').d('确认删除选中行'),
      })
    );
    if (res) {
      handleSearch();
    }
  };
  const handleEdit = (record) => {
    const ds = new DataSet(formDS());
    if (record) {
      ds.current.set(record.toData());
    }
    c7nModal({
      title: record
        ? intl.get('sads.synonymousWord.view.editWords').d('编辑词组')
        : intl.get('sads.synonymousWord.view.createWords').d('新建词组'),
      style: { width: 380 },
      children: (
        <Form dataSet={ds} columns={1} labelLayout="float">
          <TextField name="synonymGroupCode" />
          <Select name="synonymGroupList" combo />
        </Form>
      ),
      onOk: async () => {
        const flag = await ds.validate();
        if (!flag) {
          return false;
        }
        const res = getResponse(await ds.submit());
        if (res) {
          handleSearch();
          return true;
        }
        return false;
      },
    });
  };
  return (
    <>
      <Header title={intl.get('sads.synonymousWord.view.title').d('同义词库')}>
        <DropdownMenuBtns
          width={100}
          menus={[
            {
              text: intl.get('hzero.common.button.handleadd').d('手工新建'),
              onClick: () => handleEdit(null),
            },
            {
              childRef: (
                <ImportButton
                  prefixPatch="/sads"
                  refreshButton
                  changeServicePrefix
                  buttonText={intl.get('sads.synonymousWord.button.import').d('导入')}
                  // buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
                  successCallBack={handleSearch}
                  buttonProps={{
                    icon: '',
                    funcType: 'flat',
                  }}
                  businessObjectTemplateCode="SEARCH.SYNONYMOUS"
                />
              ),
            },
          ]}
        >
          <Button icon="add" color="primary">
            {intl.get('hzero.common.button.create').d('新建')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        </DropdownMenuBtns>
        <ObserverBtn
          dataSet={tableDs}
          icon="delete_sweep"
          getDisabled={(data) => data.length === 0}
          onClick={handleDelete}
        >
          {intl.get('hzero.common.button.batchDelete').d('批量删除')}
        </ObserverBtn>
        <Observer>
          {() => (
            <ExcelExportPro
              buttonText={
                tableDs.selected.length > 0
                  ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出')
                  : intl.get('hzero.common.view.button.export').d('导出')
              }
              requestUrl="/sads/v1/search-synonymouss/list-export"
              exportAsync
              templateCode="SRM_C_SADS_SEARCH_SYNONYMOUS_EXPORT"
              queryParams={
                tableDs.selected.length > 0
                  ? {
                      synonymousIdList: tableDs.selected
                        .map((m) => m.get('synonymousId'))
                        .join(','),
                    }
                  : getQueryParams()
              }
              otherButtonProps={{
                funcType: 'flat',
                icon: 'unarchive',
                type: 'c7n-pro',
              }}
            />
          )}
        </Observer>
      </Header>
      <Content>
        <SearchBarTable
          searchCode="SYNONYMOUS_WORD.LIST.SEARCHBAR"
          customizedCode="SYNONYMOUS_WORD.LIST"
          style={{ maxHeight: 'calc(100vh - 196px)' }}
          dataSet={tableDs}
          columns={columns}
        />
      </Content>
    </>
  );
}

export default flowRight(
  formatterCollections({ code: ['sads.synonymousWord', 'hzero.common', 'smpc.product'] })
)(SynonymousWord);
