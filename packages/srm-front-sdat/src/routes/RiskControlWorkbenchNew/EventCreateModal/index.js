/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/**
 * 新增风险事件Modal
 */
import React, { useCallback, useState, useEffect } from 'react';
import {
  Form,
  Lov,
  TextArea,
  Select,
  TextField,
  // Button,
  Icon,
  // Row,
  // Col,
  // Tooltip,
  Attachment,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { getResponse } from '@/utils/utils';
import {
  fetchThemeList,
  // fetchSaveThemeType,
  // fetchTypePeople,
} from '@/services/riskNewWorkPlaceService';

import styles from './index.less';

const { Option, OptGroup } = Select;

let parentMap = {};

export default function EventCreateModal(props) {
  const { eventCreateDS } = props;

  const [created, setCreated] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [allList, setAllList] = useState([]);

  useEffect(() => {
    eventCreateDS.create(
      {
        chargeList: [
          {
            id: getCurrentUser().id,
            realName: getCurrentUser().realName,
            loginName: getCurrentUser().loginName,
          },
        ],
      },
      0
    );

    return () => {
      parentMap = {};
    };
  }, []);

  const reset = useCallback(() => {
    setIsCreate(false);
    setCreated(null);
  }, [created]);

  const handlePopupHiddenChange = useCallback(
    (hidden) => {
      if (hidden) {
        reset();
      }
    },
    [reset]
  );

  const handleQueryThemeList = (type) => {
    fetchThemeList({ tenantId: getCurrentOrganizationId() }).then((res) => {
      if (getResponse(res)) {
        let selectedCode = '';
        let label = '';

        if (Array.isArray(res) && res.length) {
          res.forEach((item) => {
            parentMap[item.itemId] = item.itemCode;
            if (
              item.tenantId !== 0 &&
              item.themeLevel === 1 &&
              item.children &&
              item.children.length
            ) {
              item.children.forEach((item2) => {
                item2.type = 'org';
                if (item2.itemName === created) {
                  selectedCode = item2.itemCode;
                  label = item2.itemName;
                }
              });
            }
          });
        }

        // 新建保存 设置默认选中
        if (type === 'save') {
          if (eventCreateDS && eventCreateDS.current) {
            eventCreateDS.current.set('itemCode', selectedCode);
            eventCreateDS.current.set('itemName', label);
          }
          setCreated(null);
        }
        // if (editType !== 'create') {
        //   putDefaultPeople(selectedCode);
        // }
        setAllList(res);
      }
    });
  };

  /**
   * 选择类型设置默认经办人
   */
  // const putDefaultPeople = (itemCode = '') => {
  //   if (itemCode) {
  //     fetchTypePeople({
  //       defineId: '-1',
  //       tenantId: getCurrentOrganizationId(),
  //       itemCode,
  //     }).then(res => {
  //       if (getResponse(res)) {
  //         if (eventCreateDS && eventCreateDS.current && Array.isArray(res) && res.length) {
  //           const ids = res.map(item => item.personId);
  //           const names = res.map(item => item.personName);
  //           eventCreateDS.current.set('personList', ids);
  //           eventCreateDS.current.set('nameList', names);
  //         }
  //       }
  //     });
  //   }
  // };

  const renderOptions = useCallback(() => {
    return (allList || []).map((item, index1) => {
      return (
        <OptGroup key={`${item.itemId}-${index1}`} label={item.itemName}>
          {item.children.length
            ? item.children.map((item2, index) => {
                return (
                  <Option
                    key={`${item2.itemCode}-${index}-item`}
                    value={item2.itemCode}
                    fieldType={item2.type}
                  >
                    {item2.itemName}
                  </Option>
                );
              })
            : null}
        </OptGroup>
      );
    });
  }, [allList]);

  /**
   * 新增的类型 编辑操作
   * 编辑操作先在前端列表中删除
   */
  const handleEdit = (e, record) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCreate) return; // 新建状态下不能编辑

    const localRecord = record?.toData() ?? {};
    let obj = {};
    const list = [...allList];

    // 删除前端列表中的数据
    list.forEach((item) => {
      if (item.tenantId !== 0 && item.themeLevel === 1) {
        item.children.forEach((item2, index) => {
          if (item2.itemCode === localRecord.value) {
            obj = { ...item2 };
            item.children.splice(index, 1);
          }
        });
      }
    });

    setCreated(obj.itemName);
    setIsCreate(true);
    setAllList(list);
  };

  /**
   * option个性化
   * @param {*} param
   */
  const optionRenderer = ({ record, text }) => {
    const obj = record?.toData() ?? {};
    const type = obj?.__OTHER_OPTION_PROPS__?.fieldType ?? '';

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          lineHeight: '24px',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '84%',
          }}
        >
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
          {type === 'org' ? (
            <Icon
              style={{
                fontSize: '12px',
                marginLeft: '8px',
                zIndex: '10',
                cursor: 'pointer',
              }}
              type="mode_edit"
              onClick={(e) => handleEdit(e, record)}
            />
          ) : null}
        </div>
        {type !== 'org' ? (
          <span className={styles['risk-type-option-tag']}>
            {intl.get('sdat.riskControl.view.tag.predefined').d('预定义')}
          </span>
        ) : (
          <span className={styles['risk-type-option-tag-org']}>
            {intl.get('sdat.riskControl.view.tag.customize').d('自定义')}
          </span>
        )}
      </div>
    );
  };

  const handleChangeType = (value) => {
    let label = '';
    // let typeStr = '';
    let itemId = '';

    if (allList) {
      allList.forEach((item) => {
        if (item.children && item.children.length) {
          item.children.forEach((item2) => {
            if (item2.itemCode === value) {
              label = item2.itemName;
              // typeStr = item;
              itemId = item2.parentId;
            }
          });
        }
      });
    }

    if (eventCreateDS && eventCreateDS.current) {
      eventCreateDS.current.set('itemName', label);
      eventCreateDS.current.set('firstItemCode', parentMap[itemId] || '');
    }

    // if (typeStr && typeStr.tenantId !== 0 && typeStr.themeLevel === 1) {
    //   putDefaultPeople(value);
    // }
  };

  return (
    <div id="sdat-risk-event-create-modal" className={styles['create-risk-modal-basic']}>
      <Form dataSet={eventCreateDS} columns={1} labelLayout="float">
        <Lov name="companyObj" />
        <TextField name="manualEventName" showLengthInfo />
        <TextArea name="manualEventDesc" showLengthInfo autoSize={{ minRows: 4 }} />
        <Select name="eventLevel" />
        <Select
          name="secondItemCode"
          optionTooltip="overflow"
          // popupContent={renderPopupContent}
          optionRenderer={optionRenderer}
          onPopupHiddenChange={handlePopupHiddenChange}
          onChange={handleChangeType}
          onFocus={handleQueryThemeList}
          getPopupContainer={() => document.getElementById('sdat-risk-event-create-modal')}
          tabIntoPopupContent
        >
          {renderOptions()}
        </Select>
        <Lov name="chargeList" />
        <Lov name="stakeholderList" />
        <Attachment name="attachmentUuid" sortable={false} />
      </Form>
    </div>
  );
}
