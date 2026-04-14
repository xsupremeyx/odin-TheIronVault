const { Client } = require('pg');
require("dotenv").config();
const URL = process.argv[2] || process.env.DATABASE_URL;

async function createTables(client){
    console.log("Creating tables...");
    const SQL = `
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name VARCHAR ( 50 ) NOT NULL UNIQUE,
            description VARCHAR ( 300 ) NOT NULL,
            image_url VARCHAR ( 300 ) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name VARCHAR ( 100 ) NOT NULL,
            description VARCHAR ( 500 ),
            price INTEGER NOT NULL CHECK (price >= 0),
            quantity INTEGER NOT NULL CHECK (quantity >= 0) DEFAULT 0,
            rarity VARCHAR ( 20 ) NOT NULL CHECK ( rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary') )
        );
        CREATE TABLE IF NOT EXISTS item_categories (
            item_id INTEGER,
            category_id INTEGER,
            PRIMARY KEY (item_id, category_id),
            CONSTRAINT fk_item
                FOREIGN KEY (item_id) 
                REFERENCES items(id) 
                ON DELETE CASCADE,
            CONSTRAINT fk_category
                FOREIGN KEY (category_id) 
                REFERENCES categories(id)
                ON DELETE RESTRICT
        );
    `
    await client.query(SQL);
    console.log("Tables created successfully.");
}

async function seedData(client){
    console.log("Clearing existing data...");
    await client.query(`
        TRUNCATE item_categories, items, categories
        RESTART IDENTITY CASCADE;
    `);
    console.log("Seeding data...");
    const categorySQL = `
        INSERT INTO categories ( name, description, image_url )
        VALUES
            ('Melee', 'Close combat weapons' , '/images/melee.jpg'),
            ('Magic', 'Arcane and elemental weapons' , '/images/magic.jpg'),
            ('Armor' , 'Protective gear', '/images/armor.jpg'),
            ('Consumables', 'Usable items', '/images/consumables.jpg'),
            ('Ranged' , 'Distance weapons', '/images/ranged.jpg'),
            ('Misc', 'Other helpful items', '/images/misc.jpg')
        RETURNING id, name;
    `
    const categoryResult = await client.query(categorySQL);
    const categoryMap = {};
    categoryResult.rows.forEach(row => {
        categoryMap[row.name] = row.id;
    })
    console.log("Categories seeded successfully.");

    const itemSQL = `
        INSERT INTO items ( name, description, price, quantity, rarity )
        VALUES
            ('Longsword of Flame', 'A sword imbued with fire', 450, 5, 'Rare'),
            ('Iron Shield', 'Basic protection', 80, 10, 'Common'),
            ('Health Potion', 'Restores HP', 25, 50, 'Common'),
            ('Elven Longbow', 'Elegant ranged weapon', 200, 7, 'Uncommon'),
            ('Staff of Storms', 'Controls lightning', 1200, 2, 'Epic'),
            ('Cloak of Invisibility', 'Grants temporary invisibility', 3000, 1, 'Legendary'),
            ('Bronze Helmet', 'Sturdy head protection', 60, 15, 'Common'),
            ('Dagger' , 'Small and quick weapon', 40, 20, 'Common')
        RETURNING id, name;
    `
    const itemResult = await client.query(itemSQL);
    const itemMap = {};
    itemResult.rows.forEach(item => {
        itemMap[item.name] = item.id;
    });

    console.log("Items seeded successfully.");

    const junctions = [
        { item: 'Longsword of Flame', category: 'Melee' },
        { item: 'Longsword of Flame', category: 'Magic' },
        { item: 'Iron Shield', category: 'Armor' },
        { item: 'Health Potion', category: 'Consumables' },
        { item: 'Elven Longbow', category: 'Ranged' },
        { item: 'Staff of Storms', category: 'Magic' },
        { item: 'Cloak of Invisibility', category: 'Misc' },
        { item: 'Bronze Helmet', category: 'Armor' },
        { item: 'Dagger', category: 'Melee' },
    ];

    for ( const { item, category } of junctions) {
        await client.query(
            `INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2)`,
            [itemMap[item], categoryMap[category]]
        );
    }
    console.log("junctions seeded successfully.");
    console.log("Complete Data seeded successfully.");
}

async function main(){
    console.log("seeding...")
    const client = new Client({
        connectionString: URL,
    });
    await client.connect();
    await createTables(client);
    await seedData(client);
    await client.end();
    console.log("done.");
}

main()