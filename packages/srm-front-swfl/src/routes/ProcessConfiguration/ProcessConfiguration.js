/**
 * ProcessConfiguration - 工作流单据整合
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useContext, useCallback } from 'react';
import { Button, Modal, Table } from 'choerodon-ui/pro';
import { omit } from 'lodash';

import { Header } from 'components/Page';
import { getResponse, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { Context } from './store';
import SearchTree from './SearchTree';
import { addRemind, saveDocumentAndCategory, copySiteRecord } from './processConfigurationService';
import ProcessDocument from './ProcessDocument';
import ProcessCategories from './ProcessCategories';
import CreateModal from './CreateModal';
import UnSelectSvg from './UnSelectSvg';
import GlobalConfigModal from './GlobalConfigModal';
import style from './index.less';

const totalSettingKey = Modal.key();
const processCategoryModalKey = Modal.key();
const quotePredefinedModalKey = Modal.key();
export default function ProcessConfiguration() {
  const {
    currentNode = {},
    totalSettingDs,
    processCategoriesDs,
    quotePredefinedDs,
    searchTreeRef,
    emptyFlag,
    leftTreeWidth,
  } = useContext(Context);

  const onSaveTotalSetting = (resolve, reject) => {
    const values = totalSettingDs.current.toJSONData();
    const tooltipList = [
      'approved',
      'rejected',
      'delegate',
      'rebut',
      'addSign',
      'approveAndAddSign',
      'recall',
      'revoke',
      'carbonCopy',
      'remind',
    ];
    const tls = values._tls || {};
    tooltipList.forEach((item) => {
      if (values[item]) {
        if (tls[item]) {
          tls[item][getCurrentLanguage()] = values[item];
        } else {
          tls[item] = { [getCurrentLanguage()]: values[item] };
        }
      }
    });
    addRemind({
      ...omit(values, ['_tls', '__dirty']),
      approvalActionTooltipMap: tls,
    }).then((res) => {
      if (getResponse(res)) {
        totalSettingDs.query();
        notification.success();
        resolve();
      } else {
        reject();
      }
    });
  };

  const openTotalSetting = () => {
    totalSettingDs.query().then((res = {}) => {
      if (totalSettingDs.current) {
        totalSettingDs.current.set('_tls', res.approvalActionTooltipMap || {});
      }
      if (res.approvalActionTooltipMap) {
        Object.keys(res.approvalActionTooltipMap).forEach((paramKey) => {
          totalSettingDs.current.set(
            paramKey,
            res.approvalActionTooltipMap[paramKey][getCurrentLanguage() || 'zh_CN']
          );
        });
      }
      Modal.open({
        drawer: true,
        key: totalSettingKey,
        title: intl.get('swfl.processConfiguration.view.button.totalSetting').d('全局设置'),
        className: style['process-configuration-global-config'],
        style: {
          width: '520px',
        },
        destroyOnClose: true,
        children: (
          <GlobalConfigModal
            dataSet={totalSettingDs}
            approvalActionSeqDataMap={res.approvalActionSeqDataMap || undefined} // 此字段会为 null ，传递undefined防止赋初始值失败
          />
        ),
        onOk: () => new Promise((resolve, reject) => onSaveTotalSetting(resolve, reject)),
        onClose: () => totalSettingDs.reset(),
      });
    });
  };

  const onSaveDocumentAndCategory = (resolve, reject) => {
    const { selectTreeNode } = searchTreeRef.current;
    saveDocumentAndCategory({
      ...processCategoriesDs.current.toJSONData(),
    })
      .then((res) => {
        if (getResponse(res)) {
          selectTreeNode(res, true);
          notification.success();
          resolve();
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        reject(err);
      });
  };

  const createProcessDocument = () => {
    processCategoriesDs.create();
    Modal.open({
      drawer: true,
      key: processCategoryModalKey,
      title: intl.get('hzero.common.button.create').d('新建'),
      style: {
        width: '380px',
      },
      children: <CreateModal isEditCategories={false} dataSet={processCategoriesDs} />,
      onOk: () => new Promise((resolve, reject) => onSaveDocumentAndCategory(resolve, reject)),
      onClose: () => processCategoriesDs.reset(),
    });
  };

  const quotePredefinedColumns = [
    {
      name: 'documentCode',
      width: 200,
    },
    {
      name: 'description',
      width: 200,
    },
  ];

  const onSaveQuotePredefined = (resolve, reject) => {
    const { selectTreeNode } = searchTreeRef.current;
    const currentRecord = quotePredefinedDs.selected;
    copySiteRecord({
      ...currentRecord[0].toJSONData(),
    })
      .then((res) => {
        if (getResponse(res)) {
          selectTreeNode(res, true);
          notification.success();
          resolve();
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        reject(err);
      });
  };

  const selectQuotePredefined = () => {
    Modal.open({
      drawer: true,
      key: quotePredefinedModalKey,
      closable: true,
      title: intl.get('swfl.processConfiguration.view.button.processConfiguration').d('引用预定义'),
      style: { width: '800px' },
      children: (
        <div style={{ height: 'calc(100vh - 220px)' }}>
          <Table
            autoHeight={{ type: 'maxHeight', diff: 20 }}
            columns={quotePredefinedColumns}
            dataSet={quotePredefinedDs}
            queryFieldsLimit={2}
          />
        </div>
      ),
      onOk: () => new Promise((resolve, reject) => onSaveQuotePredefined(resolve, reject)),
      onClose: () => quotePredefinedDs.reset(),
    });
  };

  const renderDocumentOrCategories = useCallback(() => {
    if (currentNode.documentId && !currentNode.categoryId) {
      return <ProcessDocument currentNode={currentNode} />;
    } else if (currentNode.documentId && currentNode.categoryId) {
      return <ProcessCategories currentNode={currentNode} />;
    } else {
      return (
        <div className="process-configuration-unselect">
          <UnSelectSvg />
          <div className="unselect-title">
            {intl.get('swfl.processConfiguration.view.title.unselect').d('请从左侧选择审批流单据')}
          </div>
          <div className="unselect-description">
            {intl
              .get('swfl.processConfiguration.view.description.unselect')
              .d('审批流配置可以对审批流进行配置')}
          </div>
        </div>
      );
    }
  }, [currentNode]);

  return (
    <React.Fragment>
      <Header
        title={intl
          .get('swfl.processConfiguration.view.title.processConfiguration')
          .d('审批流配置')}
      >
        <Button color="primary" icon="add" onClick={createProcessDocument}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button funcType="flat" icon="open_in_browser" onClick={selectQuotePredefined}>
          {intl.get('swfl.processConfiguration.view.button.processConfiguration').d('引用预定义')}
        </Button>
        <Button funcType="flat" icon="settings" onClick={openTotalSetting}>
          {intl.get('swfl.processConfiguration.view.button.totalSetting').d('全局设置')}
        </Button>
      </Header>
      <div className={style['process-configuration']}>
        <div className="process-configuration-wrapper">
          <SearchTree style={{ display: emptyFlag ? 'none' : 'block' }} />
          {emptyFlag ? (
            <div className="process-configuration-empty">
              {intl.get('swfl.processConfiguration.view.notice.empty.please').d('请引用平台')}
              <span>
                {intl
                  .get('swfl.processConfiguration.view.notice.empty.processConfiguration')
                  .d('预定义单据')}
              </span>
              {intl.get('hzero.common.view.operator.or').d('或')}
              <span>{intl.get('hzero.common.button.create').d('新建')}</span>
              {intl
                .get('swfl.processConfiguration.view.notice.empty.processConfiguration')
                .d('审批流')}
              !
            </div>
          ) : (
            <div
              className="process-configuration-content"
              style={{ width: `calc(100% - ${leftTreeWidth}px)` }}
              id="process-configuration-content"
            >
              {renderDocumentOrCategories()}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
