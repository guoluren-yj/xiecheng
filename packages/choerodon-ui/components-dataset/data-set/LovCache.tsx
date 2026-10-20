import { observable } from 'mobx';

export default class LovCache {
  @observable items?: object[];

  @observable promise?: Promise<object[]> | undefined;
}
