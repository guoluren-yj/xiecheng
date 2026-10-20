import React, { useState, useEffect } from 'react';
import { Table, DataSet, Modal, Tabs, CodeArea, TextField } from 'choerodon-ui/pro';
import { Icon, message } from 'choerodon-ui';
import { isFunction } from 'lodash';
import copy from 'copy-to-clipboard';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { templateLibraryService } from '../../../marmotScriptService';
import { getTemplateLibraryDs, getQueryFormDs } from './store/index';

function TemplateLibrary(props = {}) {
  const { templateLibraryDs, functionLibraryDs, myTemplateLibraryDs, queryFormDs } = props.valueDs;
  const [tabsKey, handleTabsKey] = useState('universal');

  const changeTabKey = (key) => {
    handleTabsKey(key);
    queryFormDs.reset();
    queryTaskCode(key);
  };

  // 打开预览
  const openPreview = (record) => {
    const templateModals = Modal.open({
      title: record.get('description'),
      children: (
        <div>
          <CodeArea
            value={record.get('content') || ''}
            options={props.jsOptions}
            style={{ height: 'calc(60vh - 160px)' }}
          />
        </div>
      ),
      onOk: () => {
        copyScripts(record);
        templateModals.close();
      },
      okText: intl.get('hzero.common.copy').d('复制'),
      cancelText: intl.get('hzero.common.button.shutDown').d('关闭'),
      closable: true,
      destroyOnClose: true,
      style: {
        width: '50vw',
        height: '60vh',
      },
    });
  };

  const copyScripts = (record) => {
    const currentCode = record.get('content');
    if (currentCode) {
      copy(currentCode);
      message.destroy();
      message.config({ duration: 2 });
      message.success(
        intl.get('spfm.adaptorTaskDetail.button.copy.success').d('复制成功'),
        undefined,
        undefined,
        'bottomLeft'
      );
      if (isFunction(props.closeModal)) {
        props.closeModal();
      }
    }
  };

  const operations = (
    <TextField
      style={{ width: 130 }}
      dataSet={queryFormDs}
      name="code"
      placeholder={intl
        .get('spfm.adaptorTaskDetail.templateLibrary.search.keyWord')
        .d('案例名搜索')}
      prefix={<Icon type="search" onClick={() => queryTaskCode()} style={{ cursor: 'pointer' }} />}
      clearButton
      valueChangeAction="input"
      onEnterDown={() => queryTaskCode()}
      onClear={() => queryTaskCode()}
    />
  );

  const queryTaskCode = (key) => {
    const thisTabsKey = key || tabsKey;
    const queryCode = queryFormDs?.current?.get('code');
    if (thisTabsKey === 'universal') {
      templateLibraryDs.setQueryParameter('keyWord', queryCode);
      templateLibraryDs.setQueryParameter('type', '0');
      templateLibraryDs.query();
    } else if (thisTabsKey === 'function') {
      functionLibraryDs.setQueryParameter('keyWord', queryCode);
      functionLibraryDs.setQueryParameter('type', '1');
      functionLibraryDs.query();
    } else {
      myTemplateLibraryDs.setQueryParameter('keyWord', queryCode);
      myTemplateLibraryDs.query();
    }
  };

  useEffect(() => {
    templateLibraryDs.setQueryParameter('type', '0');
    templateLibraryDs.query();
  }, []);

  const handleTemplateLibraryService = (record) => {
    const { id: templateId, hasStar } = record.get(['id', 'hasStar']);
    templateLibraryService({ templateId, hasStar }).then(() => {
      templateLibraryDs.query();
      functionLibraryDs.query();
      myTemplateLibraryDs.query();
    });
  };

  const getColumns = (type) => {
    const typeFiled = type === 'personal' ? [{ name: 'type', width: 120 }] : [];
    return [
      {
        name: 'description',
        minWidth: 300,
      },
      {
        name: 'contributor',
        width: 120,
      },
      ...typeFiled,
      {
        name: 'star',
        width: 120,
        sortable: true,
      },
      {
        name: 'action',
        width: 240,
        renderer: ({ record }) => {
          return (
            <>
              <span className="action-link">
                <a onClick={() => openPreview(record)}>
                  {intl.get('hzero.common.preview').d('预览')}
                </a>
                <a onClick={() => copyScripts(record)}>{intl.get('hzero.common.copy').d('复制')}</a>
                {type === 'personal' ? (
                  <a onClick={() => handleTemplateLibraryService(record)}>
                    {intl.get('spfm.adaptorTaskDetail.button.delete.templateLibrary').d('取消收藏')}
                  </a>
                ) : !record.get('hasStar') ? (
                  <a onClick={() => handleTemplateLibraryService(record)}>
                    {intl.get('spfm.adaptorTaskDetail.button.add.templateLibrary').d('收藏')}
                  </a>
                ) : (
                  <a onClick={() => handleTemplateLibraryService(record)}>
                    {intl.get('spfm.adaptorTaskDetail.button.delete.templateLibrary').d('取消收藏')}
                  </a>
                )}
              </span>
            </>
          );
        },
      },
    ];
  };

  return (
    <>
      <Tabs defaultActiveKey="1" onChange={changeTabKey} tabBarExtraContent={operations}>
        <Tabs.TabPane
          tab={intl.get('spfm.adaptorTaskDetail.templateLibrary.title.universal').d('通用模板库')}
          key="universal"
        >
          <Table dataSet={templateLibraryDs} columns={getColumns()} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get('spfm.adaptorTaskDetail.templateLibrary.title.function').d('通用函数库')}
          key="function"
        >
          <Table dataSet={functionLibraryDs} columns={getColumns()} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get('spfm.adaptorTaskDetail.templateLibrary.title.personal').d('个人收藏库')}
          key="personal"
        >
          <Table dataSet={myTemplateLibraryDs} columns={getColumns('personal')} />
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.adaptorTaskDetail'],
})(
  withProps(
    () => {
      const templateLibraryDs = new DataSet(getTemplateLibraryDs('all'));
      const functionLibraryDs = new DataSet(getTemplateLibraryDs('all'));
      const myTemplateLibraryDs = new DataSet(getTemplateLibraryDs('personal'));
      const queryFormDs = new DataSet(getQueryFormDs());
      const valueDs = {
        templateLibraryDs,
        functionLibraryDs,
        myTemplateLibraryDs,
        queryFormDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(TemplateLibrary)
);
