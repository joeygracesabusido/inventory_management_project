from app.crud.stock import get_stock_by_item_id, update_stock_quantity, delete_stock

async def consume_stock(item_id: str, quantity_sold: int):
    stocks = await get_stock_by_item_id(item_id)
    cogs = 0
    remaining_quantity_to_sell = quantity_sold

    for stock in stocks:
        if remaining_quantity_to_sell <= 0:
            break

        quantity_in_stock = stock["quantity"]
        purchase_price = stock["purchase_price"]

        if quantity_in_stock >= remaining_quantity_to_sell:
            cogs += remaining_quantity_to_sell * purchase_price
            new_quantity = quantity_in_stock - remaining_quantity_to_sell
            if new_quantity == 0:
                await delete_stock(str(stock["_id"]))
            else:
                await update_stock_quantity(str(stock["_id"]), new_quantity)
            remaining_quantity_to_sell = 0
        else:
            cogs += quantity_in_stock * purchase_price
            await delete_stock(str(stock["_id"]))
            remaining_quantity_to_sell -= quantity_in_stock

    if remaining_quantity_to_sell > 0:
        # This means there was not enough stock to fulfill the order.
        # You might want to raise an exception here or handle it in some other way.
        raise Exception("Not enough stock to fulfill the order.")

    return cogs
