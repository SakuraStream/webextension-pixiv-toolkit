import 'vuetify/dist/vuetify.min.css'

import App from './App'
import Browser from '@/modules/Browser/Browser'
import I18n from '@/modules/I18n';
import SuperMixin from '@/mixins/SuperMixin';
import Vue from 'vue'
import Vuetify from 'vuetify';
import moment from 'moment';
import router from './router';

Vue.config.productionTip = false;
Vue.mixin(SuperMixin);

try {
  (function(browser) {
    moment.locale('zh_CN', {
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
      ],
      weekdays: [
        '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'
      ],
      meridiem : function (hour, minute, isLowercase) {
        if (hour < 9) {
            return "早上";
        } else if (hour < 11 && minute < 30) {
            return "上午";
        } else if (hour < 13 && minute < 30) {
            return "中午";
        } else if (hour < 18) {
            return "下午";
        } else {
            return "晚上";
        }
      }
    });

    window.browser = browser;

    /**
     * Update browser action badge
     */
    browser.browserAction.getBadgeText({}, function (text) {
      if (text.toLowerCase() === 'new') {
        /**
         * If badge text is 'new', remove the badge text.
         */
        browser.browserAction.setBadgeText({
          text: ''
        });
      }
    });

    browser.storage.local.get(null, items => {
      const i18n = I18n.i18n(items.language, browser.i18n.getUILanguage());

      moment.locale(i18n.locale);

      Vue.use(Vuetify)

      /* eslint-disable no-new */
      new Vue({
        el: '#app',

        router,

        i18n,

        render: h => h(App),

        data() {
          return {
            plusVersion: null, // deprecated
            browserItems: items,
            isFirefox_: navigator.userAgent.toLocaleLowerCase().indexOf('firefox') > -1
          }
        },

        beforeMount() {
          let vm = this;

          browser.storage.onChanged.addListener((items, scope) => {
            for (let key in items) {
              vm.browserItems[key] = items[key].newValue;

              if (key === 'language') {
                if (items[key].newValue === 'default') {
                  i18n.locale = chrome.i18n.getUILanguage().replace('-', '_');
                } else {
                  i18n.locale = items[key].newValue;
                }

                moment.locale(i18n.locale);
              }
            }
          });

          /**
           * Check if the extension has the downloads permission
           */
          browser.permissions.getAll(permissions => {
            let settings = {};

            settings.enableExtTakeOverDownloads = permissions.permissions.indexOf('downloads') > -1;

            browser.storage.local.set(settings);
          });
        }
      })
    });
  })(Browser.getBrowser());
} catch (e) {
  console.error(e);
}
