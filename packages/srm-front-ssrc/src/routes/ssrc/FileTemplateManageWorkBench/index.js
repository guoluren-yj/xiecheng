import React from 'react';
import { observer } from 'mobx-react';
import { flow } from 'lodash';
import { DataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getActiveTabKey } from 'utils/menuTab';
import { getResponse } from 'utils/utils';

import { enableListTemplate } from '@/services/fileTemplateManageService';

import { getCustomizeUnitCode } from './utils/utils';
import { renderStatusTag } from './utils/renderer';
import { tableDS } from './store/tableListDS';

const Index = observer((props) => {
  const { fileTemplateListDS, history, customizeTable } = props;

  // create
  const handleCreate = () => {
    history.push({
      pathname: `${getActiveTabKey()}/create`,
    });
  };

  // edit
  const handleEdit = ({ record } = {}) => {
    const fileManageId = record.get('fileManageId');
    if (!fileManageId) return;
    history.push({
      pathname: `${getActiveTabKey()}/update/${fileManageId}`,
    });
  };

  // disabled or enabled file template
  const handleOperateTemplate = ({ record } = {}) => {
    const { enabledFlag, fileManageId } = record.get(['enabledFlag', 'fileManageId']) || {};
    return enableListTemplate({
      enabledFlag: enabledFlag ? 0 : 1,
      fileManageId,
    }).then((res) => {
      if (getResponse(res)) {
        // refresh list
        fileTemplateListDS.query(fileTemplateListDS.currentPage);
      }
    });
  };

  // operate
  const renderOperation = ({ record } = {}) => {
    return [
      <Button funcType="link" onClick={() => handleEdit({ record })}>
        {intl.get('hzero.common.button.edit').d('编辑')}
      </Button>,
      <Button
        funcType="link"
        onClick={() => handleOperateTemplate({ record })}
        style={{ marginLeft: '16px' }}
      >
        {record.get('enabledFlag')
          ? intl.get('hzero.common.button.disable').d('禁用')
          : intl.get('hzero.common.status.enable').d('启用')}
      </Button>,
    ];
  };

  // table columns
  const columns = [
    {
      name: 'enabledFlag',
      renderer: ({ value }) => renderStatusTag(value),
    },
    {
      name: 'operate',
      renderer: renderOperation,
    },
    { name: 'fileManageName' },
    { name: 'fileTypeMeaning' },
    { name: 'createdByName' },
    { name: 'creationDate' },
  ];

  return (
    <>
      <Header
        title={intl
          .get('ssrc.fileTemplateManage.view.title.fileManageTemplateWorkBench')
          .d('招标文件模板管理')}
      >
        <Button icon="add" color="primary" onClick={handleCreate}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        {customizeTable(
          {
            code: getCustomizeUnitCode('table'),
          },
          <SearchBarTable
            virtual
            virtualCell
            cacheState
            searchCode={getCustomizeUnitCode('filterCode')}
            dataSet={fileTemplateListDS}
            columns={columns}
            style={{
              maxHeight: 'calc(100vh - 240px)',
            }}
          />
        )}
      </Content>
    </>
  );
});

export default flow([
  WithCustomizeC7N({
    unitCode: [getCustomizeUnitCode('filterCode'), getCustomizeUnitCode('table')],
  }),
  withProps(
    () => {
      // 缓存dataset
      const fileTemplateListDS = new DataSet(
        tableDS({
          customizeUnitCode: `${getCustomizeUnitCode('filterCode')},${getCustomizeUnitCode('table')}`,
        })
      );
      return {
        fileTemplateListDS,
      };
    },
    { cacheState: true }
  ),
  formatterCollections({
    code: ['ssrc.fileTemplateManage', 'hzero.common', 'ssrc.common'],
  }),
])(Index);
