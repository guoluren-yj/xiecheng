/**
 * 配置表
 * index.js
 * @date: 2020-07-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, useState } from 'react';
import { Table, DataSet, Tooltip, Form, TextField, Button, Icon } from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import { Header } from 'components/Page';
import copy from 'copy-to-clipboard';
import { throttle } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import RelTable from '@/components/RelTable';
import ActionImg from '@/assets/action.png';
import { getRelTableDefinitionDs, getQueryDs } from './store/relTableDefinitionDs';
import style from './index.less';

function RelTableAccess(props = {}) {
  const { relTableDefinitionDs, queryDs } = props.dsValue;
  const [tableCode, handleTableCode] = useState('');
  const [openFlag, handleOpenFlag] = useState(false);

  // 配置表定义表格列
  const definitionTableColumns = [
    {
      header: intl.get('spfm.relTableDefinition.model.relTableDefinition.tableName').d('配置表名'),
      width: 400,
      height: 70,
      tooltip: 'none',
      renderer: ({ dataSet, record }) => {
        const { tableCode: recordTaskCode, tableName, permission } = record.get([
          'tableCode',
          'tableName',
          'permission',
        ]);
        return (
          <div className={style['relTable-cell-div']}>
            <div className="relTable-cell-div-left">
              <div className="relTable-cell-div-left-span">
                <Tooltip title={tableName || '-'} placement="right" theme="light">
                  <span style={{ fontWeight: '450', fontSize: '15px' }}>{tableName}</span>
                </Tooltip>
              </div>
              <div className="relTable-cell-div-left-span">
                {iconRender(dataSet, permission, record)}
                <Tooltip title={recordTaskCode || '-'} placement="right" theme="light">
                  <span
                    style={{ color: '#b6bbc6' }}
                    onDoubleClick={() => copyRelTableCode(recordTaskCode)}
                  >
                    {recordTaskCode}
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  // 双击拷贝配置表编码
  const copyRelTableCode = throttle((recordTaskCode = '') => {
    copy(recordTaskCode);
    message.destroy();
    message.config({ duration: 2 });
    message.success(
      intl.get('spfm.relTableAccess.button.copy.success').d('复制成功'),
      undefined,
      undefined,
      'bottomLeft'
    );
  }, 2000);

  const iconRender = (dataSet, value, record) => {
    const text = dataSet.getField('permission').getText(value, '', record) || '';
    const { color, backgroundColor, iconText } = getIconRenderStyle(value);
    return (
      <Tooltip placement="left" title={text} theme="light">
        <span
          style={{
            border: `1px solid ${color}`,
            fontSize: 8,
            color,
            fontWeight: '600',
            padding: '0 3px',
            marginRight: '8px',
            borderRadius: '8px',
            backgroundColor,
            userSelect: 'none',
          }}
        >
          {iconText}
        </span>
      </Tooltip>
    );
  };

  const getIconRenderStyle = (value) => {
    switch (value) {
      case '1':
        return { color: 'red', backgroundColor: '#fcefec', iconText: 'G' };
      case '4':
        return { color: 'orange', backgroundColor: '#fdf2ea', iconText: 'U' };
      case '2':
        return { color: 'gray', backgroundColor: '#fafafa', iconText: 'T' };
      default:
        return { color: 'gray', backgroundColor: '#fafafa', iconText: 'S' };
    }
  };

  const queryTableAccess = (record = {}) => {
    handleTableCode(record.get('tableCode'));
  };

  const queryForm = () => {
    let tableCodeOrName = '';
    if (queryDs.current) {
      tableCodeOrName = queryDs.current.get('tableCodeOrName');
    }
    relTableDefinitionDs.setQueryParameter('tableCodeOrName', tableCodeOrName);
    relTableDefinitionDs.query();
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.relTableAccess.view.header.title').d('配置表')} />
      <div className={style['rel-table-access']}>
        <div className="rel-table-access-content">
          <div>
            {openFlag ? (
              ''
            ) : (
              <div className="rel-table-access-leftTable">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Form dataSet={queryDs} columns={1} style={{ width: 330 }}>
                    <TextField
                      prefix={
                        <Icon
                          type="search"
                          onClick={() => queryForm()}
                          style={{ cursor: 'pointer' }}
                        />
                      }
                      colSpan={1}
                      name="tableCodeOrName"
                      placeholder={intl
                        .get('spfm.relTableDefinition.model.relTableDefinition.placeholder')
                        .d('请输入配置表编码/表名进行查询')}
                      clearButton
                      onChange={queryForm}
                    />
                  </Form>
                  <Button color="primary" style={{ marginLeft: 10 }} onClick={queryForm}>
                    {intl.get('hzero.common.button.query').d('查询')}
                  </Button>
                </div>
                <Table
                  showHeader={false}
                  dataSet={relTableDefinitionDs}
                  columns={definitionTableColumns}
                  style={{ maxHeight: 'calc(100vh - 292px)' }}
                  rowHeight={50}
                  queryFieldsLimit={1}
                  onRow={({ record }) => {
                    return { onClick: () => queryTableAccess(record) };
                  }}
                />
              </div>
            )}
          </div>
          <div className="rel-table-access-rightTable">
            {openFlag ? (
              <div
                className="rel-table-access-rightTable-openClose"
                onClick={() => handleOpenFlag(false)}
              >
                <div>
                  <img src={ActionImg} alt="" style={{ transform: 'rotateY(180deg)' }} />
                </div>
              </div>
            ) : tableCode ? (
              <div
                className="rel-table-access-rightTable-openClose"
                onClick={() => handleOpenFlag(true)}
              >
                <div>
                  <img src={ActionImg} alt="" />
                </div>
              </div>
            ) : (
              ''
            )}
            <RelTable tableCode={tableCode} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.relTableAccess', 'spfm.relTableDefinition'],
})(
  withProps(
    () => {
      const relTableDefinitionDs = new DataSet(getRelTableDefinitionDs());
      const queryDs = new DataSet(getQueryDs());

      const dsValue = {
        relTableDefinitionDs,
        queryDs,
      };
      return { dsValue };
    },
    { cacheState: true }
  )(RelTableAccess)
);
