from app.crud.stock import get_stock_by_item_id, update_stock_quantity, delete_stock

async def consume_stock(item_id: str, quantity_sold: int):
    stocks = await get_stock_by_item_id(item_id)
    consumed_items_details = []
    remaining_quantity_to_sell = quantity_sold

    for stock in stocks:
        if remaining_quantity_to_sell <= 0:
            break

        quantity_in_stock = stock["quantity"]
        purchase_price = stock["purchase_price"]
        selling_price = stock.get("selling_price", 0) # Get selling price from stock, default to 0 if not present

        if quantity_in_stock >= remaining_quantity_to_sell:
            consumed_items_details.append({
                "cogs": remaining_quantity_to_sell * purchase_price,
                "selling_price": selling_price # Use the selling price from this stock batch
            })
            new_quantity = quantity_in_stock - remaining_quantity_to_sell
            if new_quantity == 0:
                await delete_stock(str(stock["_id"]))
            else:
                await update_stock_quantity(str(stock["_id"]), new_quantity)
            remaining_quantity_to_sell = 0
        else:
            consumed_items_details.append({
                "cogs": quantity_in_stock * purchase_price,
                "selling_price": selling_price # Use the selling price from this stock batch
            })
            await delete_stock(str(stock["_id"]))
            remaining_quantity_to_sell -= quantity_in_stock

    if remaining_quantity_to_sell > 0:
        raise Exception("Not enough stock to fulfill the order.")

    return consumed_items_details
