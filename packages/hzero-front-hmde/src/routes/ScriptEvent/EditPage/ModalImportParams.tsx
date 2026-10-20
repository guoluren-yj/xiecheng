import React, { useEffect, useState } from 'react';
import { CodeArea, notification, Icon, Tooltip } from 'choerodon-ui/pro/lib';
import styles from './index.less';
import { IStore } from '@/routes/ScriptEvent/store';

function ModalContent(props: { modal: any; store: IStore; onSave: (resData?) => void }) {
  // state //
  const [edition, setEdition] = useState<string>('');

  // on: init //
  useEffect(() => {
    let formattedObject = {};
    if (props.store.state.importParamsDirection === 'in') {
      formattedObject = props.store.state.inputReferenceFormattedObject;
    } else {
      formattedObject = props.store.state.outputReferenceFormattedObject;
    }
    setEdition(JSON.stringify(formattedObject, null, 2));
  }, []);

  // on: update //
  useEffect(() => {
    props.modal.handleOk(() => {
      props.store.setState('importParamsCodeEdition', edition);
      const processed = processInputArgJson(edition);

      if (processed !== null) {
        props.store.setState('importParamsProcessedData', processed.neatenedArray);
        if (props.store.state.importParamsDirection === 'in') {
          props.store.setState('inputReferenceFormattedObject', processed.formattedTree);
        } else {
          props.store.setState('outputReferenceFormattedObject', processed.formattedTree);
        }
        props.modal.close();
        // props.store.saveEdition()
        setTimeout(() => {
          props.onSave(processed.neatenedArray);
        }, 0);
      }

      return false;
    });
    props.modal.handleCancel(() => {
      props.modal.close();
    });
  }, [edition]);

  return (
    <div className={styles['script-event-modal-import-params']}>
      <CodeArea
        className="codearea"
        value={edition}
        onChange={(val) => {
          setEdition(val);
        }}
        style={{ height: '100%' }}
      />
    </div>
  );
}

function ModalConfig(props: { store: IStore; onSave: () => void }) {
  return {
    title: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {`导入参数${props.store.state.importParamsDirection === 'in' ? '（入参）' : '（出参）'}`}
        <Tooltip title="支持导入JSON格式数据，将会解析JSON中的键与值类型。对于数组，依其首个元素解析到泛型，形如：Array<Object>、Array<string>、Array<number>。null或undefined值将被视为any类型。">
          <Icon type="help_outline" />
        </Tooltip>
      </div>
    ),
    okText: '解析并导入',
    children: <ModalContent {...(props as { modal: any; store: IStore; onSave: () => void })} />,
    okFirst: true,
    drawer: true,
    closable: true,
  };
}

export default ModalConfig;

// helpers //

function processInputArgJson(json: string) {
  const parsedResult = parseJsonString(json);
  if (parsedResult.status) {
    return convertDataForDS(parsedResult.parsed);
  }
  return null;
}

function parseJsonString(jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString);

    return {
      status: true,
      parsed,
    };
  } catch (error) {
    notification.open({
      message: '入参JSON解析失败',
      description: '',
    });
    return {
      status: false,
      parsed: null,
    };
  }
}

interface FlattenedArrayItem {
  key: string;
  type: string;
  id: number;
  parentId: number;
  generic?: string;
}

function convertDataForDS(parsed: any) {
  const flattenedArray: FlattenedArrayItem[] = [];

  // const formattedTree = formatObject(dfs('root', parsed, 0, flattenedArray));
  dfs('root', parsed, 0, flattenedArray);

  flattenedArray.shift(); // remove root

  const neatenedArray = flattenedArray.map((item, index, array) => {
    let _parentId: any;

    if (item.parentId && item.parentId !== 1) {
      if (item.parentId === item.id) {
        _parentId = array[index - 1].parentId;
      } else {
        _parentId = item.parentId;
      }
    }

    const _type = ['null', 'undefined'].includes(item.type) ? 'any' : item.type;

    return {
      code: item.key,
      type: item.generic ? `Array<${_type}>` : _type,
      id: item.id,
      parentId: _parentId,
      remark: '',
    };
  });

  return {
    neatenedArray,
    formattedTree: parsed,
  };
}

/**
 * todo:
 * 泛型record还是保留输出，因为需要用它的id
 * 最后遍历整个array的时候合并泛型record
 * 【新方案】
 * 在节点迭代中动态下沉数组入口节点
 */
function dfs(entry: string, data: any, prevID: number, flattenedArray: FlattenedArrayItem[]) {
  let newData;
  let generic: any;
  let currID = -1;

  if (
    flattenedArray.length > 0 &&
    flattenedArray[flattenedArray.length - 1].type === 'Array' &&
    flattenedArray[flattenedArray.length - 1].key === entry
  ) {
    const entryArray = flattenedArray.pop()!;
    // eslint-disable-next-line
    prevID = entryArray.parentId;
    generic = entryArray.type;
  }

  currID = flattenedArray.length + 1;

  if (preciseType(data) === 'array') {
    newData = [];

    if (data.length > 0) {
      flattenedArray.push({
        key: entry,
        type: 'Array',
        id: currID,
        parentId: prevID,
        generic,
      });
    }
    newData = dfs(entry, data[0], currID, flattenedArray);
  } else if (preciseType(data) === 'object') {
    newData = {};

    flattenedArray.push({
      key: entry,
      type: 'Object',
      id: currID,
      parentId: prevID,
      generic,
    });

    Object.keys(data).forEach((item) => {
      newData[item] = dfs(item, data[item], currID, flattenedArray);
    });
  } else {
    newData = data;

    flattenedArray.push({
      key: entry,
      type: preciseType(newData),
      id: currID,
      parentId: prevID,
      generic,
    });
  }

  return newData;
}

function preciseType(data) {
  const dict = {
    '[object Array]': 'array',
    '[object Object]': 'object',
    '[object Number]': 'number',
    '[object Function]': 'function',
    '[object String]': 'string',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined',
    '[object Boolean]': 'boolean',
  };

  return dict[Object.prototype.toString.call(data)];
}

// function formatObject(reducedOject: any) {
//   return reducedOject;
// }
