/**
 * 规则配置详情 - 指标信息（租户级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { Fragment } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro'; // Tooltip
import intl from 'utils/intl';

import { ReactButton } from './ReactButton';
import AddIndexTable from './AddIndexTable';

const { Column } = Table;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀
const indexAddModalKey = Modal.key(); // modal的唯一key

export default function IndexMessage(props = {}) {
  const { tableDs, indexAddDs, basicParamDs, indexMessageDs } = props;

  /**
   * handleIndexAdd: 处理指标信息添加
   */
  const handleIndexAdd = () => {
    indexAddDs.setQueryParameter('ruleCode', basicParamDs.current.get('ruleCode'));
    indexAddDs.query();
    Modal.open({
      key: indexAddModalKey,
      title: intl.get(`${viewPrompt}.modal.addIndex`).d('添加指标'),
      maskClosable: true,
      drawer: true,
      style: { width: '6.4rem' },
      footer: (_, cancelBtn, modal) => {
        return (
          <Fragment>
            <ReactButton
              status="select"
              dataSet={indexAddDs}
              onClick={() => {
                handleSelectIndex(modal);
              }}
            />
            {cancelBtn}
          </Fragment>
        );
      },
      children: <AddIndexTable tableDs={indexAddDs} />,
      onClose: () => {
        indexAddDs.loadData([]);
      },
    });
  };

  /**
   * handleSelectIndex: 添加-选中指标
   */
  const handleSelectIndex = modal => {
    indexAddDs.selected.forEach(item => {
      // 取得其指标编码
      const indexCode = item.get('indexCode');
      // 创建记录
      indexMessageDs.create({
        ...item.toData(),
        calculateCode: indexCode,
      });
    });
    modal.close(); // 关闭弹窗
  };

  /**
   * handleIndexDelete: 处理指标删除
   * @param {*} record
   */
  const handleIndexDelete = record => {
    return indexMessageDs.delete(record);
  };

  const buttons = () => {
    return [
      <Button funcType="flat" icon="playlist_add" onClick={handleIndexAdd}>
        {intl.get(`${viewPrompt}.button.add`).d('添加')}
      </Button>,
      <ReactButton
        status="delete"
        funcType="flat"
        buttonProps={{
          color: 'primary',
        }}
        dataSet={indexMessageDs}
        onClick={handleCompLoading => {
          handleIndexDelete(indexMessageDs.selected).finally(() => {
            handleCompLoading(false);
          });
        }}
      />,
    ];
  };

  return (
    <Table dataSet={tableDs} selectedHighLightRow buttons={buttons()}>
      <Column
        name="calculateCode"
        width={200}
        editor
        // help={intl.get(`${viewPrompt}.modal.codeForStrategy`).d('此编码用于策略配置')}
      />
      <Column name="indexName" width={150} editor />
      <Column name="dataType" width={100} editor />
      <Column name="description" width={200} editor />
      <Column name="serviceCode" width={150} />
      <Column name="serviceName" />
      <Column name="creationDate" width={200} />
      <Column name="lastUpdateDate" width={200} />
      <Column
        name="operation"
        width={200}
        lock="right"
        renderer={({ record, dataSet }) => {
          const { indexType, servicePath, ruleManagementLineId } = record.get([
            'indexType',
            'servicePath',
            'ruleManagementLineId',
          ]);
          const jsonStr = record.get('dimensionality');
          const list = jsonStr ? JSON.parse(jsonStr) : [];
          return (
            <Fragment>
              {indexType !== 'transform_parameter' && (
                <Fragment>
                  {ruleManagementLineId ? (
                    <span style={{ position: 'relative', marginRight: '20px' }}>
                      <a
                        onClick={() => {
                          props.onDimensionClick(record, dataSet);
                        }}
                      >
                        {intl.get(`${viewPrompt}.modal.editDimension`).d('编辑维度')}
                        {`(${list.length})`}
                      </a>
                    </span>
                  ) : (
                    <span style={{ position: 'relative', marginRight: '16px' }}>
                      <a
                        onClick={() => {
                          props.onDimensionClick(record, dataSet);
                        }}
                      >
                        {intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
                        {`(${list.length})`}
                      </a>
                    </span>
                  )}
                  {servicePath && ruleManagementLineId && (
                    <a
                      style={{ marginRight: '16px' }}
                      onClick={() => {
                        props.onRouterDimension(record);
                      }}
                    >
                      {intl.get(`${viewPrompt}.ruleManages.indexSearch`).d('指标探查')}
                    </a>
                  )}
                </Fragment>
              )}
            </Fragment>
          );
        }}
      />
    </Table>
  );
}
