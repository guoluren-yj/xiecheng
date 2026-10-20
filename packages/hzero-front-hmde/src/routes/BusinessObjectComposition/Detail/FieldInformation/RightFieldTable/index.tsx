/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, {
  useMemo,
  useState,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Table,
  Button,
  DataSet,
  Form,
  TextField,
  IntlField,
  Icon,
  Modal,
  Switch,
} from 'choerodon-ui/pro';
import { Row, Col, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { TableMode, TableColumnTooltip, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
// import { operatorRender } from 'hzero-front/lib/utils/renderer';
// import notification from 'hzero-front/lib/utils/notification';
// import { Operators, PublishStatus } from '@/businessGlobalData/common';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { isEmpty, cloneDeep, isNil } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import ImgIcon from '@/utils/ImgIcon';
// import { enableRender, publishRender } from '@/utils/render';
import { updateRelationObject } from '@/services/businessObjectService';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { getFieldsEnums } from '@/businessComponents/icon-picker/enums';
import CreateField from './CreateField';
import {
  toTree as _toTree,
  deleteObjectModelId,
  // treeFindNode,
  findRelatedNode,
} from '../utils';
import { valueList } from '../enums';
import {
  rightFieldInformationDS,
  createFieldInformationDS,
  rightSearchDS,
} from './store/FieldInformationDS';
import FieldDetail from './FieldDetail';
import { Store } from '../index';
import styles from './index.less';
import sourceStore from '../../../store';

const modelModalKey = Modal.key();


const isTenantRole: boolean = isTenantRoleLevel();
const {
  MASTER,
  SLAVE_MASTER,
  LINK,
  MASTER_SLAVE,
  REVERSE_LINK,
  REL_LINK,
  REL_REVERSE_LINK,
  REL_MASTER_SLAVE,
  REL_SLAVE_MASTER,
} = valueList;
const Index = () => {
  const {
    store,
    businessObjectCombineId,
    leftObjectRef,
    rightFieldsRef,
    // masterBusinessObjectId,
    businessObjectId,
    boCompositionDS,
    allowEdit,
  } = useContext(Store);
  const lefeTreeSelectedRecord = store?.getItem('record') || {};
  const completeRightData: any = useRef([]);
  const [isEditAll, setIsEditAll] = useState<boolean>(false);
  const searchDs = useMemo(() => new DataSet(rightSearchDS()), []);
  const { permissionFlag } = React.useContext<any>(sourceStore as any).store;
  const map = useMemo(() => {
    const tmp = {};
    getFieldsEnums().forEach(i => {
      tmp[i.value] = i.title;
    });
    return tmp;
  }, []);
  // 查看字段详情
  const openFieldDetail = React.useCallback(record => {
    const fieldDetail = record.toData();
    Modal.open({
      title: intl.get('hmde.boComposition.fieldInfo.view.message.detail').d('字段详情'),
      destroyOnClose: true,
      drawer: true,
      resizable: true,
      style: {
        width: '750px',
      },
      bodyStyle: {
        padding: '20px 0',
      },
      children: <FieldDetail fieldDetail={fieldDetail} />,
      footer: (_, cancelBtn) => cancelBtn,
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  // 这块展示逻辑 主/主从/反向关联：对象名称(对象编码); 从主/关联：字段名称(对象名称); 高级关系: 高级关系-之前的逻辑逻辑
  const iconRenderer = ({ record }, isEdit = true) => {
    const relateType = record.get('relateType');
    const relBusinessObjectName = record.get('relBusinessObjectName'); // 对象名称
    const relateBusinessObjectCode = record.get('relateBusinessObjectCode'); // 对象编码
    const parentBusinessObjectFieldCode = record.get('parentBusinessObjectFieldCode');
    const relBusinessObjectFieldName = record.get('relBusinessObjectFieldName'); // 字段名
    const businessObjectFieldName = record.get('businessObjectFieldName');
    const relBusinessObjectAssociateName = record.get('relBusinessObjectAssociateName');
    let iconName = '';
    let title = '';
    let preName = '';
    let afterName = '';
    const preTitle = `${intl.get('hmde.boComposition.advancedRelationship').d('高级关系')}-`;
    switch (relateType) {
      case MASTER:
        iconName = 'bocZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.master').d('主');
        preName = relBusinessObjectName;
        afterName = relateBusinessObjectCode;
        break;
      case MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.masterSlave').d('主从');
        preName = relBusinessObjectName;
        afterName = relateBusinessObjectCode;
        break;
      case REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.reverseLink').d('反向关联');
        preName = relBusinessObjectName;
        afterName = relBusinessObjectFieldName;
        break;
      case SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.slaveMaster').d('从主');
        preName = relBusinessObjectFieldName;
        afterName = relBusinessObjectName;
        break;
      case LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.link').d('关联');
        preName = relBusinessObjectFieldName;
        afterName = relBusinessObjectName;
        break;
      case REL_LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.link').d('关联');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relBusinessObjectName;
        break;
      case REL_REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.reverseLink').d('反向关联');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relateBusinessObjectCode;
        break;
      case REL_MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.masterSlave').d('主从');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relateBusinessObjectCode;
        break;
      case REL_SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.slaveMaster').d('从主');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relBusinessObjectName;
        break;
      default:
        iconName = 'bocZhu.svg';
        title = intl.get('hmde.boComposition.fieldInfo.relation.master').d('主');
        preName = relBusinessObjectName;
        afterName = parentBusinessObjectFieldCode;
        break;
    }
    if (relateType || businessObjectId) {
      return (
        <span>
          <Tooltip title={title}>
            <ImgIcon name={iconName} size={16} style={{ marginRight: 4 }} />
          </Tooltip>
          {afterName ? (
            <span>
              {preName}
              <span style={{ color: '#7C859B' }}>{`(${afterName})`}</span>
            </span>
          ) : (
            <span>{preName}</span>
          )}
        </span>
      );
    } else {
      return (
        <span
          className={styles['business-object-field']}
          onClick={() => {
            if (isEdit) {
              openFieldDetail(record);
            }
          }}
        >
          {businessObjectFieldName}
        </span>
      );
    }
  };
  const iconRendererFieldName = ({ record }) => {
    const relateType = record.get('relateType');
    const parentBusinessObjectFieldCode = record.get('parentBusinessObjectFieldCode');
    const businessObjectFieldCode = record.get('businessObjectFieldCode');
    if (relateType || businessObjectId) {
      return <span>{parentBusinessObjectFieldCode}</span>;
    } else {
      return <span>{businessObjectFieldCode}</span>;
    }
  };
  const iconRendererFieldType = ({ record }) => {
    const relateType = record.get('relateType');
    const componentType = record.get('componentType');
    if (relateType !== MASTER && map[componentType]) {
      return <span>{map[componentType]}</span>;
    }
    return null;
  };

  /**
   * @param flag 是否更新缓存
   */
  const init = async (flag = true) => {
    const res = await rightFieldInformationDs.query();
    // 确保缓存只有初始化/删除/新增时会更新
    if (flag) {
      completeRightData.current = res;
    }
    return res;
  };

  const filterRightFields = element => {
    const { relateType, businessObjectRelationId } = element;
    const list = completeRightData.current;
    // console.log('element', element);
    if (relateType === MASTER) {
      // 选中的是根节点
      rightFieldInformationDs.loadData(list);
    } else {
      // 选中的是关联对象节点
      // const res = treeFindNode(
      //   list,
      //   item => item.businessObjectRelationId === businessObjectRelationId
      // );
      // rightFieldInformationDs.loadData([res]);
      const res = findRelatedNode(list, 'businessObjectRelationId', businessObjectRelationId);
      rightFieldInformationDs.loadData(res);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const rightFieldInformationDs = useMemo(
    () => new DataSet(rightFieldInformationDS(businessObjectCombineId)),
    [businessObjectCombineId]
  );
  const createFieldInformationDs = useMemo(() => new DataSet(createFieldInformationDS()), []);

  // // 启用|禁用 平台/租户下的业务对象字段
  // const handleEnable = async (record) => {
  //   const flag = record.get('enabledFlag');
  //   // 必输字段不能禁用
  //   if (flag && record.get('requiredFlag')) {
  //     notification.error({
  //       message: intl.get('hmde.common.status.error').d('失败'),
  //       description: intl
  //         .get('hmde.boComposition.model.cant`t disabled')
  //         .d('该字段为必输字段，不可禁用'),
  //       placement: 'bottomRight',
  //     });
  //     return false;
  //   }
  //   record.set('enabledFlag', !flag);
  //   const res = await rightFieldInformationDs.submit();
  //   if (getResponse(res)) {
  //     rightFieldInformationDs.query();
  //   }
  // };

  const columns = useMemo(
    (): ColumnProps[] =>
      [
        {
          name: 'businessObjectFieldName',
          tooltip: TableColumnTooltip.overflow,
          renderer: iconRenderer as any,
          width: 250,
        },
        {
          name: 'displayName',
          tooltip: TableColumnTooltip.overflow,
          editor: record =>
            record.get('relateType') !== MASTER &&
            !(isTenantRole && record.get('tenantId') !== getCurrentOrganizationId()) &&
            isEditAll && (
              <IntlField name="displayName" colSpan={1} suffix={<Icon type="language" />} />
            ),
        },
        {
          name: 'aliasName',
          tooltip: TableColumnTooltip.overflow,
          // editor: record =>
          //   record.get('relateType') !== MASTER &&
          //   !(isTenantRole && !record.get('tenantId')) &&
          //   isEditAll,
        },
        {
          width: 100,
          name: 'componentType',
          tooltip: TableColumnTooltip.overflow,
          renderer: iconRendererFieldType as any,
        },
        // boCompositionDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED && {
        //   name: 'enabledFlag',
        //   renderer: ({ value, record }) => !record?.get('relateType') && enableRender(value),
        // },
        // {
        //   name: 'publishedFlag',
        //   renderer: ({ value, record }) => !record?.get('relateType') && publishRender(value),
        // },
        // {
        //   width: 100,
        //   name: 'operator',
        //   tooltip: TableColumnTooltip.overflow,
        //   renderer: ({ record }) => {
        //     const operators: Operators = [
        //       {
        //         key: 'enableFlag',
        //         ele: (
        //           <Popconfirm
        //             onConfirm={() => handleEnable(record)}
        //             placement="top"
        //             title={intl
        //               .get('hmde.bo.field.view.message.enableConfirm')
        //               .d(
        //                 '请确认是否禁用该字段，禁用字段后不影响已配置内容，但后续将不再能选到该字段。'
        //               )}
        //           >
        //             <a>
        //               {!record?.get('enabledFlag')
        //                 ? intl.get('hzero.common.button.enable').d('启用')
        //                 : intl.get('hzero.common.button.disable').d('禁用')}
        //             </a>
        //           </Popconfirm>
        //         ),
        //         len: 2, // ele里面的中文长度是多少就写多少
        //         title: !record?.get('enabledFlag')
        //           ? intl.get('hzero.common.button.enable').d('启用')
        //           : intl.get('hzero.common.button.disable').d('禁用'), // title写国际化
        //       },
        //     ];
        //     if (isTenantRole) {
        //       if (
        //         !record?.get('relateType') && // 非模型
        //         boCompositionDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED && // 未发布对象不可禁用启用
        //         record.get('publishedFlag') && // 不是新增字段
        //         record.get('inheritSourceType') !== 'STANDARD' // 非标准字段
        //       ) {
        //         return operatorRender(operators, record, { limit: 3 });
        //       }
        //     } else if (
        //       !record?.get('relateType') && // 非模型
        //       boCompositionDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED && // 未发布对象不可禁用启用
        //       record.get('publishedFlag') && // 不是新增字段
        //       !record?.get('standardFlag') // 非标准字段
        //     ) {
        //       return operatorRender(operators, record, { limit: 3 });
        //     }
        //   },
        // },
      ].filter(Boolean) as ColumnProps[],
    [isEditAll, boCompositionDS.current?.get('publishStatus')]
  );

  const createColumns = useMemo(
    () => [
      {
        name: 'businessObjectFieldName',
        tooltip: TableColumnTooltip.overflow,
        renderer: renderProps => iconRenderer(renderProps, false),
      },
      {
        name: 'displayName',
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'businessObjectFieldCode',
        tooltip: TableColumnTooltip.overflow,
        renderer: iconRendererFieldName as any,
      },
      {
        width: 100,
        name: 'componentType',
        tooltip: TableColumnTooltip.overflow,
        renderer: iconRendererFieldType as any,
      },
      {
        width: 100,
        name: 'reverseLinkFlag',
        tooltip: TableColumnTooltip.overflow,
        renderer: ({ record }) => {
          if (record?.get('relateType')) {
            return (
              <Switch
                disabled={record.get('reverseLinkFlagDisabled')}
                name="reverseLinkFlag"
                onChange={flag => record?.set('reverseLinkFlag', flag)}
              />
            );
          }
        },
      },
    ],
    []
  );

  function _treeFindNode(tree: any[], func: any, treeData) {
    if (!tree) return [];
    for (const data of tree) {
      if (func(data)) {
        Object.assign(data, {
          businessObjectRelationFieldList: treeData?.[0]?.businessObjectRelationFieldList,
          businessObjectRelationList: treeData?.[0]?.businessObjectRelationList,
        });
      }
      if (data?.businessObjectRelationList) {
        const childData = _treeFindNode(data?.businessObjectRelationList, func, treeData);
        if (childData) return childData;
      }
    }
    return undefined;
  }

  // 保存新增字段
  const handleSave = async () => {
    const arr = createFieldInformationDs.toData();
    const selectData: any = createFieldInformationDs.selected;
    const selectFields = selectData.map(i => i.toData()).filter(d => !d.relateType); // 过滤出选中的叶子节点
    const allObjects = arr.filter((i: any) => i?.relateType); // 过滤全部数据中的根节点
    const treeData = _toTree([...allObjects, ...selectFields]); // 新增字段列表创建好的树 可能不完整(缺少根节点)
    let obj;
    if (treeData?.[0]?.relateType !== MASTER) {
      const leftNoFieldsTreeData = store.getItem('leftNoFieldsTree');
      const _leftNoFieldsTreeData = cloneDeep(leftNoFieldsTreeData);
      const selectedData = store.getItem('record');
      _treeFindNode(
        [_leftNoFieldsTreeData],
        node => node.businessObjectRelationId === selectedData?.businessObjectRelationId,
        treeData
      );
      obj = _leftNoFieldsTreeData;
    } else {
      // 如果字段列表树已经完整 则不需要走拼接逻辑
      obj = { ...(treeData?.[0] || {}) };
    }
    // currentNode.businessObjectRelationList = [...treeData];
    if (!isEmpty(obj)) {
      const noIdData = deleteObjectModelId(obj);
      const body = noIdData;
      const res = await updateRelationObject({ body });
      if (getResponse(res)) {
        leftObjectRef.current.init(undefined, false);
        const _res = await rightFieldInformationDs.query();
        completeRightData.current = _res;
        filterRightFields(lefeTreeSelectedRecord);
      }
    }
    return true;
  };

  // 关闭新增字段弹窗
  const handleAfterClose = () => {
    createFieldInformationDs.loadData([]);
  };
  // 脚步
  type IFooterCom = (cancelOK: JSX.Element, cancelBtn: JSX.Element) => JSX.Element;
  const footerCom: IFooterCom = (cancelOK, cancelBtn) => {
    return (
      <>
        {cancelBtn}
        {cancelOK}
      </>
    );
  };

  const handleAdd = async() => {
    const createField = {
      _store: { ...store },
      createColumns,
      handleExpendIcon,
      businessObjectCombineId,
      createFieldInformationDs,
    };
    Modal.open({
      title: (
        <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>
          {intl.get('hmde.boComposition.exportTemplate.button.addField').d('添加字段')}
        </div>
      ),
      style: { width: 1000 },
      key: modelModalKey,
      destroyOnClose: true,
      closable: true,
      children: <CreateField {...createField} />,
      footer: footerCom,
      onOk: handleSave,
      afterClose: handleAfterClose,
    });
  };

  /**
   * 批量保存
   */
  const saveAll = async () => {
    const val: boolean = await rightFieldInformationDs.validate();
    if (val) {
      const res = await rightFieldInformationDs.submit();
      if (res && res.failed) return;
      setIsEditAll(false);
      await init();
      filterRightFields(lefeTreeSelectedRecord);
    }
  };

  /**
   * 批量删除
   */
  const handleDelete = async () => {
    const flag = await rightFieldInformationDs.delete(rightFieldInformationDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
    if (!flag) return;
    await init();
    let data = {};
    if (rightFieldInformationDs.queryDataSet && rightFieldInformationDs.queryDataSet.length) {
      // eslint-disable-next-line prefer-destructuring
      data = rightFieldInformationDs.queryDataSet.toData()[0];
    }
    handleSearch(data);
    const { current } = leftObjectRef;
    // 修复端侧报错， 可能原因是加了init异步后，用户可能关闭页面导致 leftObjectRef被销毁
    if (current) {
      current.init();
    }
  };
  const buttons = [
    (isTenantRole || permissionFlag) && (
      <Button
        disabled={isNil(lefeTreeSelectedRecord.relateType)
          || isNil(lefeTreeSelectedRecord.relBusinessObjectId)
          || rightFieldInformationDs.status === 'loading'}
        onClick={handleAdd}
        key="edit"
        icon='playlist_add'
      >
        {intl.get('hmde.boComposition.exportTemplate.button.addField').d('添加字段')}
      </Button>
    ),
    <Button
      disabled={
        rightFieldInformationDs.status === 'loading' ||
        rightFieldInformationDs.selected.length === 0
      }
      onClick={handleDelete}
      key="delete"
      icon='delete_sweep'
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
    isEditAll ? (
      <Button icon="save" onClick={() => saveAll()} key="save">
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
    ) : (
      <Button style={{ display: 'none' }} />
    ),
    (isTenantRole || permissionFlag) && (
      <Button
        disabled={rightFieldInformationDs.length === 0}
        onClick={() => handleEditAll()}
        key="poEdit"
        icon={!isEditAll ? 'mode_edit' : 'cancel'}
      >
        {isEditAll
          ? intl.get('hzero.common.button.cancel').d('取消')
          : intl.get('hmde.common.button.batchEdit').d('批量编辑')}
      </Button>
    ),
  ] as Buttons[];

  /**
   * 批量编辑
   */
  const handleEditAll = () => {
    setIsEditAll(!isEditAll);
    if (isEditAll) {
      handleSearch();
    }
  };

  const handleExpendIcon = ({ expanded, onExpand, record }, type) => {
    const relateType = record.get('relateType');
    const businessObjectRelationList = record.get('businessObjectRelationList');
    const businessObjectRelationFieldList = record.get('businessObjectRelationFieldList');
    if (
      relateType &&
      (type !== 'list' ||
        !(isEmpty(businessObjectRelationList) && isEmpty(businessObjectRelationFieldList)))
    ) {
      if (!expanded) {
        return (
          <ImgIcon
            name="expendIcon.svg"
            size={14}
            onClick={onExpand}
            style={{ cursor: 'pointer' }}
          />
        );
      } else {
        return (
          <ImgIcon
            name="closeIcon.svg"
            size={14}
            onClick={onExpand}
            style={{ cursor: 'pointer' }}
          />
        );
      }
    } else {
      return <ImgIcon name="" hidden />;
    }
  };

  // 后序遍历(左右根)
  const treeFilter = (tree, func) => {
    return tree
      .map(node => ({ ...node }))
      .filter((node: any) => {
        if (node.businessObjectRelationFieldList) {
          // eslint-disable-next-line no-param-reassign
          node.businessObjectRelationFieldList = treeFilter(
            node?.businessObjectRelationFieldList || [],
            func
          );
        }
        return func(node) || node.businessObjectRelationFieldList?.length;
      });
  };

  const handleSearch = async (params?: any) => {
    rightFieldInformationDs.status = DataSetStatus.loading;
    filterRightFields(lefeTreeSelectedRecord);
    if (params) {
      const fullData = rightFieldInformationDs.toData();
      const newParams: any = {};
      ['nameOrCode'].forEach(item => {
        if (params[item]) {
          Object.assign(newParams, { [item]: params[item] });
        }
      });
      if (rightFieldInformationDs.queryDataSet) {
        rightFieldInformationDs.queryDataSet.loadData([newParams]);
      }
      if (!isEmpty(newParams)) {
        const data = treeFilter(
          fullData,
          node =>
            node?.businessObjectFieldName?.includes(newParams.nameOrCode) ||
            node?.businessObjectFieldCode?.includes(newParams.nameOrCode)
        );
        rightFieldInformationDs.loadData(data);
      }
    }
    rightFieldInformationDs.status = DataSetStatus.ready;
  };

  useImperativeHandle(rightFieldsRef, () => ({
    init,
    filterRightFields,
  }));

  return (
    <div className={styles['field-list-table-container']}>
      <FilterBarTable
        key={lefeTreeSelectedRecord && lefeTreeSelectedRecord.businessObjectRelationId}
        className={styles['field-list-table']}
        mode={TableMode.tree}
        dataSet={rightFieldInformationDs}
        selectionMode={(isTenantRole || permissionFlag ? 'treebox' : 'none') as any}
        columns={columns}
        // onRow={nodeCover}
        virtualCell
        virtual
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -60 }}
        // expandIcon={(args) => handleExpendIcon(args, 'list')} // 高性能tree暂时不用这个，缩进有问题
        buttons={allowEdit ? buttons : []}
        defaultRowExpanded
        filterBarConfig={{
          autoQuery: false,
          collpaseble: true,
          collpase: true,
          onQuery: ({ params }) => handleSearch(params),
        }}
        customizable
        customizedCode='HMDE.BUSINESS_OBJECT_COMPOSITION.DETAIL.FIELD_LIST'
      />
    </div>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(observer(Index));
