// ⚙️ إعدادات Firebase — انسخها من Firebase Console (الخطوات في README.md)
// لو سبتها فاضية، التطبيق هيشتغل في "وضع التجربة": البيانات على الجهاز ده بس ومفيش مزامنة.
// الملف ده سكريبت عادي (مش module) عشان الـ Service Worker يقدر يقراه هو كمان.
self.TASKATY_CONFIG = {
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  // Cloud Messaging → Web Push certificates → Key pair
  vapidKey: '',
};
