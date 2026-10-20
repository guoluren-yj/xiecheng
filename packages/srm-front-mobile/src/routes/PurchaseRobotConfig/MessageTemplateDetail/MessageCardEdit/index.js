import React, { useState, useMemo, useEffect } from 'react';
import {
  TextField,
  Output,
  Form,
  DataSet,
  Dropdown,
  Menu,
  Icon,
  Button,
  Modal,
  Spin,
  IntlField,
} from 'choerodon-ui/pro';
import uuid from 'uuid';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import ExecutableCodeAreaModal from '@/components/ExecutableCodeArea/ExecutableCodeAreaModal';
import {
  cardEditDS,
  cardButtonEditDS,
  cardVerticalContentEditDS,
  cardSelectEditDS,
} from '../indexDS';
import { cardFieldDS } from './indexDS';
import MessageCardList from './MessageCardList';
import DragButtonForm from './DragButtonForm';
import PreviewCard from './PreviewCard';
import styles from './index.less';
import noCardImage from './none.svg';
import UploadImage from './UploadImage';
import CardFields from './CardFields';
import SelectFields from './SelectFields';

const organizationId = getCurrentOrganizationId();

let buttonIndex = 1;

let cardEditDataSet = new DataSet(cardEditDS());
let cardVerticalContentEditSet = new DataSet(cardVerticalContentEditDS());

