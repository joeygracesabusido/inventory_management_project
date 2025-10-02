
from app.crud.sales_order import get_all_sales_orders
from app.crud.purchase import get_all_purchases
from app.crud.item import get_item
from collections import defaultdict

async def calculate_cogs_per_item():
    sales_orders = await get_all_sales_orders()
    purchases = await get_all_purchases()

    # Organize purchases by item_id and sort them by date
    purchases_by_item = defaultdict(list)
    for purchase in purchases:
        for item in purchase['items']:
            purchases_by_item[item['item_id']].append(
                {
                    'quantity': item['quantity'],
                    'purchase_price': item['purchase_price'],
                    'purchase_date': purchase['purchase_date'],
                }
            )

    for item_id in purchases_by_item:
        purchases_by_item[item_id].sort(key=lambda p: p['purchase_date'])

    cogs_per_item = defaultdict(lambda: {'quantity_sold': 0, 'cost_of_sales': 0, 'sale_amount': 0})

    # Sort sales orders by date to process them in chronological order
    sales_orders.sort(key=lambda s: s['invoice_date'])

    for sale in sales_orders:
        for sold_item in sale['items']:
            item_id = sold_item['item_id']
            quantity_sold = sold_item['quantity']

            cogs_per_item[item_id]['quantity_sold'] += quantity_sold
            cogs_per_item[item_id]['sale_amount'] += sold_item['quantity'] * sold_item['sale_price']

            # FIFO logic
            if item_id in purchases_by_item:
                temp_quantity_sold = quantity_sold
                for purchase in purchases_by_item[item_id]:
                    if temp_quantity_sold == 0:
                        break

                    if purchase['quantity'] > 0:
                        quantity_to_use = min(temp_quantity_sold, purchase['quantity'])
                        cogs_per_item[item_id]['cost_of_sales'] += quantity_to_use * purchase['purchase_price']
                        purchase['quantity'] -= quantity_to_use
                        temp_quantity_sold -= quantity_to_use

    # Prepare the final report
    cogs_report = []
    for item_id, data in cogs_per_item.items():
        item_details = await get_item(item_id)
        if item_details:
            sale_amount = data['sale_amount']
            cost_of_sales = data['cost_of_sales']
            profit_margin = sale_amount - cost_of_sales
            cogs_report.append(
                {
                    'item_name': item_details['name'],
                    'quantity_sold': data['quantity_sold'],
                    'cost_of_sales': cost_of_sales,
                    'sale_amount': sale_amount,
                    'profit_margin': profit_margin,
                }
            )

    return cogs_report
