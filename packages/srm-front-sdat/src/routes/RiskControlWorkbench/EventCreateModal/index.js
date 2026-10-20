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
  Button,
  Icon,
  Row,
  // Col,
  Tooltip,
  Attachment,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getResponse } from '@/utils/utils';
import {
  fetchThemeList,
  fetchSaveThemeType,
  fetchTypePeople,
} from '@/services/riskWorkPlaceService';

import styles from './index.less';

const { Option, OptGroup } = Select;
let saveLock = 1;

export default function EventCreateModal(props) {
  const { eventCreateDS } = props;

  const [created, setCreated] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [others, setOthers] = useState([]);
  const [allList, setAllList] = useState([]);
  const [dimension, setDimension] = useState('');

  useEffect(() => {
    eventCreateDS.create({}, 0);
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

  const createItem = () => {
    setIsCreate(true);
  };

  const handleQueryThemeList = (type, editType) => {
    fetchThemeList({ tenantId: getCurrentOrganizationId() }).then((res) => {
      if (getResponse(res)) {
        let arr = [];
        let selectedCode = '';
        let label = '';

        if (Array.isArray(res) && res.length) {
          res.forEach((item) => {
            if (
              item.tenantId !== 0 &&
              item.themeLevel === 1 &&
              item.childList &&
              item.childList.length
            ) {
              item.childList.forEach((item2) => {
                item2.type = 'org';
                if (item2.themeName === created) {
                  selectedCode = item2.themeCode;
                  label = item2.themeName;
                }
              });
              arr = item.childList;
            }
          });
        }

        // 新建保存 设置默认选中
        if (type === 'save') {
          if (eventCreateDS && eventCreateDS.current) {
            eventCreateDS.current.set('themeCode', selectedCode);
            eventCreateDS.current.set('themeName', label);
          }
          setCreated(null);
        }
        if (editType !== 'create') {
          putDefaultPeople(selectedCode);
        }
        setOthers(arr);
        setAllList(res);
      }
    });
  };

  /**
   * 选择类型设置默认经办人
   */
  const putDefaultPeople = (themeCode = '') => {
    if (themeCode) {
      fetchTypePeople({
        defineId: '-1',
        tenantId: getCurrentOrganizationId(),
        themeCode,
      }).then((res) => {
        if (getResponse(res)) {
          if (eventCreateDS && eventCreateDS.current && Array.isArray(res) && res.length) {
            const ids = res.map((item) => item.personId);
            const names = res.map((item) => item.personName);
            eventCreateDS.current.set('personList', ids);
            eventCreateDS.current.set('nameList', names);
          }
        }
      });
    }
  };

  /**
   * 保存新增的数据
   */
  const saveNewData = async () => {
    const list = [...allList];

    if (created) {
      if (editItem) {
        if (created === editItem.themeName) {
          // 内容未改动
          handleQueryThemeList('save', 'edit');
          setIsCreate(false);
          setEditItem(null);
          return;
        }
        // 编辑保存
        if (saveLock !== 1) return;
        saveLock = 0;
        const res = await fetchSaveThemeType({
          ...editItem,
          themeName: created,
          tenantId: getCurrentOrganizationId(),
        });
        saveLock = 1;

        if (getResponse(res)) {
          handleQueryThemeList('save', 'edit');
          setIsCreate(false);
          setEditItem(null);
          setAllList(list);
        }
      } else {
        // 新建保存
        if (saveLock !== 1) return;
        saveLock = 0;
        const res = await fetchSaveThemeType({
          themeName: created,
          tenantId: getCurrentOrganizationId(),
        });
        saveLock = 1;

        if (getResponse(res)) {
          handleQueryThemeList('save', 'create');
          setIsCreate(false);
          setEditItem(null);
          setAllList(list);
        }
      }
    }
  };

  /**
   * 取消保存
   */
  const cancelSave = () => {
    if (editItem) {
      // 编辑取消
      const list = [...allList];

      // 前端列表中的数据
      list.forEach((item) => {
        if (item.tenantId !== 0 && item.themeLevel === 1) {
          item.childList.push({ ...editItem });
        }
      });
      setEditItem(null);
      setAllList(list);
    }
    setIsCreate(false);
    setCreated(null);
  };

  const renderPopupContent = useCallback(
    ({ content }) => {
      return (
        <>
          {content}
          {others.length ? null : (
            <div
              style={{
                color: '#868d9c',
                padding: '0 12px',
                lineHeight: '32px',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              {intl.get('sdat.riskControl.view.title.other').d('其他')}
            </div>
          )}
          <div style={{ padding: '0 16px' }}>
            {isCreate ? (
              <Row
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  lineHeight: '32px',
                }}
              >
                <div style={{ width: '100%', marginRight: '16px' }}>
                  <TextField
                    autoFocus
                    style={{ width: '100%' }}
                    value={created}
                    maxLength={20}
                    showLengthInfo
                    onInput={(e) => setCreated(e?.target?.value?.trim() ?? '')}
                  />
                </div>
                <div style={{ marginRight: '16px' }}>
                  <Tooltip title={intl.get('sdat.riskControl.view.button.save').d('保存')}>
                    <a>
                      <Icon style={{ cursor: 'pointer' }} type="check" onClick={saveNewData} />
                    </a>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip title={intl.get('sdat.riskControl.view.button.cancel').d('取消')}>
                    <a>
                      <Icon style={{ cursor: 'pointer' }} type="close" onClick={cancelSave} />
                    </a>
                  </Tooltip>
                </div>
              </Row>
            ) : null}
            <div style={{ margin: '6px 0' }}>
              <Button
                icon="add"
                funcType="link"
                color="primary"
                disabled={isCreate}
                onClick={createItem}
              >
                {intl.get('sdat.riskControl.view.button.create').d('新增')}
              </Button>
            </div>
          </div>
        </>
      );
    },
    [isCreate, others, reset]
  );

  const renderOptions = useCallback(() => {
    return (allList || []).map((item) => {
      return (
        <OptGroup key={item.themeId} label={item.themeName}>
          {item.childList.length
            ? item.childList.map((item2) => {
                return (
                  <Option key={item2.themeCode} value={item2.themeCode} fieldType={item2.type}>
                    {item2.themeName}
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
        item.childList.forEach((item2, index) => {
          if (item2.themeCode === localRecord.value) {
            obj = { ...item2 };
            item.childList.splice(index, 1);
          }
        });
      }
    });

    setEditItem({ ...obj });
    setCreated(obj.themeName);
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

  /**
   * 切换选择维度
   */
  const changeDimension = (value) => {
    if (eventCreateDS && eventCreateDS.current) {
      eventCreateDS.current.set('scopeObj', '');
      eventCreateDS.current.set('companyId', value === '0' ? '-1' : '');
    }
    setDimension(value);
  };

  const handleChangeType = (value) => {
    let label = '';
    let typeStr = '';

    if (allList) {
      allList.forEach((item) => {
        if (item.childList && item.childList.length) {
          item.childList.forEach((item2) => {
            if (item2.themeCode === value) {
              label = item2.themeName;
              typeStr = item;
            }
          });
        }
      });
    }

    if (eventCreateDS && eventCreateDS.current) {
      eventCreateDS.current.set('themeName', label);
      eventCreateDS.current.set('personList', []);
      eventCreateDS.current.set('nameList', []);
    }

    if (typeStr && typeStr.tenantId !== 0 && typeStr.themeLevel === 1) {
      putDefaultPeople(value);
    }
  };

  // const handleChangeScope = (rcd) => {
  //   if (eventCreateDS && eventCreateDS.current) {
  //     eventCreateDS.current.set('companyId', rcd?.companyId ?? '');
  //   }
  // };

  // const handleChangeSupplier = (rcd) => {
  //   if (eventCreateDS && eventCreateDS.current) {
  //     eventCreateDS.current.set('companyId', rcd?.categoryId ?? '');
  //   }
  // };

  return (
    <div id="sdat-risk-event-create-modal" className={styles['create-risk-modal-basic']}>
      <Form dataSet={eventCreateDS} columns={1} labelLayout="float">
        <Lov name="companyObj" />
        <TextArea name="description" showLengthInfo autoSize={{ minRows: 4 }} />
        <Select name="eventLevel" />
        <Select
          name="themeCode"
          optionTooltip="overflow"
          popupContent={renderPopupContent}
          optionRenderer={optionRenderer}
          onPopupHiddenChange={handlePopupHiddenChange}
          onChange={handleChangeType}
          onFocus={handleQueryThemeList}
          getPopupContainer={() => document.getElementById('sdat-risk-event-create-modal')}
          tabIntoPopupContent
        >
          {renderOptions()}
        </Select>
        <Lov name="personObj" />
        <Select name="dimension" onChange={changeDimension} />
        {/* onChange={handleChangeScope} */}
        {dimension === '1' ? <Lov name="scopeObj" /> : null}
        {/* onChange={handleChangeSupplier} */}
        {dimension === '2' ? <Lov name="supplierObj" /> : null}
        <Attachment name="attachmentUuid" sortable={false} />
      </Form>
    </div>
  );
}
