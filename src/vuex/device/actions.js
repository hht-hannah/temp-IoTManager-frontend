import * as Type from './mutation-type';
import { Message } from 'element-ui';
import * as api from '../../api/api';
const actions = {
  async setDeviceTree({ commit, dispatch, state }){
    const data=(await api.getDeviceTreeApi()).data.d;
    commit(Type.SET_DEVICE_TREE,data);
  },
  async setCurrentDeviceData({commit,dispatch,state},data){
    commit(Type.SET_CURRENT_DEVICE_DATA,data);
  }
};

export default actions;
