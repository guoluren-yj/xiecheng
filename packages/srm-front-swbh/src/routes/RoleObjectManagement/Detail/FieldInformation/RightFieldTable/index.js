/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { Table, Button, DataSet, Form, TextField, Modal } from 'choerodon-ui/pro';
import { Row, Col, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { TableMode } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { isEmpty, cloneDeep } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { treeFindNode } from '../utils';
import { rightFieldInformationDS, rightSearchDS } from '../../stores/FieldInformationDS';
import { fieldsEnums } from '../../../../components/managementData';
import ImgIcon from '../../../../components/utils/ImgIcon/imgIcon';
import FieldDetail from './FieldDetail';
import { valueList } from '../enums';
import { Store } from '../index';
import styles from './index.less';

const isTenantRole = isTenantRoleLevel();
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
  // 翻译字段信息-类型多语言
  const fieldsEnumsList = fieldsEnums();
  const map = {};
  (fieldsEnumsList || []).forEach((i) => {
    map[i.value] = i.title;
  });
  const { rightFieldsRef, businessObjectId, combineId } = useContext(Store);
  const completeRightData = useRef([]);
  const searchDs = useMemo(() => new DataSet(rightSearchDS()), []);
  // 查看字段详情
  const openFieldDetail = React.useCallback((record) => {
    const fieldDetail = record.toData();
    Modal.open({
      title: intl.get('swbh.roManagement.fieldInfo.view.message.detail').d('字段详情'),
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

  /**
   * 暂时禁用弹窗数据
   * 这块展示逻辑 主/主从/反向关联：对象名称(对象编码); 从主/关联：字段名称(对象名称); 高级关系: 高级关系-之前的逻辑逻辑
   * @pointerEvents --禁用span标签
   * @param {*} param0
   * @param {*} isEdit
   * @returns
   */

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
    const preTitle = `${intl.get('swbh.roManagement.advancedRelationship').d('高级关系')}-`;
    switch (relateType) {
      case MASTER:
        iconName = 'bocZhu.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.master').d('主');
        preName = relBusinessObjectName;
        afterName = relateBusinessObjectCode;
        break;
      case MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.masterSlave').d('主从');
        preName = relBusinessObjectName;
        afterName = relateBusinessObjectCode;
        break;
      case REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.reverseLink').d('反向关联');
        preName = relBusinessObjectName;
        afterName = relBusinessObjectFieldName;
        break;
      case SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.slaveMaster').d('从主');
        preName = relBusinessObjectFieldName;
        afterName = relBusinessObjectName;
        break;
      case LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.link').d('关联');
        preName = relBusinessObjectFieldName;
        afterName = relBusinessObjectName;
        break;
      case REL_LINK:
        iconName = 'bocGuanLian.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.link').d('关联');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relBusinessObjectName;
        break;
      case REL_REVERSE_LINK:
        iconName = 'reverseLink.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.reverseLink').d('反向关联');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relateBusinessObjectCode;
        break;
      case REL_MASTER_SLAVE:
        iconName = 'bocZhuCong.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.masterSlave').d('主从');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relateBusinessObjectCode;
        break;
      case REL_SLAVE_MASTER:
        iconName = 'bocCongZhu.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.slaveMaster').d('从主');
        preName = `${preTitle}${relBusinessObjectAssociateName}`;
        afterName = relBusinessObjectName;
        break;
      default:
        iconName = 'bocZhu.svg';
        title = intl.get('swbh.roManagement.fieldInfo.relation.master').d('主');
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
          style={{ pointerEvents: 'none' }}
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
    rightFieldInformationDs.setQueryParameter('combineId', combineId);
    const res = await rightFieldInformationDs.query();
    // 确保缓存只有初始化/删除/新增时会更新
    if (flag) {
      completeRightData.current = res;
    }
    return res;
  };

  const filterRightFields = (element) => {
    const { relateType, businessObjectRelationId } = element;
    const list = [completeRightData.current];
    // console.log('element', element);
    if (relateType === MASTER) {
      // 选中的是根节点
      rightFieldInformationDs.loadData(list);
    } else {
      // 选中的是关联对象节点
      const res = treeFindNode(list, (item) => item.businessObjectRelationId === businessObjectRelationId);
      rightFieldInformationDs.loadData([res]);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const rightFieldInformationDs = useMemo(() => new DataSet(rightFieldInformationDS()), []);

  const columns = useMemo(() => {
    return [
      {
        name: 'businessObjectFieldName',
        renderer: iconRenderer,
        width: 250,
      },
      {
        name: 'displayName',
      },
      {
        name: 'aliasName',
      },
      {
        width: 100,
        name: 'componentType',
        renderer: iconRendererFieldType,
      },
    ];
  }, []);
  // 后序遍历(左右根)
  const treeFilter = (tree, func) => {
    return tree
      .map((node) => ({ ...node }))
      .filter((node) => {
        if (node.businessObjectRelationFieldList) {
          // eslint-disable-next-line no-param-reassign
          node.businessObjectRelationFieldList = treeFilter(node?.businessObjectRelationFieldList || [], func);
        }
        return func(node) || node.businessObjectRelationFieldList?.length;
      });
  };

  const handleSearch = async () => {
    const fullData = [cloneDeep(completeRightData.current)];
    const params = searchDs.toData()?.[0] || {};
    const newParams = {};
    ['nameOrCode'].forEach((item) => {
      if (params[item]) {
        Object.assign(newParams, { [item]: params[item] });
      }
    });
    if (isEmpty(newParams)) {
      rightFieldInformationDs.loadData(fullData);
    } else {
      const data = treeFilter(
        fullData,
        (node) =>
          node?.businessObjectFieldName?.includes(newParams.nameOrCode) ||
          node?.businessObjectFieldCode?.includes(newParams.nameOrCode)
      );
      rightFieldInformationDs.loadData(data);
    }
  };

  useImperativeHandle(rightFieldsRef, () => ({
    init,
    filterRightFields,
  }));

  return (
    <React.Fragment>
      <Row gutter={10} className={styles['row-10']}>
        <Col span={9}>
          <Form
            dataSet={searchDs}
            columns={1}
            labelWidth={105}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return handleSearch();
            }}
          >
            <TextField name="nameOrCode" />
          </Form>
        </Col>
        <Col style={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => searchDs.reset()}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
          <Button color={ButtonColor.primary} onClick={handleSearch}>
            {intl.get('hzero.common.button.query').d('查询')}
          </Button>
        </Col>
      </Row>
      <Table
        className={styles['field-list-table']}
        mode={TableMode.tree}
        dataSet={rightFieldInformationDs}
        selectionMode={isTenantRole ? 'treebox' : 'none'}
        columns={columns}
        virtualCell={false}
        defaultRowExpanded
      />
    </React.Fragment>
  );
};

export default formatterCollections({
  code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
})(observer(Index));
