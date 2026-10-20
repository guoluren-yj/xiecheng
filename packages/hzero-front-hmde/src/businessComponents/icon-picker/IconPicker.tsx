import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  CSSProperties,
} from 'react';
import { Icon } from 'choerodon-ui';
import { TextField, Output } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import IconPickerItem from './iconPickerItem';
import { IDataSource, IChildren } from './enums';
import styles from './style/index.less';

interface IIconPicker {
  dataSource?: IDataSource[]; // 组件数据源
  onItemEnter?: (child: IChildren) => void; // 鼠标移入事件
  onItemLeave?: (child: IChildren) => void; // 鼠标移出事件
  onChange?: (arg?: IChildren) => void; // 选中回调
  iconPickerRef?: any;
  style?: CSSProperties; // 内联样式
  disabled?: boolean; // 是否禁用
  showText?: boolean; // 是否禁用
}
export default function IconPicker({
  dataSource = [],
  onItemEnter = () => { },
  onItemLeave = () => { },
  onChange = () => { },
  iconPickerRef,
  style,
  disabled = false,
  showText = false,
}: IIconPicker) {
  useImperativeHandle(iconPickerRef, () => ({
    emitEmpty, // 清空选中值
    setValue, // 给组件设置回显值
  }));
  const userNameInput: any = useRef();
  const iconPickerItemRef: any = useRef();
  const maskRef: any = useRef();
  const [userName, setUserName] = useState<string | undefined>();
  const [isHidden, setIsHidden] = useState<boolean>(true);

  // 挂载组件绑定监听 卸载组件移除监听
  useEffect(() => {
    maskRef.current.addEventListener('click', setHidden.bind(null, true));
    return () => {
      maskRef.current.removeEventListener('click', setHidden as any);
    };
  }, []);

  /**
   * 设置下拉组件显隐
   * @param value <boolean>
   */
  type ISetHidden = (value: boolean) => void;
  const setHidden: ISetHidden = useCallback((value) => {
    setIsHidden(value);
  }, []);

  /**
   * 清空输入框选中值
   */
  const emitEmpty = useCallback((ev) => {
    const oEvent = ev || event;
    // eslint-disable-next-line no-unused-expressions
    oEvent?.preventDefault();
    setUserName('');
    // eslint-disable-next-line no-unused-expressions
    userNameInput.current?.focus();
    // eslint-disable-next-line no-unused-expressions
    iconPickerItemRef.current?.clearSelect();
    onChange();
  }, []);

  /**
   * 输入框点击回调
   * @param ev event 原生事件
   */
  const handleInputClick = useCallback(
    (ev) => {
      const oEvent = ev || event;
      setHidden(!isHidden);
      // js阻止事件冒泡
      oEvent.cancelBubble = true;
      oEvent.stopPropagation();
    },
    [isHidden]
  );

  const handleItemClick = (item: IChildren) => {
    setUserName(item?.title);
    setHidden(true);
    onChange(item); // 暴露出的api
  };

  // 给组件设置回显值
  const setValue = useCallback((item: { title: string; value: string; componentName?: string }) => {
    setUserName(item?.title);
    setHidden(true);
  }, []);

  const iconPickerItemProps = {
    onItemEnter,
    onItemLeave,
    dataSource,
    handleItemClick,
    iconPickerItemRef,
    // selectedKeys: [],
  };

  const getSuffix = useMemo(
    () =>
      // eslint-disable-next-line no-nested-ternary
      userName ? (
        <React.Fragment>
          <Icon type="close" onClick={emitEmpty} />
          {isHidden ? <Icon type="expand_more" /> : <Icon type="expand_less" />}
        </React.Fragment>
      ) : isHidden ? (
        <Icon type="expand_more" />
      ) : (
            <Icon type="expand_less" />
          ),
    [userName, isHidden]
  );

  return (
    <>
      <div hidden={isHidden} className={styles['icon-picker-mask']} ref={maskRef} />
      <div className={styles['icon-picker-content']} style={style}>
        {showText ? (
          <Output labelLayout={LabelLayout.float} label={intl.get('hmde.bo.field.componentType').d('字段类型')} value={userName} />
        ) : (
            <TextField
              label={intl.get('hmde.bo.field.componentType').d('字段类型')}
              labelLayout={LabelLayout.float}
              disabled={dataSource.length === 0 || disabled}
              placeholder={intl.get('hzero.c7nProUI.Lov.choose').d('请选择')}
              // prefix="input-"
              suffix={dataSource.length > 0 && !disabled && getSuffix}
              // label="请选择"
              value={userName}
              // onChange={onChangeUserName}
              ref={userNameInput}
              onClick={handleInputClick}
              required
            />
          )}
        <div
          className={`${styles['icon-picker-tabs-content']} ${isHidden && styles['hidden-style']}`}
        >
          {dataSource?.length > 0 ? (
            <IconPickerItem {...iconPickerItemProps} />
          ) : (
              <div className={styles['icon-picker-no-data']}>
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
