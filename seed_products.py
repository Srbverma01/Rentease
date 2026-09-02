import sqlite3


PRODUCTS = [
    ("TELEVISION", 1120, "products/24-normal-tv-dianora.png"),
    ("32 Inch LED TV", 899, None),
    ("43 Inch Smart TV", 1399, None),
    ("50 Inch 4K TV", 1899, None),
    ("TV Entertainment Package", 2199, None),
    ("COOLER", 350, "products/cooler-brochure-v1693491826182.png"),
    ("air conditioner", 2500, "products/air_conditioner.webp"),
    ("1 Ton Window AC", 1799, None),
    ("1.5 Ton Split AC", 2499, None),
    ("Tower Air Cooler", 599, None),
    ("REFRIGERATOR", 2100, "products/refrigerator-2420417_1280.webp"),
    ("Single Door Refrigerator", 999, None),
    ("Double Door Refrigerator", 1699, None),
    ("Mini Fridge", 699, None),
    ("Deep Freezer", 1499, None),
    ("TABLE", 1500, "products/table.webp"),
    ("Study Table", 499, None),
    ("Work From Home Desk", 799, None),
    ("Computer Table", 699, None),
    ("Folding Study Table", 299, None),
    ("Dining Table 4 Seater", 1199, None),
    ("Dining Table 6 Seater", 1599, None),
    ("Coffee Table", 399, None),
    ("Center Table", 449, None),
    ("Bedside Table", 249, None),
    ("Single Bed", 799, None),
    ("Queen Bed", 1299, None),
    ("King Bed", 1699, None),
    ("Mattress Single", 399, None),
    ("Mattress Queen", 699, None),
    ("Single Seater Sofa", 699, None),
    ("Two Seater Sofa", 999, None),
    ("Three Seater Sofa", 1299, None),
    ("L Shape Sofa", 1899, None),
    ("Recliner Seating", 1199, None),
    ("Office Chair", 449, None),
    ("Ergonomic Chair", 699, None),
    ("Plastic Chair Set", 299, None),
    ("Bar Stool", 249, None),
    ("Wardrobe 2 Door", 899, None),
    ("Wardrobe 3 Door", 1299, None),
    ("Shoe Organizer", 299, None),
    ("Storage Drawer Chest", 499, None),
    ("Book Storage Rack", 399, None),
    ("Washing Machine Top Load", 1199, None),
    ("Washing Machine Front Load", 1599, None),
    ("Semi Automatic Washer", 899, None),
    ("Laundry Dryer", 999, None),
    ("Water Purifier RO", 599, None),
    ("Water Purifier UV", 449, None),
    ("Water Filter Dispenser", 349, None),
    ("Kitchen Starter Package", 2699, None),
    ("Student Starter Package", 1999, None),
    ("Bedroom Combo Set", 2499, None),
    ("Living Room Combo Set", 2999, None),
    ("I PAD", 1500, "products/IPAD.jpeg"),
    ("Tablet Work Package", 1799, None),
    ("EARBUDS", 149, "products/EARBUDS.webp"),
    ("SAMSUNG PHONE", 2500, "products/SAMSUNG.jpg"),
    ("SPEAKER", 499, "products/SPEAKER.webp"),
    ("Bluetooth Party Speaker", 799, None),
    ("BAG", 100, "products/BAG.webp"),
    ("Travel Backpack", 199, None),
    ("SNEAKERS", 299, "products/SNEAKERS.webp"),
]


def main():
    connection = sqlite3.connect("db.sqlite3")

    try:
        existing_products = {
            name: product_id
            for name, product_id in connection.execute("select name, id from core_product")
        }

        added = 0
        updated = 0

        for name, price, image in PRODUCTS:
            if name in existing_products:
                connection.execute(
                    "update core_product set price = ?, image = ? where id = ?",
                    (price, image, existing_products[name]),
                )
                updated += 1
            else:
                connection.execute(
                    "insert into core_product (name, price, image) values (?, ?, ?)",
                    (name, price, image),
                )
                added += 1

        connection.commit()
        total = connection.execute("select count(*) from core_product").fetchone()[0]
        with_photo = connection.execute(
            "select count(*) from core_product where image is not null and image != ''"
        ).fetchone()[0]
        print(f"Added {added} products, updated {updated} products. Catalog now has {total} items.")
        print(f"{with_photo} items have photos and {total - with_photo} items have no photo.")
    finally:
        connection.close()


if __name__ == "__main__":
    main()
