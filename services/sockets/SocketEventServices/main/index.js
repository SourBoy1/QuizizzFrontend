import values from 'lodash/values';

import { SocketEventBus, SocketEventHandler } from '../../PromisifiedSocket';

import { Configuration } from './config';

export const mainSocketEventBus = new SocketEventBus(Configuration.endPoint, Configuration.options)
  // register all the client messages at once
  .registerClientEmitMessages(values(Configuration.ClientInitiatedMessages));

export function connectSocketCall() {
  return new SocketEventHandler('connect')
    .setupEventBus(mainSocketEventBus)
    .timeoutAfter(12000)
    .emit();
}

export function disconnectSocketCall() {
  return new SocketEventHandler('disconnect')
    .setupEventBus(mainSocketEventBus)
    .timeoutAfter(12000)
    .emit();
}

export function emitChangeHost(payload) {
  return new SocketEventHandler(Configuration.ClientInitiatedMessages.CHANGE_HOST, payload)
    .setupEventBus(mainSocketEventBus)
    .timeoutAfter(12000)
    .emit();
}

export function deletePlayer(payload) {
  return new SocketEventHandler(Configuration.ClientInitiatedMessages.DELETE_PLAYER, payload)
    .setupEventBus(mainSocketEventBus)
    .timeoutAfter(12000)
    .emit();
}

export function getReport(payload) {
  return new SocketEventHandler(Configuration.ClientInitiatedMessages.GET_REPORT, payload)
    .setupEventBus(mainSocketEventBus)
    .timeoutAfter(12000)
    .emit();
}
