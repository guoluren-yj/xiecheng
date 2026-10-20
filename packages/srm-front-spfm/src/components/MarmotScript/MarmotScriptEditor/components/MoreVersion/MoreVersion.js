import React, { useState, useEffect } from 'react';
import { DataSet, Select, Modal } from 'choerodon-ui/pro';
import { withRouter } from 'dva/router';
import { isEmpty } from 'lodash';
import crypto from 'crypto-js';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_ADAPTOR } from '_utils/config';
import CodeCompare from './CodeCompare/index';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${organizationId}` : `${SRM_ADAPTOR}/v1`;

function MoreVersion(props = {}) {
  const [currentSelectDs, handleCurrentSelectDs] = useState('');
  const [currentDsType, handleCurrentDsType] = useState('marmot');
  const { relTableSelectVersion = {}, showSelectVersion = '' } = props;

  useEffect(() => {
    queryDsData();
  }, []);

  const queryDsData = () => {
    if (props.lineId && isEmpty(relTableSelectVersion)) {
      if (showSelectVersion === 'relTableAction') {
        optionActionDs.setQueryParameter('actionId', props.lineId);
        optionActionDs.query().then(() => {
          handleCurrentDsType('relTableAction');
          handleCurrentSelectDs(selectionActionDs);
        });
      } else {
        optionPageDs.setQueryParameter('lineId', props.lineId);
        optionPageDs.query().then((res) => {
          optionPageDs.loadData(res);
          handleCurrentSelectDs(selectionDs);
        });
      }
    } else if (!isEmpty(relTableSelectVersion)) {
      const { associativeId, dataSource } = relTableSelectVersion;
      optionPageRelTableDs.setQueryParameter('associativeId', associativeId);
      optionPageRelTableDs.setQueryParameter('dataSource', dataSource);
      optionPageRelTableDs.query().then((res) => {
        if (res) {
          handleCurrentDsType('relTable');
          handleCurrentSelectDs(selectionRelTableDs);
        }
      });
    }
  };

  const optionPageDs = new DataSet({
    autoQuery: false,
    selection: 'single',
    paging: false,
    transport: {
      read: {
        url: `${requestUrlPre}/adaptor-task-line-versions/version`, // 获取历史版本数据接口名
        method: 'GET',
      },
    },
  });

  const selectionDs = new DataSet({
    autoQuery: true,
    fields: [
      {
        name: 'historyDs',
        type: 'object',
        textField: 'showVersion',
        valueField: 'showVersion',
        label: intl.get('spfm.scriptSearch.view.title.versionHistory').d('历史版本'),
        options: optionPageDs, // 下拉框选项数据源需要绑定一个Dataset
        ignore: 'always',
      },
      {
        name: 'showVersion',
        bind: 'historyDs.showVersion',
      },
      {
        name: 'scriptContent',
        bind: 'historyDs.scriptContent',
      },
    ],
  });

  // 配置表的历史记录
  const optionPageRelTableDs = new DataSet({
    autoQuery: false,
    selection: 'single',
    paging: false,
    fields: [
      {
        name: 'version',
        transformResponse: (value, record) => {
          return `${value} ${intl
            .get('spfm.scriptSearch.modal.view.recordCreatedRealName')
            .d('修改人')}:${record.recordCreatedRealName}`;
        },
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `/sada/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-record-history/${
            relTableSelectVersion.tableCode
          }`,
          method: 'POST',
          data: {
            ...data,
            ...params,
          },
        };
      },
    },
  });

  const selectionRelTableDs = new DataSet({
    autoQuery: true,
    fields: [
      {
        name: 'historyDs',
        type: 'object',
        textField: 'version',
        valueField: 'version',
        label: intl.get('spfm.scriptSearch.view.title.versionHistory').d('历史版本'),
        options: optionPageRelTableDs,
        ignore: 'always',
      },
      {
        name: 'showVersion',
        bind: 'historyDs.version',
      },
      {
        name: 'scriptContent',
        bind: `historyDs.${
          !isEmpty(relTableSelectVersion) ? relTableSelectVersion.textObj.name : ''
        }`,
      },
    ],
  });

  // 配置表动作的历史记录
  const optionActionDs = new DataSet({
    autoQuery: false,
    selection: 'single',
    paging: false,
    fields: [
      {
        name: 'version',
        transformResponse: (value, record) => {
          return `${value} ${intl
            .get('spfm.scriptSearch.modal.view.recordCreatedRealName')
            .d('修改人')}:${record.realName || ''}`;
        },
      },
    ],
    transport: {
      read: {
        url: `${requestUrlPre}/rel-table-action-version/version`,
        method: 'GET',
      },
    },
  });

  const selectionActionDs = new DataSet({
    autoQuery: true,
    fields: [
      {
        name: 'historyDs',
        type: 'object',
        textField: 'version',
        valueField: 'version',
        label: intl.get('spfm.scriptSearch.view.title.versionHistory').d('历史版本'),
        options: optionActionDs,
        ignore: 'always',
      },
      {
        name: 'showVersion',
        bind: 'historyDs.version',
      },
      {
        name: 'scriptContent',
        bind: 'historyDs.script',
      },
    ],
  });

  const changeSelect = (record) => {
    if (!record && !record.toData()) {
      return;
    }
    const { script } = props.scriptCodeDs.toData()[0];
    if (record.get('showVersion') === '' || record.get('showVersion') === null) {
      Modal.info({
        title: intl.get('spfm.scriptSearch.modal.info.noSelection').d('未选择版本'),
        children: intl.get('spfm.scriptSearch.modal.info.please').d('请选择版本'),
      });
      return;
    }
    let scriptCode = '';
    if (currentDsType === 'relTable') {
      const { name } = relTableSelectVersion.textObj;
      scriptCode = record.get(name) || '';
    } else if (currentDsType === 'relTableAction') {
      scriptCode = record.get('script');
    } else {
      scriptCode = record.get('scriptContent');
    }
    const currentCode =
      currentDsType !== 'relTable'
        ? scriptCode
        : crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(scriptCode));
    // 已选中版本
    const modal = Modal.open({
      title: intl.get('spfm.scriptSearch.modal.code.compare').d('代码比对'),
      closable: true,
      movable: false, // 禁止移动
      // fullScreen: true,
      destroyOnClose: true,
      style: { width: '70vw', height: '70vh' },
      bodyStyle: { width: '100%', height: 'calc(100% - 120px)', overflow: 'auto' },
      footer: (okBtn) => okBtn,
      children: (
        <CodeCompare
          oriCode={script}
          modal={modal}
          currentCode={currentCode}
          oriTitle={intl.get('spfm.scriptSearch.modal.code.latestVersion').d('现版本代码')}
          currentTitle={
            currentDsType === 'marmot'
              ? record.toJSONData().showVersion
              : record.toJSONData().version
          }
          changeScriptArea={props.changeScriptArea}
        />
      ),
    });
  };

  return (
    <Select
      placeholder={intl.get('spfm.scriptSearch.view.option.selectMoreVersion').d('更多版本')}
      style={{ width: 240, height: 33, margin: '0 26px 0 0' }}
      dataSet={currentSelectDs}
      optionRenderer={({ record, value }) => (
        <span onClick={() => changeSelect(record)}>{value}</span>
      )}
      onClear={() => {
        queryDsData();
      }}
      name="historyDs"
    />
  );
}

export default formatterCollections({
  code: ['spfm.scriptSearch', 'hzero.common'],
})(withRouter(MoreVersion));
