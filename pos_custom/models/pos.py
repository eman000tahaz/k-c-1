# -*- coding: utf-8 -*-

from odoo import api, fields, models


class POSOrder(models.Model):
    _inherit = "pos.order"

    is_void = fields.Boolean("Void Order ?")
    order_type = fields.Selection(
        [('dining', 'Dining'), ('takeaway', 'Take Away'), ('delivery', 'Delivery')],
        string='Order Type', default='dining')

    @api.model
    def _order_fields(self, ui_order):
        res = super(POSOrder, self)._order_fields(ui_order)
        res.update({
            'is_void': ui_order.get('is_void', False),
            'order_type': ui_order.get('order_type')
        })
        return res


class POSOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_void = fields.Boolean("Void Order Line ?")

    def _order_line_fields(self, line):
        if line and len(line) >= 2:
            if line[2].get('line_unit_price'):
                line[2].update({
                    'price_unit': line[2].get('line_unit_price')
                })
        return line