function MessageCardEdit(props) {
  const [activeId, setActiveId] = useState('');
  const [fields, setFields] = useState([]);
  const [buttonFields, setButtonField] = useState([]);
  const [cardVerticalContentEditSetFlag, setCardVerticalContentEditSetFlag] = useState(false);
  const [selectFields, setSelectField] = useState([]);
  const [cardFieldDataSet] = useState(
    new DataSet(
      cardFieldDS(({ dataSet }) => {
        setFields(dataSet.toData());
      })
    )
  );

  const [cardSelectEditDataSet] = useState(
    new DataSet(
      cardSelectEditDS(({ dataSet }) => {
        setSelectField(dataSet.toData());
      })
    )
  );

  const { editFormDataSet, modal, readOnly = false } = props;

  // 字段配置ds
  // const cardEditDataSet = useMemo(() => {
  //   return new DataSet(cardEditDS());
  // }, []);

  // 按钮配置ds
  const cardButtonEditDataSet = useMemo(() => {
    return new DataSet(cardButtonEditDS());
  }, []);

  // 初始化时定位第一条数据
  useEffect(() => {
    cardEditDataSet = new DataSet(cardEditDS());
    editFormDataSet.query().then((res) => {
      const { content = [] } = res;
      if (content.length) {
        changeItem(content[0], 0);
      }
    });
  }, []);

  useEffect(() => {
    return modal.handleOk(submitHandler);
  }, [fields]);

  /**
   * 提交数据
   */
  const submitHandler = async () => {
    if (readOnly) return true;
    saveSourceJsonData(fields);
    const fieldRes = await cardFieldDataSet.validate();
    if (!fieldRes) return false;

    const selectRes = await cardSelectEditDataSet.validate();
    if (!selectRes) return false;

    // 校验数据
    const sumbitData = editFormDataSet.toData();
    for (let i = 0; i < sumbitData.length; i++) {
      const { sourceJson } = sumbitData[i];
      const sourceJsonData = JSON.parse(sourceJson) || {};
      const illegaFieldData = Object.keys(sourceJsonData).filter(
        (item) => ['title', 'desc'].includes(item) && !sourceJsonData[item]?.text
      );
      const { buttons = [] } = sourceJsonData;
      const illegaButtonFieldData = buttons.filter((item) => Object.keys(item).length < 5);
      if (illegaFieldData.length || illegaButtonFieldData.length) {
        changeItem(sumbitData[i], i);
        // eslint-disable-next-line no-loop-func
        setTimeout(() => {
          cardEditDataSet.validate();
          cardButtonEditDataSet.validate();
        }, 0);
        return false;
      }
    }
    await editFormDataSet.submit();
    return false;
  };

  /**
   * 切换卡片
   */
  const changeItem = async (card = {}, index) => {
    if (card.convertId === activeId) return;

    // 切换前保存旧卡片配置的字段信息
    if (activeId) {
      saveSourceJsonData(fields);
    }

    // 清空旧数据
    setFields([]);
    setSelectField([]);
    setButtonField([]);
    buttonIndex = 1;
    cardButtonEditDataSet.removeAll();

    // 设置新数据
    setActiveId(card.convertId);
    cardEditDataSet = new DataSet(cardEditDS());
    cardVerticalContentEditSet = new DataSet(cardVerticalContentEditDS());
    const record = await editFormDataSet.locate(index);
    // 恢复配置的字段
    resoreJsonData(record);
  };

  /**
   * 点击下拉回调
   * @param {obj}
   */
  const menuClick = ({ key }) => {
    let moveDom = null;
    if (key === 'field') {
      // addField();
      cardFieldDataSet.create({
        fieldName: null,
        fieldCode: null,
        fieldType: 'text',
        _tls: null,
      });
      setFields(cardFieldDataSet.toData());
      moveDom = document.getElementById('filed-position');
    } else if (['action', 'url'].includes(key)) {
      addButtonField(key);
      moveDom = document.getElementById('button-position');
    } else if (key === 'subContent') {
      addCardVerticalContent();
      moveDom = document.getElementById('vertical-position');
    } else if (key === 'select') {
      cardSelectEditDataSet.create(
        {
          fieldName: null,
          fieldCode: null,
          lookupCode: '',
          dataIndex: null,
          displayField: null,
          fieldType: 'select',
          _tls: null,
        },
        0
      );
      setSelectField(cardSelectEditDataSet.toData());
      moveDom = document.getElementById('select-position');
    }

    // 做定位
    if (moveDom && moveDom.scrollIntoView) {
      setTimeout(() => {
        moveDom.scrollIntoView({
          block: 'start',
          behavior: 'smooth',
        });
      }, 0);
    }
  };

  /**
   * 添加按钮字段
   */
  const addButtonField = (type, defaultValue = {}) => {
    const fieldName =
      type === 'action'
        ? ['buttonName', 'eventKey', 'buttonStyle']
        : ['buttonName', 'buttonUrl', 'buttonStyle'];
    const newButtonField = {
      id: uuid(),
      name: fieldName,
      index: buttonIndex++,
    };
    // 给默认值防止校验不通过
    const newDefaultValue = {
      ...defaultValue,
      buttonType: type,
      [type === 'action' ? 'buttonUrl' : 'buttonKey']: 'default',
    };
    if (Object.keys(defaultValue).length) {
      cardButtonEditDataSet.create(newDefaultValue, buttonIndex - 2);
      return newButtonField;
    }
    cardButtonEditDataSet.create(newDefaultValue, buttonFields.length);
    setButtonField(buttonFields.concat(newButtonField));
  };

  /**
   * 动态添加字段
   */
  const addCardVerticalContent = () => {
    if (!cardVerticalContentEditSetFlag) {
      setCardVerticalContentEditSetFlag(true);
      cardVerticalContentEditSet.create({}, 0);
    }
  };

  /**
   * 删除按钮字段
   */
  const deleteButtonField = (index) => {
    buttonFields.splice(index, 1);
    cardButtonEditDataSet.remove(cardButtonEditDataSet.records[index]);
    setButtonField([...buttonFields]);
  };

  /**
   * 删除卡片
   */
  const deleteCard = async () => {
    const oldRecord = editFormDataSet.current;
    const res = await editFormDataSet.delete([oldRecord], {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('smbl.purchaseRobotConfig.deleteCard.confirm').d('是否确认删除卡片?'),
    });
    if (res?.success) {
      const { data } = editFormDataSet;
      if (data.length) {
        changeItem(data[0].toJSONData(), 0); // 定义到第一条
      } else {
        cardEditDataSet.reset();
        setActiveId('');
      }
    }
  };

  /**
   * 删除副级内容
   */
  const deleteVerticalContent = () => {
    cardVerticalContentEditSet.removeAll();
    setCardVerticalContentEditSetFlag(false);
  };

  /**
   * 新增/编辑卡片
   */
  const editCard = (isEdit) => {
    // 缓存当前编辑行索引
    const oldIndex = editFormDataSet.findIndex((record) => record.get('convertId') === activeId);
    if (!isEdit) {
      saveSourceJsonData(fields);
      editFormDataSet.create({}, 0);
      // 新建设置副级内容默认不展示
      setCardVerticalContentEditSetFlag(false);
    }
    Modal.open({
      title: isEdit
        ? intl.get('smbl.purchaseRobotConfig.button.editCard').d('修改卡片')
        : intl.get('smbl.purchaseRobotConfig.button.addCard').d('添加卡片'),
      okText: intl.get(`hzero.common.button.save`).d('保存'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      children: <EditCardForm isEdit={isEdit} />,
      onOk: async () => {
        if (isEdit) {
          const valid = await cardEditDataSet.validate();
          const valid2 = await cardButtonEditDataSet.validate();
          // console.log(valid, valid2, cardEditDataSet.fields, cardEditDataSet.getValidationErrors())
          if (!valid || !valid2) {
            notification.warning({
              message: intl
                .get(`smbl.purchaseRobotConfig.notification.failsAndChange`)
                .d('存在字段未校验通过，请修改后点击！'),
            });
            return false;
          }
          saveSourceJsonData(fields);
        }
        const res = await editFormDataSet.submit();
        if (!res) {
          return false;
        }
        if (getResponse(res)) {
          const { content = [] } = await editFormDataSet.query();
          if (isEdit) {
            editFormDataSet.locate(oldIndex);
          } else {
            changeItem(content[0], 0); // 定义到第一条
          }
        }
      },
      onCancel: () => {
        if (!isEdit) {
          editFormDataSet.shift();
        }
        editFormDataSet.locate(oldIndex);
      },
    });
  };

  /**
   * 保存json字符串
   */
  const saveSourceJsonData = () => {
    const data = (cardEditDataSet.current && cardEditDataSet.current.toJSONData()) || {};
    const _tls = data._tls || {};
    // 获取标题配置
    const titleField = { text: data.title };
    const subTitleField = { text: data.desc };
    const cardImag = { url: data.cardImag };
    const { cardLink } = data;
    // 获取按钮配置
    const buttonField = cardButtonEditDataSet.toJSONData();
    const buttonFieldJson = buttonField.map((item, index) => ({
      text: item.buttonName,
      type: item.buttonType,
      color: item.buttonStyle,
      seq: 10 * (index + 1),
      [item.buttonType === 'url' ? 'url' : 'key']:
        item.buttonType === 'url' ? item.buttonUrl : item.buttonKey,
      _tls: item._tls,
    }));

    const sourceJson = {
      title: titleField,
      subTitle: subTitleField,
      cardImag,
      fields: cardFieldDataSet.toData(),
      buttons: buttonFieldJson,
      verticalContentData,
      cardLink,
      selectedFields: cardSelectEditDataSet.toData(),
      _tls,
    };
    // 获取副级内容
    const verticalContentData =
      cardVerticalContentEditSet.current && cardVerticalContentEditSet.current.toJSONData();
    if (verticalContentData) {
      sourceJson.verticalContentData = verticalContentData;
    }
    if (editFormDataSet.current) {
      editFormDataSet.current.set('sourceJson', JSON.stringify(sourceJson));
    }
  };

  /**
   *回写json字段
   * @param {object} record
   */
  const resoreJsonData = (record) => {
    const sourceStr = record.get('sourceJson');
    const targetJson = sourceStr ? JSON.parse(sourceStr) : {};

    console.log(' parse  json : ', targetJson);

    const {
      title = {},
      subTitle = {},
      fields: customizeField = [],
      buttons = [],
      cardImag = {},
      verticalContentData,
      cardLink = null,
      selectedFields = [],
      _tls = null,
    } = targetJson;
    cardEditDataSet.deleteAll(false);
    cardEditDataSet.create({}, 0);

    const showFields = []; // 展示的field
    // 当前语言
    const userInfo = getCurrentUser();
    const currentLanguage = userInfo.language;
    const titleLanguage = (_tls?.title || {})[currentLanguage] || title.text;
    const subTitleLanguage = (_tls?.desc || {})[currentLanguage] || subTitle.text;

    cardEditDataSet.current.set('title', titleLanguage);
    cardEditDataSet.current.set('desc', subTitleLanguage);
    cardEditDataSet.current.set('cardImag', cardImag.url);
    cardEditDataSet.current.set('cardLink', cardLink);
    cardEditDataSet.current.set('_tls', _tls);

    // 副级内容处理
    if (verticalContentData) {
      setCardVerticalContentEditSetFlag(true);
      cardVerticalContentEditSet.deleteAll(false);
      cardVerticalContentEditSet.create({}, 0);
      const subContentTls = verticalContentData._tls;
      const subContentTtile =
        (subContentTls?.title || {})[currentLanguage] || verticalContentData.title;
      const subContentDesc =
        (subContentTls?.desc || {})[currentLanguage] || verticalContentData.desc;

      cardVerticalContentEditSet.current.set('title', subContentTtile);
      cardVerticalContentEditSet.current.set('desc', subContentDesc);
      cardVerticalContentEditSet.current.set('_tls', verticalContentData._tls);
    }

    cardFieldDataSet.loadData(customizeField);
    cardSelectEditDataSet.loadData(selectedFields);

    customizeField.forEach((field) => {
      showFields.push(field);
    });

    const showButtonFields = []; // 展示的buttonField
    buttons.forEach((item) => {
      const { type } = item;
      const defaultValue = {
        id: uuid(),
        buttonType: type,
        buttonName: item.text,
        buttonStyle: item.color,
        [item.key ? 'buttonKey' : 'buttonUrl']: item.key ? item.key : item.url,
        _tls: item._tls,
      };
      showButtonFields.push(addButtonField(type, defaultValue));
    });

    const showSelectedFields = [];
    selectedFields.forEach((field) => {
      showSelectedFields.push(field);
    });

    setFields(showFields);
    setButtonField(showButtonFields);
    setSelectField(showSelectedFields);
  };

  /**
   * 编辑卡片构成
   */
  const editCardCode = () => {
    const autoSaveId = `card_code_${editFormDataSet.current.get('convertId')}`;
    ExecutableCodeAreaModal.open(
      {
        drawer: true,
        title: intl.get('smbl.purchaseRobotConfig.button.cardForm').d('卡片构成'),
        okText: readOnly
          ? intl.get('smbl.purchaseRobotConfig.button.close').d('关闭')
          : intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('smbl.purchaseRobotConfig.button.close').d('关闭'),
        cancelButton: !readOnly,
        style: { width: '100%' },
        drawerOffset: 0,
        fullScreen: true,
        autoSaveId,
        onOk: () => {
          // 不进行校验，强制保存卡片，防止js代码丢失
          editFormDataSet.submit();
          return false;
        },
      },
      {
        readOnly,
        record: editFormDataSet.current,
        name: 'cardUuid',
      }
    );
  };

  // 新增配置下拉菜单
  const menu = (
    <Menu onClick={menuClick} style={{ width: 260 }}>
      {fields.length < 6 && (
        <Menu.Item key="field">
          {intl.get('smbl.purchaseRobotConfig.view.keyField').d('关键字段')}
        </Menu.Item>
      )}
      {buttonFields.length < 6 && (
        <Menu.Item key="action">
          {intl.get('smbl.purchaseRobotConfig.view.button').d('方法按钮')}
        </Menu.Item>
      )}
      {buttonFields.length < 6 && (
        <Menu.Item key="url">
          {' '}
          {intl.get('smbl.purchaseRobotConfig.view.url').d('链接按钮')}{' '}
        </Menu.Item>
      )}
      {/* <Menu.Item key="desc"> 描述 </Menu.Item> */}
      {!cardVerticalContentEditSetFlag && (
        <Menu.Item key="subContent">
          {intl.get('smbl.purchaseRobotConfig.view.verticalContent').d('副级内容')}
        </Menu.Item>
      )}
      <Menu.Item key="select">
        {intl.get('smbl.purchaseRobotConfig.view.selectOption').d('选项')}
      </Menu.Item>
    </Menu>
  );

  // 编辑卡片表单
  const EditCardForm = ({ isEdit }) => {
    return (
      <Form dataSet={editFormDataSet} columns={1} labelLayout="float">
        <IntlField name="cardName" />
        <TextField name="cardCode" restrict="A-Za-z-_" disabled={isEdit} />
        <IntlField name="remark" type="multipleLine" rows={2} resize="none" />
      </Form>
    );
  };

  // 卡片详情字段表单
  const EditCardDeatailForm = (prop) => {
    const { dataSet } = prop;
    return (
      <div className="card-right-head">
        <h3>{intl.get('smbl.purchaseRobotConfig.view.cardInfo').d('卡片信息')}</h3>
        <Form
          dataSet={dataSet}
          columns={2}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="cardName" />
          <Output name="cardCode" />
          <Output name="remark" />
          <Output
            name="cardUuid"
            hidden={Number(organizationId) !== 0}
            renderer={({ record }) =>
              Number(record?.get('tenantId')) === 0 ? (
                <a onClick={editCardCode}>
                  {readOnly
                    ? intl.get('hzero.common.view.title.view').d('查看')
                    : intl.get('hzero.common.button.editor').d('编辑')}
                </a>
              ) : null
            }
          />
          <Output name="cardMarmotCode" hidden={Number(organizationId) === 0} />
        </Form>
      </div>
    );
  };

  // 卡片标题配置
  const EditCardTitleForm = () => {
    return (
      <div className="card-right-content-title">
        <h3>{intl.get('smbl.purchaseRobotConfig.view.cardInfoManage').d('卡片内容管理')}</h3>
        <Form
          dataSet={cardEditDataSet}
          disabled={readOnly}
          columns={1}
          labelLayout={readOnly ? 'vertical' : 'float'}
          className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
          useColon={false}
        >
          {!readOnly ? (
            <>
              <IntlField name="title" />
              <IntlField name="desc" />
            </>
          ) : (
            <>
              <Output name="title" />
              <Output name="desc" />
            </>
          )}
          <Output
            name="cardImag"
            renderer={({ record, value }) => {
              return <UploadImage record={record} url={value} />;
            }}
          />
          {!readOnly ? <TextField name="cardLink" /> : null}
        </Form>
      </div>
    );
  };

  // 卡片副级内容配置
  const CardVerticalContentEdit = () => {
    return (
      <div className="card-right-content-title">
        <div className="sub-content-title">
          <div className="field-title-tag">
            {intl.get('smbl.purchaseRobotConfig.view.verticalContent').d('副级内容')}
          </div>
          <Icon type="delete" className="del-icon" onClick={() => deleteVerticalContent()} />
        </div>
        <Form
          dataSet={cardVerticalContentEditSet}
          disabled={readOnly}
          columns={1}
          labelLayout={readOnly ? 'vertical' : 'float'}
          className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
          useColon={false}
        >
          <IntlField name="title" />
          <IntlField name="desc" type="multipleLine" rows={2} resize="none" />
        </Form>
      </div>
    );
  };

  // 空太页
  const NoContent = () => {
    return (
      <div className={styles['message-card-empty']}>
        <img src={noCardImage} className="empty-img" alt="" />
        <div className="empty-tips">
          {!readOnly
            ? intl.get(`smbl.purchaseRobotConfig.view.noCardAndAdd`).d('暂无卡片，请先添加一张')
            : intl.get(`smbl.purchaseRobotConfig.view.noCard`).d('暂无卡片')}
        </div>
        {!readOnly && (
          <Button className="empty-button" color="primary" onClick={() => editCard()}>
            {intl.get('smbl.purchaseRobotConfig.button.addCard').d('添加卡片')}
          </Button>
        )}
      </div>
    );
  };

  // return <MessageCardContent />;
  if (!editFormDataSet.data.length && editFormDataSet.status !== 'loading') {
    return <NoContent />;
  }
  // 防止不能增量刷新界面
  // 模版编辑内容
  return (
    <div className={styles['message-card-template']}>
      <div className="card-left">
        {!readOnly && (
          <div className="card-left-head">
            <div className="card-left-head-wrap" onClick={() => editCard()}>
              <Icon type="add" />
              <span style={{ marginLeft: '8px' }}>
                {intl.get('smbl.purchaseRobotConfig.button.addCard').d('添加卡片')}
              </span>
            </div>
          </div>
        )}
        <Spin dataSet={editFormDataSet}>
          <MessageCardList
            {...{ activeId, editFormDataSet, editCard, deleteCard, changeItem, readOnly }}
          />
        </Spin>
      </div>
      <div className="card-content">
        <PreviewCard
          fields={fields}
          selectFields={selectFields}
          dataSet={cardEditDataSet}
          cardButtonEditDataSet={cardButtonEditDataSet}
          cardVerticalContentEditSet={cardVerticalContentEditSet}
        />
      </div>
      <div className="card-right">
        {/* 模版详情 */}
        <EditCardDeatailForm dataSet={editFormDataSet} />

        <div className="card-right-content">
          {/* 卡片标题 */}
          <EditCardTitleForm />
          <div id="filed-position" />
          {/* 字段拖拽区域 */}
          {Boolean(fields.length) && (
            <CardFields
              dataSet={cardFieldDataSet}
              readOnly={readOnly}
              onChange={() => {
                setFields(cardFieldDataSet.toData());
              }}
            />
          )}
          <div id="vertical-position" />
          {cardVerticalContentEditSetFlag && <CardVerticalContentEdit />}
          {/* 按钮拖拽区域 */}
          {Boolean(buttonFields.length) && (
            <DragButtonForm
              {...{
                buttonFields,
                setButtonField,
                deleteButtonField,
                cardButtonEditDataSet,
                readOnly,
              }}
            />
          )}
          <div id="button-position" />
          {selectFields.length ? (
            <SelectFields
              dataSet={cardSelectEditDataSet}
              readOnly={readOnly}
              onChange={() => {
                setSelectField(cardSelectEditDataSet.toData());
              }}
            />
          ) : null}
          <div id="select-position" />
        </div>
        <div style={{ marginLeft: '20px', display: readOnly ? 'none' : 'block' }}>
          <Dropdown overlay={menu}>
            <Button icon="add" funcType="flat" color="primary">
              {intl.get('smbl.purchaseRobotConfig.view.addCardInfo').d('添加内容')}
              <Icon style={{ marginTop: '-4px' }} type="expand_more" />
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default formatterCollections({
  code: ['smbl.purchaseRobotConfig', 'hzero.common'],
})(MessageCardEdit);
