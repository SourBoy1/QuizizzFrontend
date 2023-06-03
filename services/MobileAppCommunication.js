import QLogger from './QLogger';

class CommunicateWithApp {
  constructor() {
    this.actionTypes = {
      POST_QUESTION_EDIT: 'POST_QUESTION_EDIT',
    };
    this.isRunningInWebView = !!window?.ReactNativeWebView;
  }

  dispatchAction(actionType, data) {
    switch (actionType) {
      case this.actionTypes.POST_QUESTION_EDIT:
        this.postQuestionEdit(data);
        break;
      default:
        break;
    }
  }

  postQuestionEdit({ isSuccess = true, questionId }) {
    this.sendMessage({
      type: this.actionTypes.POST_QUESTION_EDIT,
      action: {
        success: isSuccess,
        questionId,
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  sendMessage(message) {
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify(message),
      );
    } catch (error) {
      QLogger.error('failed to send message to React Native Webview', error);
    }
  }
}

export default CommunicateWithApp;
