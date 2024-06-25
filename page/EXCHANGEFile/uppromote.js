class Uppromote{constructor(a="production",b=!0){this.env=a,this.host={dev:"https://secomapp-affiliate.test",test:"https://af-test.uppromote.com",production:"https://track.uppromote.com"}[a]||"https://track.uppromote.com",this.cdnHost={dev:"https://secomapp-affiliate.test",test:"https://af-test.uppromote.com",production:"https://d1639lhkj5l89m.cloudfront.net"}[a]||"https://d1639lhkj5l89m.cloudfront.net",this.cdnS3Host={dev:"https://secomapp-affiliate.test",test:"https://af-test.uppromote.com",production:"https://cdn.uppromote.com"}[a]||"https://cdn.uppromote.com",this.cache=b,this.postPurchasePopup={ui:{sca_title:null}}}init(){this.dispatchLoadedEvent(),this.processOnLoadPage(),this.uppromoteLog("Running...")}assetS3(a=""){let b=this.cdnS3Host;return a.startsWith("http")?a:("production"!==this.env&&(b=`${b}/storage`),a=a.replace("//","/"),a=a.startsWith("/")?a.slice(1,a.length):a,`${b}/${a}`)}renderElm(a="div",b,c={},d){const e=document.createElement(a);return b&&(Array.isArray(b)?b.map(a=>e.classList.add(a)):b&&0!==b.length&&e.classList.add(b)),Object.keys(c).forEach(a=>e.setAttribute(a,c[a])),d&&(e.innerHTML=d),e}async fetchAndGetContent(a="",b="GET",c={}){if(c.shopify_domain=this.getShopDomain(),["GET","HEAD"].includes(b)){a=new URL(a);const b=new URLSearchParams(c),d=a.searchParams,e=new URLSearchParams({...Object.fromEntries(b),...Object.fromEntries(d)});a=`${a.origin}${a.pathname}?${e.toString()}`;const f=await fetch(a);return(await f.json())||null}else{const d=new FormData;Object.keys(c).forEach(a=>d.append(a,c[a]));const e=await fetch(a,{method:b,headers:{},body:d});return(await e.json())||null}}setCookie(a,b,c){const e=new Date;e.setTime(e.getTime()+1e3*(60*(60*(24*c))));let d="expires="+e.toUTCString();document.cookie=a+"="+b+";"+d+";path=/"}getCookie(a){let b=a+"=",c=decodeURIComponent(document.cookie),d=c.split(";");for(let e,c=0;c<d.length;c++){for(e=d[c];" "===e.charAt(0);)e=e.substring(1);if(0===e.indexOf(b))return e.substring(b.length,e.length)}return""}mustPostClickTracking(a){if(!a)return!0;const b=new Date().getTime();return b-a>60000}checkResponseFromServer(){if("false"===localStorage.getItem("scaaf_received")){const a=this.getCookie("scaaf_aid")||localStorage.getItem("scaaf_aid");if(!a)return;this.postClickTracking({aid:a,tid:localStorage.getItem("scaaf_tid"),hc:localStorage.getItem("scaaf_hc"),s:this.getShopName(),ug:navigator.userAgent},null,()=>{uppromote.uppromoteLog("ReTracking success!")})}}parseQueryStringToObject(a=""){try{const b=new URLSearchParams(a),c=b.entries(),d={};for(const[a,b]of c)d[a]=b;return d}catch(a){return{}}}getShopDomain(){try{return Shopify?Shopify.shop:""}catch(a){return console.error("Uppromote: getShopName() - Error when get shopify domain"),""}}getShopName(){return this.getShopDomain().replace(".myshopify.com","")}getShopifyCheckoutObject(){return Shopify&&Shopify.checkout?Shopify.checkout:null}getShopifyCheckoutInformationObject(){return Shopify&&Shopify.Checkout?Shopify.Checkout:null}copyToClipboard(a,b){a.focus(),a.select(),navigator.clipboard.writeText(a.value).then(b)}applyDiscountCode(a){const b=this.renderElm("iframe","sca_d-none",{src:`/discount/${encodeURIComponent(a)}`});b.style.display="none",document.body.append(b)}initFbPixel(){if("undefined"==typeof disableUppromoteFacebookPixel){const a=this.renderElm("script","sca_aff_fb_pixel_init");a.textContent=`!function(a,c,b,d,e,f,g){a.fbq||(e=a.fbq=function(){e.callMethod?e.callMethod.apply(e,arguments):e.queue.push(arguments)},!a._fbq&&(a._fbq=e),e.push=e,e.loaded=!0,e.version="2.0",e.queue=[],f=c.createElement(b),f.async=!0,f.src=d,g=c.getElementsByTagName(b)[0],g.parentNode.insertBefore(f,g))}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");`,document.head.append(a)}}getCouponCode(a,b){const c=`${this.host}/api/get_coupon`,d=a||this.getCookie("scaaf_aid");d&&this.fetchAndGetContent(c,"GET",{aid:d}).then(a=>{"ok"===a.status?(uppromote.applyDiscountCode(a.coupon),setTimeout(()=>{b&&(window.location.href=`${b}&discount=${a.coupon}`)},200)):b&&(window.location.href=b)}).catch(()=>{b&&(window.location.href=b)})}trackFbPixel(a){if("undefined"!=typeof disableUppromoteFacebookPixel)return;const b=`${this.host}/api/get_fb_pixel`,c={aff_id:a||this.getCookie("scaaf_aid")||localStorage.getItem("scaaf_aid"),shop:`${this.getShopDomain()}`},d=function(a){const b=uppromote.getShopifyCheckoutObject(),c=uppromote.getShopifyCheckoutInformationObject();fbq("init",a),fbq("trackSingle",a,"PageView"),b&&fbq("trackSingle",a,"Purchase",{value:b.total_price,currency:b.currency}),c&&"contact_information"===c.step&&fbq("trackSingle",a,"InitiateCheckout",{currency:b.currency,value:b.estimatedPrice}),document.location.pathname.startsWith("/cart")&&fbq("trackSingle",a,"AddToCart")};c.aff_id&&this.fetchAndGetContent(b,"GET",c).then(a=>{"ok"===a.status&&d(a.pixel)}).catch(a=>{console.error("Uppromote: trackFbPixel() - Error when fetch Fb pixel"),console.error(a)})}appendAffiliateIdToRegisterForm(a=null){if(this.getCookie("scaaf_ass_dl")){const b=window.location.pathname.split("/")[2]||"";if("register"===b&&(a=a||this.getCookie("scaaf_aid")||localStorage.getItem("scaaf_aid"),!!a)){const b=document.querySelector(`form[method="post"][action*="account"]`);if(b){const c=this.renderElm("input",null,{type:"hidden",name:"customer[note][affiliate_id]",value:a});b.append(c)}}}}getPostPurchasePopupSetting(){const a=`${this.host}/api/purchase_popup/setting`,b=this.getShopifyCheckoutObject();if(b&&b.email){const c={email:b.email,shop:this.getShopDomain()};this.fetchAndGetContent(a,"GET",c).then(a=>{"ok"===a.status&&uppromote.renderPostPurchasePopup(a)})}}renderPostPurchasePopup(a){if(this.getCookie("sca_p_p_show_once")&&1===a.settings.show_only_once)return;1===a.settings.show_only_once&&this.setCookie("sca_p_p_show_once",1,360);const b=a.settings,c=a.nonActiveAffiliate,d=b.design,e=b.promotion_method,f=b.custom_css,g=a.customize,h=`${this.cdnHost}/css/script_tag/script_affiliate.css`,i=this.renderElm("link",null,{href:`${h}${this.cache?"":`?v=${new Date().getTime()}`}`,rel:"stylesheet"}),j=this.renderElm("style",null,{},f);document.head.append(i,j);const k=this.renderElm("div","sca_purchase_popup_modal_container"),l=this.renderElm("div",["sml","is-open"],{id:"modal-1","aria-hidden":"false"}),m=this.renderElm("div","sca_modal_overlay",{id:"sca_modal_overlay",tabindex:"-1","data-micromodal-close":""}),n=this.renderElm("div","sca_modal_container",{id:"modal_container",role:"dialog","aria-modal":"true","aria-labelledby":"modal-1-title"}),o=this.renderElm("button",["sca_modal_close","x-btn"],{"aria-label":"Close modal","data-micromodal-close":"",id:"sca_post_purchase_popup_close_button"},"x"),p=this.renderElm("div",null,{id:"sca_popup"}),q=this.renderElm("div","sca_modal_image",{alt:"Post purchase popup"});let r="none"===d.header_image?this.cdnHost+`/img/default_popup.jpg`:this.assetS3(d.header_image);"/img/default_popup.jpg"===d.header_image&&(r=this.cdnHost+"/img/default_popup.jpg"),q.style.backgroundImage=`url(${r})`,q.style.height=`${d.image_height}px`;const s=this.renderElm("div",null,{id:"sca_main"}),t=this.renderElm("div",null,{id:"sca_content"}),u=this.renderElm("div",null,{id:"sca_title"},d.title);u.style.color=d.title_color;const v=this.renderElm("div",null,{id:"sca_subtitle"},2===e?d.sub_title_coupon:d.sub_title);v.style.color=d.subtitle_color,this.postPurchasePopup.ui.sca_title=v;let w,x;if(g){w=this.renderElm("div","scaaff_require_term"),x=this.renderElm("input",null,{type:"checkbox",id:"confirm-term",name:"confirm-term"});const a=this.renderElm("label",null,{for:"confirm-term"},`I agree with <a href='${g.term}' target='_blank'>Terms and Conditions</a>`);w.append(x,a)}const y=this.renderElm("div","sca_result_wrapper",{id:"sca_result_wrapper"});let z="Active my account";("undefined"!=typeof d.button_text_non_auto_active||null!=d.button_text_non_auto_active)&&(z=d.button_text_non_auto_active);const A=c?z:2===e?d.button_text_coupon:d.button_text,B=this.renderElm("button",null,{id:"sca_reg_mode_manual_btn","data-origin-text":A},A);B.style.cursor=g?"not-allowed":"pointer",B.style.backgroundColor=d.button_background,B.style.color=d.button_text_color,B.style.borderRadius=`${d.button_border_radius}px`;const C=this.renderElm("div","sca_share_container",{id:"sca_share"}),D=function(){l.setAttribute("aria-hidden","true"),setTimeout(()=>{k.style.display="none"},300)},E=function(){g&&(B.style.cursor=x.checked?"pointer":"not-allowed",B.disabled=!x.checked)},F=function(){return g?void(x.checked&&uppromote.postRegisterAffiliatePostPurchasePopup()):void uppromote.postRegisterAffiliatePostPurchasePopup()};B.append(C),y.append(B),t.append(u,v),w&&t.append(w),t.append(y),s.append(t),p.append(q,s,C),n.append(o,p),m.append(n),l.append(m),k.append(l),document.body.append(k),o.addEventListener("click",D),1===b.close_background_click&&document.addEventListener("click",function(a){a.target===m&&D()}),w&&x&&x.addEventListener("change",E),B.addEventListener("click",F)}postRegisterAffiliatePostPurchasePopup(){const a=document.getElementById("sca_reg_mode_manual_btn"),b=document.getElementById("sca_result_wrapper");if(!a&&!b)return;const c=function(b=!0){a.disabled=b,a.style.cursor=b?"not-allowed":"pointer",a.textContent=b?"Loading...":a.dataset.originText},d=this.getShopifyCheckoutObject();if(!d||!d.email)return;const e=function(a){console.log(a);const c=uppromote.renderElm("div",null,{id:"sca_thank_you"},a.nonActiveAffiliate?2===a.promotion_method?a.p.thank_you_content_coupon_non_active:a.p.thank_you_content_non_active:2===a.promotion_method?a.p.thank_you_content_coupon:a.p.thank_you_content);c.style.color=a.p.subtitle_color;const d=uppromote.renderElm("div","result_wrapper"),e=uppromote.renderElm("div","input-link-wrapper"),f=uppromote.renderElm("input","sca_ip",{id:"sca_referral_link_ip",type:"text",value:a.coupon_code||a.referral_link}),g=a.coupon_code?"Copy coupon":"Copy link",h=uppromote.renderElm("button",["sca_bt","sca_btn_copy"],{id:"sca_popup_copy_btn"},g);if(uppromote.postPurchasePopup.ui.sca_title.innerHTML="",uppromote.postPurchasePopup.ui.sca_title.append(c),a.nonActiveAffiliate)return void(()=>{if(1===a.promotion_method){const b=uppromote.renderElm("div",null,{id:"sca_div_link"},a.thankYou);b.style.color=a.p.subtitle_color,d.append(b)}else{const b=uppromote.renderElm("div",null,{id:"sca_div_coupon"},a.thankYou);b.style.color=a.p.subtitle_color,d.append(b)}b.innerHTML="",b.append(d),uppromote.postPurchasePopup.ui.sca_title&&uppromote.postPurchasePopup.ui.sca_title.remove()})();e.append(f),d.append(e,h),b.innerHTML="",b.append(d),h.addEventListener("click",()=>{uppromote.copyToClipboard(f,()=>{h.textContent="Copied!",setTimeout(()=>{h.textContent=g},1e3)})});const i={facebook:{title:"Share on Facebook",img:`${uppromote.cdnHost}/img/facebook.svg`,shareUrl:"https://www.facebook.com/sharer.php?u="},twitter:{title:"Share on Twitter",img:`https://cdn.uppromote.com/storage/uploads/icons/twitter.svg`,shareUrl:"https://twitter.com/intent/tweet?url="},pinterest:{title:"Share on Pinterest",img:`${uppromote.cdnHost}/img/pinterest.svg`,shareUrl:"https://pinterest.com/pin/create/link/?url="},linkedin:{title:"Share on LinkedIn",img:`${uppromote.cdnHost}/img/linkedin.svg`,shareUrl:"https://www.linkedin.com/shareArticle?mini=true&url="}},j=document.getElementById("sca_share");for(const b in i){const c=uppromote.renderElm("a",null,{target:"_blank",title:i[b].title,href:`${i[b].shareUrl}${a.referral_link}`}),d=uppromote.renderElm("img",null,{alt:i[b].title,src:i[b].img});c.append(d),j.append(c)}j.style.display="block"},f=function(a){const b=a.message,d=document.querySelector("#sca_popup #sca_content"),e=d.querySelector("#sca_subtitle");let f=d.querySelector("#sca_post_purchase_error");f&&f.remove(),f=uppromote.renderElm("p","sca_post_purchase_error",{id:"sca_post_purchase_error"},b),b&&d&&e.after(f),c(!1)},g={email:d.email,first_name:d.billing_address.first_name,last_name:d.billing_address.last_name,shop:this.getShopDomain()},h=this.getCookie("scaaf_aid")||localStorage.getItem("scaaf_aid"),i=d.discount?d.discount.code:null;h&&(g.affiliate_id=h),i&&(g.coupon=i),c(),this.fetchAndGetContent(`${this.host}/api/post_affiliate_purchase`,"POST",g).then(a=>{"ok"===a.status?e(a):f(a)})}postClickTracking(a,b,c){localStorage.getItem("scaaf_sca_source_secomus")&&(a.sca_source=localStorage.getItem("scaaf_sca_source_secomus")),this.fetchAndGetContent(`${this.host}/api/click_tracking`,"POST",a).then(d=>"ok"===d.status?(this.uppromoteLog(`Tracking affiliate id ${a.aid}`),this.setLocalTrackingReceivedVariables(d),this.getCouponCode(),this.dispatchTrackingAffiliateEvent(!0,d),c&&c(d),void this.runCustomizePostClickTrackingCallback(d)):void(b&&clearInterval(b),this.dispatchTrackingAffiliateEvent(!1,d),c&&c(d))).catch(a=>{b&&clearInterval(b),this.dispatchTrackingAffiliateEvent(!1,response),c&&c(a),console.warn(a)})}dispatchLoadedEvent(){const a=new CustomEvent("uppromote:loaded"),b=()=>window.dispatchEvent(a);this.waitCustomerReferralExtension(b),this.waitMessageBarExtension(b)}dispatchTrackingAffiliateEvent(a=!1,b={}){const c=new CustomEvent("uppromote:tracked-affiliate",{detail:{available:a,info:b}}),d=()=>window.dispatchEvent(c);this.waitCustomerReferralExtension(d),this.waitMessageBarExtension(d)}waitCustomerReferralExtension(a,b){const c=setInterval(()=>{"undefined"!=typeof UppromoteCustomerReferral&&(clearInterval(c),a())},500);setTimeout(()=>{clearInterval(c),b&&b()},1e4)}waitMessageBarExtension(a,b){const c=setInterval(()=>{"undefined"!=typeof UppromoteMessageBar&&(clearInterval(c),a())},500);setTimeout(()=>{clearInterval(c),b&&b()},1e4)}postCheckoutToken(){const a=this.getShopifyCheckoutObject(),b=this.getShopifyCheckoutInformationObject();if(b&&b.token&&a&&null!=localStorage.getItem("scaaf_aid")&&localStorage.getItem("scaaf_ep")>new Date().getTime()){const c={aid:localStorage.getItem("scaaf_aid"),ct_tk:b.token,s:this.getShopName(),hc:localStorage.getItem("scaaf_hc"),order_id:a.order_id};localStorage.getItem("scaaf_sca_source_secomus")&&(c.sca_source=localStorage.getItem("scaaf_sca_source_secomus")),this.fetchAndGetContent(`${this.host}/api/ct_tk`,"POST",c).then(()=>{}).catch(a=>{console.error(a)})}}postCartToken(a,b){a.ug=navigator.userAgent,localStorage.getItem("scaaf_sca_source_secomus")&&(a.sca_source=localStorage.getItem("scaaf_sca_source_secomus")),this.fetchAndGetContent(`${this.host}/api/ctk`,"POST",a).then(c=>{"ok"===c.status&&(this.setCookie("scaaf_tid",c.tid,360),localStorage.setItem("scaaf_tid",c.tid),localStorage.setItem("scaaf_ctk",a.ctk),this.setCookie("scaaf_ctk",a.ctk,360),localStorage.setItem("scaaf_received","true")),clearInterval(b)}).catch(a=>{clearInterval(b),console.error(a)})}processOnLoadPage(){const a=this.parseQueryStringToObject(window.location.search.substring(1));if(a.sca_ref){const b=a.sca_ref.split("."),c={aid:b[0],hc:b[1],s:this.getShopName(),tid:localStorage.getItem("scaaf_tid"),ug:navigator.userAgent},d=localStorage.getItem("scaaf_c_c"),e=new Date().getTime(),f=this.mustPostClickTracking(d);f&&(this.setLocalTrackingVariables(c.aid,!1,c.hc,e,a.sca_source),this.postClickTracking(c,null)),a.sca_rib&&(this.getCookie("scaaf_aid")?this.getCouponCode(c.aid,a.sca_rib):window.location.href=a.sca_rib)}else this.checkResponseFromServer(),this.getCouponCode();this.intervalCheckCartToken(),this.postCheckoutToken(),this.appendAffiliateIdToRegisterForm(),this.getPostPurchasePopupSetting(),this.initFbPixel(),setTimeout(()=>uppromote.trackFbPixel(),200)}setLocalTrackingVariables(a,b=!1,c,d,e){localStorage.setItem("scaaf_aid",a),localStorage.setItem("scaaf_received",b?"true":"false"),localStorage.setItem("scaaf_hc",c),localStorage.setItem("scaaf_c_c",d),this.setCookie("scaaf_aid",a,360),this.setCookie("scaaf_c_c",d,360),e&&(localStorage.setItem("scaaf_sca_source_secomus",e||""),this.setCookie("scaaf_sca_source_secomus",e||"",360))}setLocalTrackingReceivedVariables(a={}){localStorage.setItem("scaaf_received","true"),localStorage.setItem("scaaf_tid",a.tid),localStorage.setItem("scaaf_ep",(1e3*a.ep).toString()),this.setCookie("scaaf_tid",a.tid,360),this.setCookie("scaaf_ep",1e3*a.ep,360),this.setCookie("scaaf_afn",encodeURIComponent(a.afd.affiliate_name)||"",a.afcookie),this.setCookie("scaaf_afc",encodeURIComponent(a.afd.company)||"",a.afcookie),this.setCookie("scaaf_affn",encodeURIComponent(a.afd.affiliate_firstname)||"",a.afcookie),this.setCookie("scaaf_pd",encodeURIComponent(a.afd.personal_detail)||"",a.afcookie),a.enable_assign_down_line&&this.setCookie("scaaf_ass_dl",1,a.afcookie)}intervalCheckCartToken(){const a=setInterval(()=>{const b=localStorage.getItem("scaaf_ctk"),c=this.getCookie("cart");if(c){const d=localStorage.getItem("scaaf_tid"),e=localStorage.getItem("scaaf_aid");if(d&&e){const d=localStorage.getItem("scaaf_ep");if(d&&d<new Date().getTime())return void clearInterval(a);if(b!==c){const b=this.getShopifyCheckoutObject();if(b)return void clearInterval(a);this.postCartToken({aid:localStorage.getItem("scaaf_aid"),tid:localStorage.getItem("scaaf_tid"),ctk:c,s:this.getShopName()},a)}}"false"===localStorage.getItem("scaaf_received")&&this.postClickTracking({aid:localStorage.getItem("scaaf_aid"),tid:localStorage.getItem("scaaf_tid"),hc:localStorage.getItem("scaaf_hc"),s:this.getShopName(),ug:navigator.userAgent},a)}},1e3)}runCustomizePostClickTrackingCallback(a){if("function"==typeof scaAffClickTrackingCallback)try{scaAffClickTrackingCallback(a)}catch(a){console.log(a)}}uppromoteLog(a){console.log(`%c ► UpPromote Affiliate Marketing [Application] - ${a}`,"background-color: #092C4C; color: #fff; padding: 5px;")}}const uppromote=new Uppromote("production");uppromote.init();