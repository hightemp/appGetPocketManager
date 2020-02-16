<template>
  <div id="q-app" class="row" style="height: 100vh">
    <webview 
      :src="sWebViewURL" 
      class="full-height full-width" 
      disablewebsecurity 
       
      v-if="!bAuthed"
      webpreferences="webSecurity=false, devTools=true"
    /><!-- nodeintegration -->
    <template v-else>
      <div class="col column">
        <div class="col-auto row">
          <q-input class="col" v-model="sListFilter" type="text" label="Filter..." />
          <q-btn-toggle
            v-model="bEnableListFilter"
            clearable
            spread
            no-caps
            square
            unelevated
            toggle-color="primary"
            color="white"
            text-color="black"
            title="Filter"
            :options="[
              {value: true, icon: 'filter_list'},
            ]"
          ></q-btn-toggle>
        </div>  
        <q-virtual-scroll
          class="col-4 full-height"
          style=""
          :items="aList"
          bordered 
          separator
        >
          <template v-slot="{ item, index }">
            <q-item
              :key="index"
              dense
              :active="oSelectedItem==item"
              active-class="bg-primary text-white"
              @click="oSelectedItem=item"
            >
              <!--q-item-section caption side left>
                {{ item.given_title }}
              </q-item-section-->
              <q-item-section>
                <q-item-label>
                  {{ item.given_title }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </div>
      <div class="col-8">
        <webview 
          v-if="oSelectedItem && oSelectedItem.given_url"
          ref="webview"
          :src="oSelectedItem.given_url" 
          class="full-height full-width"
        ></webview>
      </div>
    </template>
  </div>
</template>

<script>
const fs = require('fs');
const axios = require('axios');
import Vue from 'vue';

var { $err, $log } = require('./lib/log');

const oAPIKeys = require('./config/api_keys.json');

import GetPocketAPI from './lib/get_pocket_api';
 
var config = {
    consumer_key: oAPIKeys["Desktop (other)"],
    redirect_uri: ''
};

var oAPI = null;

import { Notify } from 'quasar'

export default {
  name: 'App',

  computed: {
    
  },

  data()
  {
    return {
      oList: {},
      aList: [],

      sListFilter: "",
      bEnableListFilter: false,

      sPreviewURL: "",

      // iSelectedIndex: -1,
      oSelectedItem: null,

      bAuthed: false,

      sWebViewURL: "",

      oUser: {
        sUserName: "",
        sPassword: ""
      }
    };
  },

  methods: {
    async fnUpdateList()
    {
      var oThis = this;

      $log('fnUpdateList >> 1');

      if (!oThis.bAuthed) {
        await oThis.fnAuth();
      }

      $log('fnUpdateList >> 2');

      var oList = await oAPI.fnGetAll();
      
      Vue.set(oThis, 'oList', oList);

      oThis.aList = Object.values(oList);
    },

    async fnAuth()
    {
      var oThis = this;

      return new Promise((fnSuccess, fnFail) => {
        oAPI
          .fnOAuthRequest()
          .then((sURL) => {
            var oWebview = document.querySelector("webview");

            oThis.sWebViewURL = sURL;

            oWebview.addEventListener('console-message', (e) => {
              console.log('oWebview:', e.message, e)
            });

            oWebview.addEventListener('did-finish-load', () => {
              console.log('>> did-finish-load');

              if (oWebview.getURL().indexOf(oAPI.sRedirectURL)==0) {
                $log('fnOAuthAuthorize >> oWebview.getURL().indexOf(oAPI.sRedirectURL)==0');
                oAPI
                  .fnOAuthAuthorize()
                  .then(() => {
                    $log('fnOAuthAuthorize >> bAuthed');
                    oThis.bAuthed = true;
                    fnSuccess();
                  });
                return;
              }

              oWebview.executeJavaScript(`
                var fnReady = (async () => {
                  console.log('URL:', window.location.toString());

                  if (window.location.toString().indexOf('${oAPI.sRedirectURL}')==0) {
                    console.log('>>>>> 3');
                    // const { ipcRenderer } = remote; // require('electron');
                    // await ipcRenderer.sendToHost('success');
                    return;
                  }
                  var oBtn = document.querySelector('.btn-important.btn-authorize');
                  if (oBtn) {
                    setTimeout(() => {
                      console.log('>>>>> 2', oBtn);
                      $(oBtn).click();
                      //oBtn && oBtn.click();
                    }, 3000);
                  } else {
                    setTimeout(() => {
                      console.log('>>>>> 1', document.querySelector('.btn-authorize'));
                      document.querySelector('#feed_id').value = '${oThis.oUser.sUserName}';
                      document.querySelector('#login_password').value = '${oThis.oUser.sPassword}';
                      document.querySelector('.btn-authorize').click();
                    }, 3000);
                  }
                });
                fnReady();
              `);
            });

            oWebview.addEventListener('dom-ready', () => {
              console.log('>> dom-ready');

              // oWebview.openDevTools();
            });
          })
          .catch((oErr) => {
            $err(oErr);
            fnFail(oErr);
          });
      }) 
    },

    fnShowError(oError)
    {
      var sError = oError.toString();

      if (oError.response && oError.response.headers['x-error']) {
        sError = oError.response.headers['x-error'];
      }

      Notify.create({
        position: 'top-right',
        message: sError
      });
      console.error(oError);
    },

    fnLoadConfig()
    {
      var oThis = this;

      try {
        Object.assign(oThis.$data, JSON.parse(fs.readFileSync('./config.json').toString()));

        oAPI =  new GetPocketAPI({ 
          sUserName: oThis.oUser.sUserName, 
          sPassword: oThis.oUser.sPassword, 
          sAPIKey: oAPIKeys["Desktop (other)"] 
        });
      } catch (oError) {
        console.error(oError);
        oThis.fnSaveConfig();
      }
    },
    fnSaveConfig()
    {
      var oThis = this;

      try {
        fs.writeFileSync('./config.json', JSON.stringify(oThis.$data));
      } catch (oError) {
        console.error(oError);
      }
    }
  },

  created()
  {
    var oThis = this;

    oThis.fnLoadConfig();

    oThis.fnUpdateList();
  }
}
</script>
