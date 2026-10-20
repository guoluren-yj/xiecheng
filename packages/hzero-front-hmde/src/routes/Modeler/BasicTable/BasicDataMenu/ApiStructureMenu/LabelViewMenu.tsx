import React, { useContext, useEffect, useState } from 'react';
import { CheckBox } from 'choerodon-ui/pro';
import { Menu, Tooltip, Dropdown, Tree } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';

import ImgIcon from '@/utils/ImgIcon';
import useModalMain, { IData } from '@/routes/Modeler/hooks/useModalMain';
import SmallPagination from '@/routes/Modeler/component/SmallPagination';
import MethodIcon from '@/routes/Modeler/component/MethodIcon';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import { SingleTagDistribute, MenuListLabels } from '../../../hooks/tags';
import styles from '../../index.less';

const { TreeNode } = Tree;
const { Item } = Menu;
interface IParams {
  name?: string;
  page?: number;
  size?: number;
  isResetPage?: boolean;
}

interface ILabelViewMenu {
  dataSource: any[]; // fixme
  leftMenuDsQuery: (params: IParams) => void; // fixme
  handleSelectNode: (params?: any) => void; // fixme
  handleDelete: (item: model.baseStructure.ApiInfo) => void; // fixme
  TargetType: any;
  pageObj: { page: number; pageSize: number; total: number };
}
const LabelViewMenu = ({
  dataSource = [],
  leftMenuDsQuery = () => {},
  handleSelectNode = () => {},
  handleDelete = () => {},
  TargetType,
  pageObj,
}: ILabelViewMenu) => {
  const {
    storeData: { _tenantId },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const { openTagsDistributionModal } = useModalMain();
  const [checkedNodes, setCheckedNodes] = useState<IData[]>([]);
  const [startBatchCheckFlag, setStartBatchCheckFlag] = useState(false);

  useEffect(() => {
    setCheckedNodes([]);
  }, [_tenantId]);

  /**
   * 设置菜单选项Item样式
   * @param {Object} item
   * @param {Object} parentNode
   */
  const SetItemStyle = ({ item }: { item: any }) => {
    const [visible, setVisible] = useState<boolean>(false); // 下拉菜单显示
    const [curNode, setCurNode] = useState<string>('');
    // fixme
    const method = item && item.apiMethod && item.apiMethod.toLowerCase();
    let icon = <></>;
    icon = (
      <div className={styles['menu-left-list-release']}>
        <MethodIcon method={method} />
      </div>
    );
    const editMoreColumn = (
      <Menu>
        {item?.editApiFlag ? (
          <Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
              handleDelete({ ...item, grade: 'table' });
            }}
          >
            <ImgIcon
              name="delete-black.svg"
              size={16}
              style={{ width: 18, marginRight: '0.1rem' }}
            />
            <span>删除</span>
          </Item>
        ) : (
          ''
        )}
        <Item
          onClick={(e) => {
            if (e?.domEvent) {
              e.domEvent.stopPropagation();
            }
          }}
        >
          <SingleTagDistribute
            code={item?.apiCode}
            type={TargetType.STRUCTURE_API}
            leftMenuDsQuery={leftMenuDsQuery}
          >
            <ImgIcon name="Tags.svg" size={16} style={{ width: 18, marginRight: '0.1rem' }} />
            <span>分配标签</span>
          </SingleTagDistribute>
        </Item>
      </Menu>
    );

    return (
      <div className={styles['menu-left-list-item']}>
        <div
          style={{
            width: '82%',
            display: 'flex',
            alignItems: 'center',
            userSelect: startBatchCheckFlag ? 'none' : 'auto',
          }}
          onMouseEnter={() =>
            setCurNode(`${item?.apiPath}&${item?.apiId}&${item?.apiCode}&${item.apiMethod}`)
          }
          onMouseLeave={() => setCurNode('')}
        >
          <CheckBox
            value={`${item?.apiPath}&${item?.apiId}&${item?.apiCode}&${item.apiMethod}`}
            checked={!!checkedNodes.find((n) => n.id === item.apiId)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={onmousedown}
            onMouseUp={onmouseup}
            onMouseEnter={(e) => {
              if (startBatchCheckFlag) {
                mouseoverChecked(e);
              }
            }}
          />
          {icon}
          <Tooltip title={item?.apiPath}>
            <i className={styles['menu-left-list-font']}>
              <span>{item?.apiPath}</span>
            </i>
          </Tooltip>
          <MenuListLabels labelAssignList={item?.labelAssignList} />
          <Dropdown
            visible={
              curNode === `${item?.apiPath}&${item?.apiId}&${item?.apiCode}&${item.apiMethod}` &&
              visible
            }
            onVisibleChange={(vis) => setVisible(!!vis)}
            trigger={[Action.hover]}
            overlay={editMoreColumn}
          >
            <ImgIcon
              name="more-options.svg"
              size={14}
              style={{ position: 'absolute', left: '195px' }}
            />
          </Dropdown>
        </div>
      </div>
    );
  };

  const onCheck = (val, oldValue) => {
    if (val) {
      const [apiPath, apiId, apiCode, apiMethod] = val.split('&');
      setCheckedNodes([
        ...checkedNodes,
        { name: apiPath, code: apiCode, id: apiId, type: apiMethod },
      ]);
    } else {
      setCheckedNodes([...checkedNodes].filter(({ id }) => id !== oldValue.split('&')?.[1]));
    }
  };

  const onmousedown = (e) => {
    setStartBatchCheckFlag(true);
    mouseoverChecked(e);
  };

  const mouseoverChecked = (e) => {
    const _value = e.target?.value;
    if (_value && checkedNodes.find(({ id }) => id === _value.split('&')?.[1])) {
      onCheck(false, _value);
    } else {
      onCheck(_value, false);
    }
  };

  const onmouseup = () => {
    setStartBatchCheckFlag(false);
  };

  useEffect(() => {
    document.body.addEventListener('mouseup', () => setStartBatchCheckFlag(false));
    return () => {
      document.body.removeEventListener('mouseup', onmouseup);
    };
  }, [startBatchCheckFlag]);

  /**
   * 循环遍历菜单选项Item
   * @param {Array<Object>} data
   * @param {Object} parentNode 菜单根对象
   */
  const loop = (data) =>
    data.map((item) => (
      <TreeNode
        key={`${item?.apiPath}&${item?.apiId}&${item?.apiCode}&${item.apiMethod}`}
        title={
          <div key={`node&${item.apiCode}&${item.apiId}&${item.editApiFlag}&${item.createApiFlag}`}>
            <SetItemStyle item={item} />
          </div>
        }
      />
    ));

  const pageSizeChange = (page, size) => {
    leftMenuDsQuery({ page, size, isResetPage: false });
  };

  return (
    <div className={`${styles['list-menu']} ${styles['authorization-list-menu']}`}>
      <div className={styles['menu-list-wrapper']}>
        <div className={styles['basic-menu-wrapper']}>
          <div
            className={styles['label-menu-wrapper']}
            style={{ paddingBottom: checkedNodes.length > 0 ? 48 : 16 }}
          >
            <Tree onSelect={handleSelectNode} style={{ height: '100%', width: '100%' }}>
              {loop(dataSource)}
            </Tree>
          </div>
        </div>
      </div>
      <div>
        <SmallPagination
          showSizeChanger
          showSizeChangerLabel={false}
          showTotal
          showPager={false}
          showQuickJumper={false}
          sizeChangerPosition={'left' as any}
          pageObj={pageObj}
          onChange={pageSizeChange}
        />
        {checkedNodes.length > 0 && (
          <div className={styles['bottom-wrapper']}>
            <div>
              <span
                onClick={() =>
                  openTagsDistributionModal({
                    data: checkedNodes,
                    type: TargetType.STRUCTURE_API,
                    callback: leftMenuDsQuery,
                    title: '选中的API',
                  })
                }
              >
                分配标签
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default observer(LabelViewMenu);
