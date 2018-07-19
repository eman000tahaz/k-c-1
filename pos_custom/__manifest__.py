# -*- coding: utf-8 -*-

{
    'name': 'POS Custom',
    'version': '1.0',
    'category': 'POS',
    'summary': 'POS Custom Screens',
    'sequence': 1,
    'description': """
POS Custom
====================================
- POS Delivery Type (Dining, Takeaway, Delivery)
    """,
    'author': 'Tauras',
    'website': '',
    'depends': ['point_of_sale'],
    'data': [
        'views/templates.xml',
        'views/pos_views.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
}
