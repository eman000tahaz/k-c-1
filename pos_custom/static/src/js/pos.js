odoo.define('pos_custom.custom', function (require) {
"use strict";

var models = require('point_of_sale.models');
var Model = require('web.DataModel');
var screens = require('point_of_sale.screens');
var chrome = require('point_of_sale.chrome');
var PopupWidget = require('point_of_sale.popups');
var gui = require('point_of_sale.gui');
var core = require('web.core');

var QWeb = core.qweb;
var _t = core._t;

var chrome = require('point_of_sale.chrome');
chrome.OrderSelectorWidget.include({
    renderElement: function(){
        var self = this;
        this._super();
        this.$el.find('.select-order-option').change(function(event){
            var elem = $(this).find('option:selected');
            self.order_click_handler(event,$(elem));
        });
    },
});

var ButtonVoidOrder = screens.ActionButtonWidget.extend({
    'template': 'ButtonVoidOrder',
    button_click: function(){
        var self = this;
        var order = this.pos.get_order();
        var line = order.get_selected_orderline();
        if (line) {
            this.gui.show_popup('textarea',{
                title: _t('Add Void Note'),
                value:   line.get_note(),
                confirm: function(note) {
                    line.set_note(note);
                    var user = self.pos.get_cashier();
                    self.gui.select_user({
                        'security':     true,
                        'current_user': false,
                        'title':      _t('Need Manager Password'),
                        'only_managers': true,
                    }).then(function(user){
                        line.set_void(true);
                    });
                },
            });
        }
    },
});


var VoidConfirmPopupWidget = PopupWidget.extend({
    template: 'VoidConfirmPopupWidget',
    renderElement: function(){
        var self = this;
        this.$('.void-confirm').click(function(event) {
            /* Act on the event */
            var order = self.pos.get_order();
            order.set_void(true);
            self.pos.push_order(self).then(function() {
                self.destroy({'reason':'abandon'});
            });
        });

    },
});
gui.define_popup({name:'void-confirm', widget: VoidConfirmPopupWidget});


chrome.OrderSelectorWidget.include({
    deleteorder_click_handler: function(event, $el) {
        var self  = this;
        var order = this.pos.get_order(); 
        if (!order) {
            return;
        } else if ( !order.is_empty() ){
            this.gui.show_popup('void-confirm',{
                'title': _t('Destroy Current Order ?'),
                'body': _t('You can make either Void Order or you will lose any data associated with the current order'),
            });
        } else {
            this.pos.delete_current_order();
        }
    },
});

var _super_order = models.Order.prototype;
models.Order = models.Order.extend({
    initialize: function(attr,options){
        this.is_void=false;
        this.order_type = 'dining';
        _super_order.initialize.apply(this,arguments);
    },
    get_order_type: function() {
        return this.order_type;
    },
    set_order_type: function(f) {
        this.order_type = f;
    },
    set_void: function(flag) {
        this.is_void = flag;
        var orderlines = order.get_orderlines();
        _.each(orderlines, function(line){
            line.set_void(flag);
        });
        this.trigger('change', this);
    },
    get_void: function() {
        return this.is_void;
    },
    export_as_JSON: function() {
        var data = _super_order.export_as_JSON.apply(this, arguments);
        data.is_void = this.is_void;
        data.order_type = this.order_type;
        return data;
    },
    init_from_JSON: function(json) {
        this.is_void = json.is_void;
        this.order_type = json.order_type;
        _super_order.init_from_JSON.call(this, json);
    },
});

var _super_orderline = models.Orderline.prototype;
models.Orderline = models.Orderline.extend({
    initialize: function(attr,options){
        this.is_void=false;
        this.line_unit_price = 0;
        _super_orderline.initialize.apply(this,arguments);
    },
    set_void: function(flag) {
        if(this.get_void() != flag){
            this.line_unit_price = this.get_unit_price();
        }
        this.is_void = flag;
        this.set_unit_price(0);
        this.trigger('change', this);
        var $el = $(this.pos.gui.screen_instances.products.order_widget.el);
        var $line = $el.find('.selected');
        if($line.length) {
            $line.addClass('void-line');
        }
    },
    get_void: function() {
        return this.is_void;
    },
    export_as_JSON: function() {
        var data = _super_orderline.export_as_JSON.apply(this, arguments);
        data.is_void = this.is_void;
        data.line_unit_price = this.line_unit_price;
        return data;
    },
    init_from_JSON: function(json) {
        this.is_void = json.is_void;
        this.line_unit_price = json.line_unit_price;
        _super_orderline.init_from_JSON.call(this, json);
    },
});

screens.define_action_button({
    'name': 'btn_void_order',
    'widget': ButtonVoidOrder,
});


// Cooking State
var OrderTypeSelection = screens.ActionButtonWidget.extend({
    template: 'OrderTypeSelection',
    button_click: function(){
        var order = this.pos.get_order();
        order.set_order_type(this.el.value);
    },
});

screens.define_action_button({
    'name': 'action_order_type',
    'widget': OrderTypeSelection,
});

screens.OrderWidget.include({
    renderElement: function(){
        var self = this;
        this._super();
        var order = this.pos.get_order();
        if(typeof order.get_order_type == "function"){
            var order_type = order.get_order_type();
            $('.js_order_type').val(order_type);
        }
    },
});

});
