/* eslint-disable react/jsx-filename-extension */
import React, { Component, createElement, ReactNode, useCallback } from "react";
import { Tag } from "choerodon-ui";
import { observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { observer as ob } from 'mobx-react';
import { DataSet, Spin, Pagination, Tooltip, Form, Button, CheckBox, Icon } from "choerodon-ui/pro";
import intl from "hzero-front/lib/utils/intl";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import { getResponse } from "hzero-front/lib/utils/utils";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import { FuncType } from "choerodon-ui/pro/lib/button/enum";
import { Size } from "choerodon-ui/lib/_util/enum";

const _a: any = axios;
const ObserverCheck = observer<{ onClick, checkValue, depData: Map<string, any>, disabled?, data?}>(function ObserverCheck({
  onClick, checkValue, depData, disabled, data
}) {
  const checkCallback = useCallback((e) => {
    if (!disabled) { onClick(e, data); return; }
    e.stopPropagation();
    e.preventDefault();
  }, [onClick, disabled, data]);
  return (
    <div onClick={checkCallback} data-id={checkValue} className={`user-check${disabled ? " disabled" : ""}`}>
      <input
        type="checkbox"
        data-id={checkValue}
      />
      <span data-id={checkValue} className={`checkbox${depData.has(String(checkValue)) ? " checked" : ""}`} />
    </div>
  )
});

const ObserverSelectedControl = observer<any>(({ select, cacheSelected, showAllSelected, onClick }) => {
  return (
    <div className="user-accounts-selected-summary">
      {(cacheSelected.size > 0 || showAllSelected) && (
        <>
          {intl.get("hiam.purAccountManage.title.selectedSummary", { num: cacheSelected.size + select.size }).d("最近勾选的 {num} 条数据")}
          <Tooltip title={showAllSelected ? intl.get("hzero.common.button.cancel") : intl.get("hzero.common.button.view")}>
            <Button icon={showAllSelected ? "visibility_off" : "visibility"} funcType={FuncType.flat} size={Size.small} onClick={onClick} />
          </Tooltip>
        </>
      )}
    </div>
  )
});

@ob
export default class BasicUserList extends Component<{
  userChange: (userId: string | any, otherInfo: any) => void;
  parseUser: (data: any) => { id, title, status, statusText, labelForDescription, description, checkable, originData };
  parseParameters?: (data) => any;
  queryDs: DataSet;
  queryUrl;
  initQueryDs: Promise<void>;
  queryFields: ReactNode[];
  hasMoreFields?: boolean;
  getUserOperators: (select, cacheSelected) => ReactNode[];
  checkable?: boolean;
  onlyShowTitle?: boolean;
}, any> {

  @observable
  select = new Map<string, any>();


  @observable
  cacheSelected = new Map<string, any>();

  @observable
  moreFieldsVisible = false;

  userOperators: ReactNode[] = [];

  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      /**
       * 在浏览已选择全部数据时，保存当前历史非当前页已选择数据的快照
       * 在取消浏览时清空此cache
       */
      cacheSelectedList: [],
      showAllSelected: false,
      userListLoading: true,
      /** userList对应的可以选择的项目数量 */
      checkableLength: 0,
      pageData: {
        pageSize: 20,
        current: 1,
        totalPage: 0,
        total: 0,
      },
      currentUserId: undefined,
    };
  }

  componentDidMount() {
    this.updateInitQueryData();
    this.userOperators = this.props.getUserOperators(this.select, this.cacheSelected);
    this.props.queryDs.addEventListener("update", () => this.queryList(1, 20))
  }

  componentDidUpdate(prevProps) {
    const { initQueryDs } = this.props;
    if (prevProps.initQueryDs !== initQueryDs) {
      this.updateInitQueryData();
    }
    if (prevProps.checkable !== this.props.checkable) {
      this.userOperators = this.props.getUserOperators(this.select, this.cacheSelected);
      this.forceUpdate();
    }
  }

  updateInitQueryData = () => {
    const { initQueryDs } = this.props;
    initQueryDs.then(() => this.queryList(1, 20));
  }

  queryList = (_currentPage?, _pageSize?) => {
    const { queryUrl, queryDs, parseUser, parseParameters } = this.props;
    const currentPage = _currentPage || this.state.pageData.currentPage;
    const pageSize = _pageSize || this.state.pageData.pageSize;
    this.setState({ userListLoading: true });
    const params = queryDs.current!.toData();
    delete params.__dirty;
    _a.get(queryUrl, {
      params: {
        ...(parseParameters ? parseParameters(params) : params),
        page: currentPage - 1,
        size: pageSize,
      },
    }).then(res => {
      if (getResponse(res)) {
        let defaultUser;
        const newList = (res.content || []).map(parseUser);
        const newListIds = new Set();
        // 查询的数据中有课选择的项
        let checkableLength = 0;
        if (newList.length > 0) {
          defaultUser = newList[0];
          newList.forEach(data => {
            newListIds.add(data.id);
            if (data.checkable) checkableLength ++;
          });
        }
        const temp1 = Array.from(this.cacheSelected.entries());
        const temp2 = Array.from(this.select.entries());
        // 先清除历史缓存再挑出不是新查询数据的项存入cacheSelected
        this.cacheSelected.clear();
        this.select.clear();
        temp1.concat(temp2).forEach(([key, value]) => {
          if (newListIds.has(key)) this.select.set(key, value);
          else this.cacheSelected.set(key, value);
        })
        this.setState({
          currentUserId: defaultUser !== undefined ? defaultUser.id : undefined,
          userList: newList,
          checkableLength,
          pageData: {
            current: res.number + 1,
            pageSize: res.size,
            totalPage: res.totalPages,
            total: res.totalElements,
          },
        });
        if (!defaultUser) defaultUser = {};
        this.props.userChange(defaultUser.id, defaultUser.originData);
      }
    }).finally(() => {
      this.setState({ userListLoading: false });
    });
  }

  onClickUser = (e) => {
    // eslint-disable-next-line prefer-destructuring
    const id = e.target.dataset.id;
    if (id === undefined) return;
    let user;
    user = this.state.userList.find(i => i.id == id);
    if (!user) {
      user = (this.state.cacheSelectedList || []).find(i => i.id == id);
    }
    this.setState({ currentUserId: user.id });
    this.props.userChange(id, user.originData);
  }

  selectAccount = (e, data) => {
    const id = String(e.target.dataset.id);
    if (this.select.has(id)) {
      this.select.delete(id);
    } else {
      this.select.set(id, data);
    }
    e.stopPropagation();
  }

  selectCacheAccount = (e, data) => {
    const id = String(e.target.dataset.id);
    if (this.cacheSelected.has(id)) {
      this.cacheSelected.delete(id);
    } else {
      this.cacheSelected.set(id, data);
    }
    e.stopPropagation();
  }

  changeShowAllSelected = () => {
    const { showAllSelected } = this.state;
    this.setState({
      showAllSelected: !showAllSelected,
      cacheSelectedList: showAllSelected ? [] : Array.from(this.cacheSelected.values()).map(this.props.parseUser),
    });
  }

  checkAllCurrentPage = (newValue) => {
    runInAction(() => {
      let checkedFlag = newValue;
      // 如果当前页存在禁选项，需重新计算新的勾选状态
      if (this.select.size === this.state.checkableLength) checkedFlag = false;
      // 这里只能操作当前页的勾选项
      if (checkedFlag) {
        this.state.userList.forEach(data => {
          if (!data.checkable) return;
          this.select.set(String(data.id), data.originData);
        });
      } else {
        this.state.userList.forEach(data => {
          this.select.delete(String(data.id));
        });
      }
    });
  }

  checkAllCacheList = (newValue) => {
    runInAction(() => {
      if (newValue) {
        this.state.cacheSelectedList.forEach(data => {
          this.cacheSelected.set(String(data.id), data.originData);
        });
      } else {
        this.state.cacheSelectedList.forEach(data => {
          this.cacheSelected.delete(String(data.id));
        });
      }
    });
  }

  checkAll = (newValue) => {
    runInAction(() => {
      let checkedFlag = newValue;
      // 如果当前页存在禁选项，需重新计算新的勾选状态
      if (this.select.size + this.cacheSelected.size === this.state.checkableLength + this.state.cacheSelectedList.length) checkedFlag = false;
      if (checkedFlag) {
        this.state.cacheSelectedList.forEach(data => {
          if (!data.checkable) return;
          this.cacheSelected.set(String(data.id), data.originData);
        });
        this.state.userList.forEach(data => {
          if (!data.checkable) return;
          this.select.set(String(data.id), data.originData);
        });
      } else {
        // 只有在显示跨页数据时，全选的反选才会清除cacheSelected
        if (this.state.showAllSelected) this.cacheSelected.clear();
        this.select.clear();
      }
    });
  }

  searchFormHeight = "38px";

  /**
   * 收起状态下，有更多字段+操作按钮的已使用高度
   * 33 * 2 + 40 + 4 + 34 + 4
   * 34为单行表单字段高度，多行为34 + 50 * (n - 1)n为总行数
   */
  baseUseSpaceHeight = 138;

  useSpaceHeight = 138;

  changeMoreFieldsVisible = () => {
    if (this.moreFieldsVisible) {
      this.searchFormHeight = "38px";
      this.useSpaceHeight = this.baseUseSpaceHeight;
    } else {
      const el = document.querySelector(".user-search-bar > form > table")!;
      const searchHeight = el.getBoundingClientRect().height;
      this.searchFormHeight = `${searchHeight + 4}px`;
      // 父级的padding-top: 4px需要单独加上
      this.useSpaceHeight = this.baseUseSpaceHeight + searchHeight + 4 - 34;
    }
    this.moreFieldsVisible = !this.moreFieldsVisible;
  }

  render() {
    const { moreFieldsVisible, cacheSelected, select } = this;
    const { queryDs, queryFields, checkable, hasMoreFields, onlyShowTitle } = this.props;
    const { userList, userListLoading, currentUserId, pageData, showAllSelected, cacheSelectedList, checkableLength } = this.state;
    const allListLength = showAllSelected ? cacheSelectedList.length + userList.length : userList.length;
    const allSelectedLength = showAllSelected ? cacheSelected.size + select.size : select.size;

    const hasOp = checkable || this.userOperators.length > 0;
    let fixUseHeight = 0;
    if (hasMoreFields) fixUseHeight += 36;
    if (hasOp) fixUseHeight += 40;
    // 没有操作按钮时下边距多了12px，要减掉
    if (!hasMoreFields && !hasOp) {
      fixUseHeight += 12;
    }
    return (
      <div className="user-accounts">
        <Spin spinning={userListLoading}>
          <div className="user-search-bar" style={{paddingBottom: hasMoreFields || hasOp ? "4px" : "16px"}}>
            <Form dataSet={queryDs} labelLayout={LabelLayout.float} columns={3} style={{ height: this.searchFormHeight }}>
              {queryFields}
            </Form>
            {hasMoreFields && createElement("div", { newLine: true, className: 'more-fields', onClick: this.changeMoreFieldsVisible }, (
              <>
                <span className="user-search-bar-split">- - - - - - - - - - - - -</span>
                {moreFieldsVisible ? intl.get("hzero.common.button.up") : intl.get("hzero.common.button.more")}
                <Icon type={moreFieldsVisible ? "expand_less" : "expand_more"} style={{ fontWeight: 400, marginLeft: "8px" }} />
                <span className="user-search-bar-split">- - - - - - - - - - - - -</span>
              </>
            ))}
            {
              hasOp && (
                <div className="user-search-bar-operators">
                  {
                    checkable && (
                      <CheckBox
                        checked={!!allSelectedLength && allSelectedLength === allListLength}
                        indeterminate={!!allSelectedLength && allSelectedLength < allListLength}
                        onChange={this.checkAll}
                        disabled={checkableLength === 0 && cacheSelectedList.length === 0}
                      >
                        {intl.get("hzero.common.button.select")}
                      </CheckBox>
                    )
                  }
                  {this.userOperators}
                </div>
              )
            }
          </div>
          <div className={["user-list", checkable ? "" : "no-check"].join(" ")} onClick={this.onClickUser} style={{ height: `calc(100% - ${this.useSpaceHeight + fixUseHeight}px)` }}>
            {showAllSelected && (
              <div className="user-list-item-title">
                <CheckBox
                  checked={this.cacheSelected.size === cacheSelectedList.length}
                  indeterminate={!!this.cacheSelected.size && this.cacheSelected.size < cacheSelectedList.length}
                  onChange={this.checkAllCacheList}
                />
                {intl.get("hiam.purAccountManage.common.cacheSelected").d("已选择")}
              </div>
            )}
            {cacheSelectedList.map(data => {
              const { id, checkable: ca, title, status, statusText, description, labelForDescription, originData } = data;
              return (
                <div data-id={id} className={`user-list-item${currentUserId === id ? ' active' : ''}`}>
                  {
                    checkable && (
                      <ObserverCheck
                        disabled={!ca}
                        onClick={this.selectCacheAccount}
                        checkValue={id}
                        data={originData}
                        depData={this.cacheSelected}
                      />
                    )
                  }
                  <div data-id={id} className="user-list-item-header">
                    <Tooltip title={title}><span data-id={id} className="text">{title}</span></Tooltip>
                    {
                      status !== undefined && (
                        <Tooltip title={statusText}>
                          <Tag color={status ? "green" : 'gray'} data-id={id}>{statusText}</Tag>
                        </Tooltip>
                      )
                    }
                  </div>
                  {
                    !onlyShowTitle && (
                      <Tooltip title={description}>
                        <div data-id={id} className="user-list-item-desc">
                          {labelForDescription}: {description}
                        </div>
                      </Tooltip>
                    )
                  }
                </div>
              );
            })}
            {showAllSelected && (
              <div className="user-list-item-title">
                <CheckBox
                  checked={this.select.size === userList.length}
                  indeterminate={!!this.select.size && this.select.size < userList.length}
                  onChange={this.checkAllCurrentPage}
                />
                {intl.get("hiam.purAccountManage.common.currentPage").d("当前页")}
              </div>
            )}
            {userList.length === 0 && <div className="no-data">{intl.get('hiam.purAccountManage.common.noData').d('无数据')}</div>}
            {userList.map(data => {
              const { id, checkable: ca, title, status, statusText, description, labelForDescription, originData } = data;
              return (
                <div data-id={id} className={`user-list-item${currentUserId === id ? ' active' : ''}`}>
                  {
                    checkable && (
                      <ObserverCheck
                        disabled={!ca}
                        onClick={this.selectAccount}
                        checkValue={id}
                        data={originData}
                        depData={this.select}
                      />
                    )
                  }
                  <div data-id={id} className="user-list-item-header">
                    <Tooltip title={title}><span data-id={id} className="text">{title}</span></Tooltip>
                    {
                      status !== undefined && (
                        <Tooltip title={statusText}>
                          <Tag color={status ? "green" : 'gray'} data-id={id}>{statusText}</Tag>
                        </Tooltip>
                      )
                    }
                  </div>
                  {
                    !onlyShowTitle && (
                      <Tooltip title={description}>
                        <div data-id={id} className="user-list-item-desc">
                          {labelForDescription}: {description}
                        </div>
                      </Tooltip>
                    )
                  }
                </div>
              );
            })}
          </div>
          <ObserverSelectedControl cacheSelected={this.cacheSelected} select={this.select} showAllSelected={showAllSelected} onClick={this.changeShowAllSelected} />
          <Pagination
            style={{ textAlign: "right", marginRight: "20px" }}
            showSizeChanger={false}
            showTotal
            page={pageData.current}
            pageSize={pageData.pageSize}
            total={pageData.total}
            onChange={this.queryList}
          />
        </Spin>
      </div>
    );
  }
}