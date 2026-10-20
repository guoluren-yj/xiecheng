import React, { useMemo } from 'react';
import { Form, TextField, Tree, DataSet, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { EXPORTURL, EXPORTURL_NO_MERGE } from '@/services/monitorService';

function ExportInfo({ getFileName, onChangeMerge }) {
  const DS = useMemo(
    () =>
      new DataSet({
        id: 'id',
        autoQuery: true,
        idField: 'id',
        parentField: 'parentId',
        checkField: 'checked',
        selection: false,
        expandField: 'expand',
        fields: [
          {
            name: 'title',
            type: 'string',
          },
          {
            name: 'id',
            type: 'number',
          },
          {
            name: 'expand',
            type: 'boolean',
            transformResponse: () => {
              return true;
            },
          },
          {
            name: 'checked',
            type: 'boolean',
            transformResponse: () => {
              return true;
            },
          },
        ],
        transport: {
          read: ({ dataSet }) => {
            return {
              url: dataSet.getState('merge') === 0 ? EXPORTURL_NO_MERGE : EXPORTURL,
              method: 'GET',
            };
          },
        },
      }),
    []
  );

  const nodeRenderer = ({ record }) => {
    return { title: <span>{record?.get('title')}</span>, disableCheckbox: true, checkable: true };
  };

  const changeMerge = (value) => {
    DS.setState({ merge: value });
    DS.query();
    onChangeMerge(value);
  };

  return (
    <>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('hzero.common.view.baseInfo').d('基本信息')}
      >
        <Form columns={1} className="export-search-form">
          <Form.Item label={intl.get('hzero.common.diy.filename').d('自定义文件名')}>
            <TextField onChange={getFileName} />
          </Form.Item>
          <Form.Item label={intl.get('hwfp.common.components.export.merge').d('是否合并')}>
            <Select onChange={changeMerge} defaultValue={1}>
              <Select.Option value={1}>{intl.get('hzero.common.status.yes').d('是')}</Select.Option>
              <Select.Option value={0}>{intl.get('hzero.common.status.no').d('否')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('hzero.common.components.export.choose.a').d('要导出的列')}
      >
        <Tree
          dataSet={DS}
          showLine={{
            showLeafIcon: false,
          }}
          showIcon={false}
          checkable
          disabled
          defaultExpandAll
          treeNodeRenderer={nodeRenderer}
        />
      </Card>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(ExportInfo);
