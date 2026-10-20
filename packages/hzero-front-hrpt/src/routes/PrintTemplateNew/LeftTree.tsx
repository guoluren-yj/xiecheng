import React, { memo, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { DataSet, Modal, Tooltip, Tree, Form, TextField, IntlField, Lov, Spin, Select, OverflowTip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { DataSetSelection, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import type { Record } from 'choerodon-ui/dataset';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { isNil } from 'lodash';
import { runInAction } from 'mobx';
import notification from 'hzero-front/lib/utils/notification';
import { observer } from 'mobx-react-lite';

import { queryPrintDirectory, createPrintDirectory, updatePrintDirectory, createPrintDocument } from '@/services/printTemplateService';
import type { IStore} from './store';
import Store, { rootDirCode, idField, parentField, expandField, getDirFormDsConfig, getDocFormDsConfig } from './store';
import styles from './index.less';

const LeftTree = observer(() => {
  const { isTenant, setCurrentDocument, selectedKeys, setSelectedKeys, setEditing, canEdit }: IStore = useContext<any>(Store as any).store;
  const [loading, setLoading] = useState<boolean>(false);
  const treeDs: DataSet = useMemo(() => {
    return new DataSet({
      idField,
      parentField,
      expandField,
      selection: DataSetSelection.single,
    });
  }, []);

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    setLoading(true);
    const res = await queryPrintDirectory();
    if (getResponse(res)) {
      const data = transformTreeData(res);
      treeDs.loadData(data);
    }
    setLoading(false);
  };

  const transformTreeData = (data: any[]) => {
    const result: any[] = [];
    if (data.length > 0) {
      data.forEach(dir => {
        const { directoryName, linkCode, parentLinkCode, printDocumentList } = dir;
        // parentLinkCode 为 -1 的表示为 一级目录
        const record: Record | undefined = treeDs.find(r => !isNil(r.get(idField)) && linkCode === r.get(idField));
        result.push({
          title: directoryName,
          [idField]: linkCode,
          [parentField]: parentLinkCode === '-1' ? rootDirCode : parentLinkCode,
          [expandField]: record ? record.get(expandField) : false,
          ...dir,
        });
        if (printDocumentList && printDocumentList.length > 0) {
          printDocumentList.forEach(doc => {
            const { docName, docCode } = doc;
            const docRecord = treeDs.find(r => !isNil(r.get(idField)) && linkCode === r.get(idField));
            result.push({
              title: docName,
              [idField]: docCode,
              [parentField]: linkCode,
              [expandField]: docRecord ? docRecord.get(expandField) : false,
              ...doc,
            });
          });
        }
      });
    }
    return result;
  };

  const handleSubmitDoc = useCallback(async (formDs: DataSet) => {
    const flag = await formDs.validate();
    if (!flag || !formDs.current) {
      return false;
    }
    const param = formDs.current.toJSONData();
    const resp = await createPrintDocument(param);
    if (getResponse(resp)) {
      notification.success({});
      fetchTreeData();
      return true;
    } else {
      return false;
    }
  }, []);

  const handleSubmitDir = useCallback(async (formDs: DataSet, type: 'create' | 'update') => {
    const flag = await formDs.validate();
    if (!flag || !formDs.current) {
      return false;
    }
    const param = formDs.current.toData();
    const resp = type === 'create' ? await createPrintDirectory(param) : await updatePrintDirectory(param);
    if (getResponse(resp)) {
      notification.success({});
      fetchTreeData();
      return true;
    } else {
      return false;
    }
  }, []);

  const handleCreateDoc = useCallback((event: React.MouseEvent<HTMLElement>, record: Record) => {
    event.stopPropagation();
    const formDs = new DataSet(getDocFormDsConfig());
    const { directoryId, directoryName } = record.get(['directoryId', 'directoryName']);
    formDs.create({
      dirId: directoryId,
      dirName: directoryName,
    });
    Modal.open({
      title: intl.get("hrpt.printTemplate.view.title.createDoc").d("新建单据"),
      children: (
        <Form dataSet={formDs} labelLayout={LabelLayout.float}>
          <TextField name='dirName' />
          <TextField name='docCode' restrict="a-zA-Z0-9-_." />
          <IntlField name='docName' />
          <Select name='sceneCode' />
          <Lov name='combineLov' />
          <IntlField name='remark' />
        </Form>
      ),
      onOk: () => handleSubmitDoc(formDs),
    });
  }, [handleSubmitDoc]);

  const handleEditDir = useCallback((event: React.MouseEvent<HTMLElement>, record: Record, type: 'create' | 'update') => {
    event.stopPropagation();
    const createFlag: boolean = type === 'create';
    const formDs = new DataSet(getDirFormDsConfig(createFlag));
    if (createFlag) {
      const { linkCode: menuGroupCode, directoryName: menuGroupName } = record.get([
        'linkCode', 'directoryName', 'tenantId',
      ]);
      formDs.create({
        menuGroupCode,
        menuGroupName,
        tenantId: getCurrentOrganizationId(),
      });
    } else {
      const { directoryId, directoryName, objectVersionNumber, _token } = record.get([
        'directoryId', 'directoryName', 'objectVersionNumber', '_token',
      ]);
      formDs.create({
        directoryId,
        directoryName,
        objectVersionNumber,
        _token,
        tenantId: getCurrentOrganizationId(),
      }).status = RecordStatus.update;
    }
    Modal.open({
      title: createFlag ? intl.get("hrpt.printTemplate.view.title.createDir").d("新建目录") :
        intl.get("hrpt.printTemplate.view.title.editDir").d("编辑目录"),
      children: (
        <Form dataSet={formDs} labelLayout={LabelLayout.float}>
          <TextField name='menuGroupName' hidden={!createFlag} />
          <TextField name='directoryCode' hidden={!createFlag} restrict="a-zA-Z0-9-_." />
          <IntlField name='directoryName' />
        </Form>
      ),
      onOk: () => handleSubmitDir(formDs, type),
    });
  }, [handleSubmitDir]);

  const nodeRenderer = useCallback(({ record }) => {
    if (!record) {
      return;
    }
    const { title, docCode, parentLinkCode, [idField]: code } = record.get(['title', 'docCode', 'parentLinkCode', idField]);
    // 非根目录和单据的目录
    const isDir = code !== rootDirCode && isNil(docCode);
    // 非一级目录
    const isNotOneLevelDir = isDir && parentLinkCode !== '-1';
    return (
      <OverflowTip title={title}>
        <span className={styles['tree-node-content']}>
          {title}
          {!isTenant && isNotOneLevelDir && (
            <Tooltip title={intl.get('hzero.common.button.edit').d('编辑')}>
              <Icon
                type='mode_edit'
                style={{ right: '14px' }}
                className={styles['tree-node-icon']}
                onClick={event => handleEditDir(event, record, 'update')}
              />
            </Tooltip>
          )}
          {!isTenant && canEdit && isDir && (
            <Tooltip
              title={isNotOneLevelDir ?
                intl.get("hrpt.printTemplate.view.title.createDoc").d("新建单据")
                : intl.get("hrpt.printTemplate.view.title.createDir").d("新建目录")}
            >
              <Icon
                type='add'
                className={styles['tree-node-icon']}
                onClick={event => {
                  isNotOneLevelDir ? handleCreateDoc(event, record) : handleEditDir(event, record, 'create');
                }}
              />
            </Tooltip>
          )}
        </span>
      </OverflowTip>
    );
  }, [isTenant, handleCreateDoc, handleEditDir]);

  const handleSelect = useCallback((_, info) => {
    if (!info || !info.node || !info.node.key) {
      return;
    }
    const nodeKey = info.node.key;
    const selectedRecord = treeDs.find(record => !isNil(record.get(idField)) && nodeKey === record.get(idField));
    if (selectedRecord) {
      selectedRecord.set(expandField, !selectedRecord.get(expandField));
      // 单据
      if (!isNil(selectedRecord.get('docCode'))) {
        setEditing(true);
        setSelectedKeys([nodeKey]);
        setCurrentDocument(selectedRecord.toData());
      }
    }
  }, [treeDs]);

  const handleExpand = useCallback((expandedKeys: any[]) => {
    runInAction(() => {
      treeDs.forEach(record => {
        if (expandedKeys.length > 0 && !isNil(record.get(idField)) && expandedKeys.includes(record.get(idField))) {
          record.set(expandField, true);
        } else {
          record.set(expandField, false);
        }
      });
    });
  }, []);

  return (
    <div className={styles['tree-container']}>
      <Spin spinning={loading}>
        <div
          className={["root-dir", (selectedKeys || []).includes(rootDirCode) && "active"].filter(Boolean).join(" ")}
          onClick={() => { setEditing(false); setSelectedKeys([rootDirCode]); setCurrentDocument({ [idField]: rootDirCode }); }}
        >
          {intl.get("hrpt.printTemplate.view.title.rootDir").d("全部")}
        </div>
        <Tree
          dataSet={treeDs}
          multiple={false}
          showIcon={false}
          showLine={{ showLeafIcon: false }}
          selectedKeys={selectedKeys}
          onExpand={handleExpand}
          onSelect={handleSelect}
          renderer={nodeRenderer}
        />
      </Spin>
    </div>
  );
});

export default memo(LeftTree);