import React, { Fragment, useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { isEmpty, throttle } from 'lodash';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import { Button, DataSet } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';

import { renderTagStatus } from './utils/renderer';
import { subRelationListDS } from './stores/listDS';
import { copyCurrent, unlockCurrent } from "./utils/api";
import { langPrefixCode, ListCustomizeCode } from './utils/constant';

interface IndexProps {
  listDS: DataSet,
  history: any,
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
}

const Index = ({ listDS, history, customizeTable }: IndexProps) => {

  useEffect(() => {
    listDS.query();
  }, [listDS]);

  // 渲染头部按钮
  const HeaderBtn = observer(() => {
    return <Button color={ButtonColor.primary} onClick={jumpToUpdatePage}>{intl.get('hzero.common.button.create').d('新建')}</Button>;
  });

  // 跳转维护页面
  const jumpToUpdatePage = throttle(() => {
    history.push({
      pathname: '/smdm/substitute-relation/update/null',
    });
  }, 1200);

  // 跳转明细页面
  const jumpToDetailPage = throttle((record) => {
    const subRelationId = record.get('subRelationId');
    if(!subRelationId) return;
    history.push({
      pathname: `/smdm/substitute-relation/Detail/${subRelationId}`,
    });
  }, 1200);

  /**
   * 按钮渲染
   * @param record 行数据
   * @param operation 操作code
   */
  const renderButtonClick = (record, operation) => {
    switch(operation) {
      case 'COPY': // 复制
        return copySubRelation(record);
      case 'EDIT': // 编辑
        return editSubRelation(record);
      case 'HISTORY': // 查看历史版本
        console.log('history');
        break;
      case 'UNLOCK': // 解锁
        return unlockSubRelation(record);
      default:
        break;
    }
  };

  /**
   * 复制
   * @param record 行数据
   */
  const copySubRelation = (record) => {
    const subRelationCurId = record.get('subRelationCurId');
    return copyCurrent(subRelationCurId).then(res => {
      const result = getResponse(res);
      if(result) {
        const { subRelationCurId: copyId} = result;
        history.push({
          pathname: `/smdm/substitute-relation/update/${copyId}`,
        });
      }
    });
  };

  /**
   * 编辑
   * @param record 行数据
   */
  const editSubRelation = throttle((record) => {
    const subRelationCurId = record.get('subRelationCurId');
    if(!subRelationCurId) return;
    history.push({
      pathname: `/smdm/substitute-relation/update/${subRelationCurId}`,
    });
  }, 1200);

  /**
   * 解锁
   * @param record 行数据
   */
  const unlockSubRelation = (record) => {
    const subRelationCurId = record.get('subRelationCurId');
    return unlockCurrent(subRelationCurId).then(res => {
      const result = getResponse(res);
      if(result) {
        listDS.query();
      }
    });
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'operate',
        renderer: ({ record }) => {
          const operations = record?.get('operations');
          if(!isEmpty(operations)) {
            return operations.map(operate => {
              return (
                <Button key={operate.operation} funcType={FuncType.link} color={ButtonColor.primary} disabled={operate.disabled} onClick={() => renderButtonClick(record, operate.operation)}>
                  {operate.operationMeaning}
                </Button>
              );
            });
          }
          return null;
        },
      },
      {
        name: 'displaySubRelationNum',
        renderer: ({ record }) => {
          const { displaySubRelationNum, status } = record?.get(['displaySubRelationNum', 'status']);
          if(status === 'RELEASED') {
            return <a onClick={() => jumpToDetailPage(record)}>{displaySubRelationNum}</a>;
          }
          return displaySubRelationNum;
        },
      },
      {
        name: 'subRelationName',
      },
      {
        name: 'status',
        renderer: ({ record }) => {
          const {status, statusMeaning} = record?.get(['status', 'statusMeaning']);
          return renderTagStatus({status, statusMeaning});
        },
      },
      { // 显示的是第一版创建人
        name: 'createdByName',
      },
      { // 显示的是第一版创建时间
        name: 'creationDate',
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get(`${langPrefixCode}.model.common.substituteRelation`).d('替代方案')}>
        <HeaderBtn />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          {
            customizeTable(
              {
                code: ListCustomizeCode.TableListCode,
              },
              <SearchBarTable
                autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 0 }}
                cacheState
                customizable
                dataSet={listDS}
                columns={columns}
                searchBarConfig={{ expandable: false, closeFilterSelector: true }}
                queryFieldsLimit={3}
                searchCode={ListCustomizeCode.SearchBarCode}
              />
            )
          }
        </div>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['smdm.subRelation', 'hzero.common'],
})(
  withCustomize({
    unitCode: Object.values(ListCustomizeCode),
  })(
    withProps(
      () => {
        const listDS = new DataSet(subRelationListDS());
        return {
          listDS,
        };
      },
      { cacheState: true }
    )(Index)
  )
);
