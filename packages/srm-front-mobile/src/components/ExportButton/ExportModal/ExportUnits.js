/**
 * 文件名: ExportUnits.js
 * 创建时间: 2026-05-15
 * 文件描述: 导出弹窗右侧已选项列表
 * 作者: Felix(LQX5731@163.com)
 * 版本号: 1.1.0
 * 最后更新时间: 2026-05-15
 */
import React from 'react';
import { Tag, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import styles from '../index.less';
import { PRIMARY_KEY } from '../store';

/**
 * 节点类型对应的标签颜色配置
 */
const NODE_TYPE_META = {
  document: {
    color: 'blue',
    labelKey: 'smbl.checkRules.view.tag.documentName',
    defaultLabel: '流程单据',
  },
  category: {
    color: 'green',
    labelKey: 'smbl.checkRules.view.tag.categoryName',
    defaultLabel: '流程分类',
  },
};

/**
 * 根据节点类型获取标签配置（包含已翻译的label）
 * @param {string} nodeType - 节点类型
 * @returns {{color: string, label: string}} 标签配置
 */
function getNodeTypeMeta(nodeType) {
  const meta = NODE_TYPE_META[nodeType] || NODE_TYPE_META.document;
  return {
    ...meta,
    label: intl.get(meta.labelKey).d(meta.defaultLabel),
  };
}

const ExportUnits = observer(({ checkedRecords, onUnCheckTreeRecord }) => {
  return (
    <>
      <div className={styles['right-title']}>
        {!checkedRecords.length ? (
          intl
            .get('smbl.checkRules.view.title.needSelectUnit')
            .d('请在左侧选择需要导出的流程单据/流程分类')
        ) : (
          <>
            {intl.get('smbl.checkRules.view.title.chosen').d('已选择')}
            <span>
              {checkedRecords?.length
                ? checkedRecords?.filter((record) => record.nodeType !== 'document')?.length
                : 0}
            </span>
            {intl.get('smbl.checkRules.view.title.chosenUnitNumber').d('个流程分类')}
          </>
        )}
      </div>
      <div className={styles['right-list']}>
        {checkedRecords.length > 0 &&
          checkedRecords
            ?.filter((record) => record.nodeType !== 'document')
            ?.map((record) => {
              const meta = getNodeTypeMeta(record.nodeType);
              return (
                <div className={styles['right-list-item']} key={record[PRIMARY_KEY]}>
                  <div className={styles['right-list-item-header']}>
                    <Tag color={meta.color}>{meta.label}</Tag>
                    <div className={styles['right-list-item-name']}>{record.name}</div>
                    <div>
                      <Icon
                        type="close"
                        className={styles['right-list-item-icon']}
                        onClick={() => onUnCheckTreeRecord(record[PRIMARY_KEY])}
                      />
                    </div>
                  </div>
                  <div className={styles['right-list-item-footer']}>{record.code}</div>
                </div>
              );
            })}
      </div>
    </>
  );
});

export default ExportUnits;
