/* eslint-disable no-param-reassign */
/**
 * 扫描项管理
 */
import React, { useEffect } from 'react';
import intl from 'utils/intl';
import pull from 'lodash/pull';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import { getResponse } from 'utils/utils';

import { fetchUpdateItem } from '@/services/riskScanConfig/riskItemService';

import ScanItemModal from './ScanItemModal';

import styles from './index.less';

let canClick = 1;

let expandKeys = [];

export default function ScanItemManage(props) {
  const { scanItemListDS, scanMenuDetailDS, scanDetailDS } = props;

  useEffect(() => {
    scanItemListDS.addEventListener('load', initData);

    return () => {
      scanItemListDS.removeEventListener('load', initData);
      expandKeys = [];
    };
  }, []);

  const initData = ({ dataSet }) => {
    if (expandKeys.length) {
      dataSet.forEach(record => {
        if (expandKeys.includes(record.get('riskItemId'))) {
          record.set('expand', true);
          record.status = 'sync';
        }
      });
    }
  };

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const columns = () => {
    return [
      {
        name: 'enabledFlag',
        align: 'left',
        width: 120,
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value === 0
                ? intl.get('sdat.riskItemConfig.status.hasEnabled').d('已禁用')
                : intl.get('sdat.riskItemConfig.status.hasAbled').d('已启用')}
            </span>
          );
        },
      },
      {
        name: 'itemCode',
        width: 200,
      },
      {
        name: 'itemName',
      },
      {
        name: 'sortNum',
        width: 100,
      },
      {
        name: 'type',
      },
      {
        name: 'endFlag',
        width: 100,
        renderer: ({ value, record }) => {
          const type = record?.get('type');
          return type === 'CATEGORY' ? (
            <span>
              <Badge dot style={{ background: value === 0 ? '#E64322' : '#179454' }} />
              &nbsp;
              {value === 0
                ? intl.get('hzero.common.model.no').d('否')
                : intl.get('hzero.common.model.yes').d('是')}
            </span>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.table.column.options').d('操作'),
        width: 200,
        renderer: ({ record }) => {
          const obj = record?.toData() ?? {};
          const { enabledFlag, level, type } = obj || {};
          if (!record) {
            return null;
          }

          let num = 0;
          if (type === 'CATEGORY') {
            num = level === 1 ? 0 : 1;
          } else if (type === 'ITEM') {
            num = 2;
          }

          return (
            <span>
              {level === 1 ? (
                <a style={{ marginRight: '10px' }} onClick={() => handleCreate(2, obj, 'create')}>
                  {intl
                    .get('sdat.riskItemConfig.view.button.createScanItem')
                    .d('新建企业信息补充项')}
                </a>
              ) : null}

              <a style={{ marginRight: '10px' }} onClick={() => handleCreate(num, obj, 'edit')}>
                {intl.get('sdat.riskItemConfig.view.button.edit').d('编辑')}
              </a>
              <a onClick={() => handleEnabled(obj)}>
                {enabledFlag === 0
                  ? intl.get('sdat.riskItemConfig.view.button.enable').d('启用')
                  : intl.get('sdat.riskItemConfig.view.button.disable').d('禁用')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  /**
   * 查询所有父级数据
   * @param {*} tree
   * @param {*} targetId
   * @param {*} path
   * @returns
   */
  const findParents = (tree, targetId, path = []) => {
    for (const node of tree) {
      if (node.riskItemId === targetId) {
        return path.concat(node);
      }
      if (node.children && node.children.length > 0) {
        const result = findParents(node.children, targetId, path.concat(node));
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  const handleEnabled = (record = {}) => {
    const obj = record || {};
    const flagValue = obj.enabledFlag === 0 ? 1 : 0;
    if (obj && Object.keys(obj).length > 0) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm').d('提升'),
        key: 'enabledConfirm',
        children: (
          <div>
            {obj.enabledFlag === 0
              ? intl.get('sdat.riskItemConfig.view.title.confirmEnabled').d('是否确认启用')
              : intl.get('sdat.riskItemConfig.view.title.confirmDisabled').d('是否确认禁用')}
          </div>
        ),
      }).then(async button => {
        if (button === 'ok' && canClick === 1) {
          canClick = 0;
          let list = [];

          const loopChild = rcd => {
            list.push({ ...rcd, enabledFlag: flagValue });
            if (rcd.children && rcd.children.length) {
              rcd.children.forEach(child => {
                loopChild(child);
              });
            }
          };

          if (flagValue === 1) {
            // 启用， 查询所有父级
            const allData = scanItemListDS?.toData() ?? [];
            list = findParents(allData, obj.riskItemId).map(item => ({
              ...item,
              enabledFlag: flagValue,
            }));
          } else {
            // 禁用， 查询所有子级
            loopChild(obj);
          }

          const res = await fetchUpdateItem(list);
          canClick = 1;
          if (getResponse(res)) {
            scanItemListDS.query();
          }
        }
      });
    }
  };

  const handleCreate = async (type, item, viewType = 'create') => {
    let modal = null;
    let originTenantList = []; // 已保存的租户列表

    const titleMap = {
      0: intl.get('sdat.riskItemConfig.view.title.createSuperItem').d('新建顶级分类'),
      1: intl.get('sdat.riskItemConfig.view.title.createSubItem').d('新建下级分类'),
      2: intl.get('sdat.riskItemConfig.view.title.createScanItem').d('新建企业信息补充项'),
    };

    const editTitleMap = {
      0: intl.get('sdat.riskItemConfig.view.title.editSuperItem').d('编辑顶级分类'),
      1: intl.get('sdat.riskItemConfig.view.title.editSubItem').d('编辑下级分类'),
      2: intl.get('sdat.riskItemConfig.view.title.editScanItem').d('编辑企业信息补充项'),
    };

    const title = viewType === 'create' ? titleMap[type] : editTitleMap[type];

    const dsMap = {
      0: scanMenuDetailDS,
      1: scanMenuDetailDS,
      2: scanDetailDS,
    };

    const commonDS = dsMap[type];
    let dsType = '';

    if (viewType === 'create') {
      // 新建
      commonDS.data = [];
      if (type === 0) {
        // 顶级
        commonDS.create(
          {
            type: 'CATEGORY',
            enabledFlag: 1,
            parentId: 0,
            level: 1,
            scanFlag: 1, // 扫描项
            standardFlag: 1,
            dsType: 'CHG',
            endFlag: 1,
            applyScope: 'RISK_SCAN_PLAN',
          },
          0
        );
      } else if (type === 1) {
        // 次级
        // 创建类型目录
        commonDS.create(
          {
            type: 'CATEGORY',
            enabledFlag: 1,
            parentId: item.riskItemId,
            parentName: item.itemName,
            parentCode: item.itemCode,
            level: Number(item.level) + 1,
            scanFlag: 1, // 扫描项
            standardFlag: 1,
            dsType: 'CHG',
            applyScope: 'RISK_SCAN_PLAN',
          },
          0
        );
      } else if (type === 2) {
        // 扫描项
        commonDS.data = [];
        commonDS.create(
          {
            type: 'ITEM',
            enabledFlag: 1,
            parentId: item.riskItemId,
            level: Number(item.level) + 1,
            endFlag: 0,
            scanFlag: 1, // 扫描项
            standardFlag: 1,
            dsType: 'CHG',
            applyScope: 'RISK_SCAN_PLAN',
          },
          0
        );
      }
    } else {
      // 编辑
      commonDS.setQueryParameter('riskItemId', item.riskItemId);

      await commonDS.query();
      if (type === 1) {
        const { parentId } = item;
        const list = scanItemListDS.toData();

        let result = {};

        const loopChild = arr => {
          if (arr && arr.length) {
            arr.forEach(item2 => {
              if (item2.riskItemId === parentId) {
                result = item2;
              }

              if (item2.children && item2.children.length) {
                loopChild(item2.children);
              }
            });
          }
        };

        loopChild(list);

        if (commonDS && commonDS.current) {
          commonDS.current.set('parentName', result?.itemName);
          commonDS.current.set('parentCode', result?.itemCode);
        }
      }
      dsType = commonDS?.current?.get('dsType') ?? '';
      originTenantList = commonDS?.current?.get('tenantList') ?? [];
      if (originTenantList.length) {
        const ids = originTenantList.map(rcd => rcd.tenantId);
        if (commonDS && commonDS.current) {
          commonDS.current.set('tenantIds', ids);
        }
      }
    }

    const handleCloseModal = () => {
      commonDS.loadData([]);
      commonDS.reset();
      modal.close();
    };

    const handleOkCreate = async () => {
      const isValid = await commonDS.validate();
      if (isValid) {
        const obj = commonDS.toData()[0] ?? {};
        if (obj?.tenantList?.length) {
          obj.tenantList.forEach(rcd2 => {
            rcd2.itemCode = obj.itemCode;
          });
        }

        const nowTenantList = obj?.tenantList ?? []; // 当前选择后的租户列表

        // 新增列表没有itemTenantId
        const newList = nowTenantList.length ? nowTenantList.filter(rcd => !rcd.itemTenantId) : [];

        // 删除的列表
        let diffTenantList = [];
        if (originTenantList.length) {
          const nowIds = nowTenantList?.map(rcd => rcd.itemTenantId) ?? []; // 当前列表的id
          diffTenantList = originTenantList.filter(rcd => !nowIds.includes(rcd.itemTenantId)); // 删除的列表
        }

        const res = await fetchUpdateItem([
          { ...obj, tenantList: obj?.standardFlag === '1' ? [] : [...newList, ...diffTenantList] },
        ]);
        if (getResponse(res)) {
          handleCloseModal();
          scanItemListDS.query();
          return res;
        }
      }
    };

    modal = Modal.open({
      title,
      key: 'createItem',
      children: (
        <ScanItemModal dataSet={commonDS} type={type} viewType={viewType} dsType={dsType} />
      ),
      closable: true,
      drawer: true,
      mask: false,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleOkCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const onExpand = (expanded, record) => {
    const riskItemId = record.get('riskItemId');

    if (expanded) {
      const list = [...expandKeys];
      expandKeys = [...list, riskItemId];
    } else {
      expandKeys = pull(expandKeys, riskItemId);
    }
  };

  return (
    <>
      <div
        style={{
          height: 'calc(100vh - 148px)',
          margin: '8px',
          padding: '20px',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <FilterBar
          dataSet={[scanItemListDS]}
          cacheState
          cacheKey="SDAT.SCAN_RISK_SCAN_ITEM_SEARCH_BAR_PLATFORM"
          checkDataSetStatus={false}
          fields={[
            {
              name: 'itemName',
              type: 'string',
              label: intl.get(`sdat.riskItemConfig.model.nameOrCode`).d('名称、编码'),
              merge: true,
              display: false,
            },
            {
              label: intl.get(`sdat.riskItemConfig.model.status`).d('状态'),
              name: 'enabledFlag',
              type: 'string',
              lock: true,
            },
          ]}
        />
        <div style={{ height: 'calc(100vh - 300px)' }}>
          <Table
            dataSet={scanItemListDS}
            columns={columns()}
            queryBar="none"
            mode="tree"
            onExpand={onExpand}
            customizable
            customizedCode="SDAT.RISK_SCAN_ITEM_LIST"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </div>
    </>
  );
}
