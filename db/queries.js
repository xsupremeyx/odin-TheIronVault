const pool = require('./pool');

async function getAllCategories(){
    const SQL = `
        SELECT categories.*, COUNT(item_categories.item_id) AS item_count
        FROM categories
        LEFT JOIN item_categories ON categories.id = item_categories.category_id
        GROUP BY categories.id
        ORDER BY categories.name;
    `
    const result = await pool.query(SQL);
    return result.rows;
}

async function getCategoryById(id){
    const categorySQL = `
        SELECT * FROM categories WHERE id = $1;
    `
    const itemSQL = `
        SELECT items.*
        FROM items
        JOIN item_categories 
        ON items.id = item_categories.item_id
        WHERE item_categories.category_id = $1;
    `
    const categoryResult = await pool.query(categorySQL, [id]);
    if(categoryResult.rows.length === 0){
        return null;
    }
    const itemResult = await pool.query(itemSQL, [id]);
    
    return {
        category: categoryResult.rows[0],
        items: itemResult.rows
    }

}

async function getAllItems(search="",rarity=""){
    search = (search || "").trim();
    rarity = (rarity || "").trim();
    let SQL = `
        SELECT
            items.*,
            ARRAY_AGG(categories.name ORDER BY categories.name) 
                FILTER (WHERE categories.name IS NOT NULL) AS categories
        FROM items
        LEFT JOIN item_categories
            ON items.id = item_categories.item_id
        LEFT JOIN categories
            ON item_categories.category_id = categories.id
        `;
    
    const params = [];
    if (search && rarity) {
        SQL += `WHERE items.name ILIKE $1 AND items.rarity = $2 `;
        params.push(`%${search}%`, rarity);
    }
    else if (search) {
        SQL += `WHERE items.name ILIKE $1 `;
        params.push(`%${search}%`);
    }
    else if (rarity) {
        SQL += `WHERE items.rarity = $1 `;
        params.push(rarity);
    }

    SQL += `
    GROUP BY items.id 
    ORDER BY items.name;
    `;
    const result = await pool.query(SQL, params);
    return result.rows;
}

async function getItemById(id) {
    const SQL = `
        SELECT 
            items.*,
            ARRAY_AGG(categories.name ORDER BY categories.name)
                FILTER (WHERE categories.name IS NOT NULL) AS categories
        FROM items
        LEFT JOIN item_categories 
            ON items.id = item_categories.item_id
        LEFT JOIN categories 
            ON item_categories.category_id = categories.id
        WHERE items.id = $1
        GROUP BY items.id;
    `;

    const result = await pool.query(SQL, [id]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

async function createCategory(name, description, image_url){
    const SQL = `
        INSERT INTO categories (name, description, image_url)
        VALUES ($1, $2, $3);
    `
    await pool.query(SQL, [name, description, image_url]);
    return;
}

async function createItem(name,description,price,quantity,rarity){
    const SQL = `
        INSERT INTO items (name, description, price, quantity, rarity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id;
    `;
    const result = await pool.query(SQL, [name, description, price, quantity, rarity]);
    return result.rows[0].id;
}

async function addItemCategory(item_id, category_id){
    const SQL = `
        INSERT INTO item_categories (item_id, category_id)
         VALUES ($1, $2)
    `;
    await pool.query(SQL, [item_id, category_id]);
    return;
}

async function updateCategory(id, name, description, image_url){
    const SQL = `
        UPDATE categories
         SET name=$1, description=$2, image_url=$3
         WHERE id=$4;
    `
    await pool.query(SQL, [name, description, image_url, id]);
    return;
}

async function deleteCategory(id) {
    const check = await pool.query(
        `SELECT 1 FROM item_categories WHERE category_id=$1 LIMIT 1`,
        [id]
    );

    if (check.rows.length > 0) {
        throw new Error("Cannot delete category with linked items");
    }

    await pool.query(`DELETE FROM categories WHERE id=$1`, [id]);
    return;
}

async function getItemCategoryIds(id) {
    const SQL = `
        SELECT category_id
        FROM item_categories
        WHERE item_id = $1
        ORDER BY category_id;
    `;
    const result = await pool.query(SQL, [id]);
    return result.rows.map(row => row.category_id);
}

async function updateItem(id, name, description, price, quantity, rarity) {
    const SQL = `
        UPDATE items
        SET name = $1, description = $2, price = $3, quantity = $4, rarity = $5
        WHERE id = $6;
    `;
    await pool.query(SQL, [name, description, price, quantity, rarity, id]);
}

async function updateItemCategories(itemId, categoryIds) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `DELETE FROM item_categories WHERE item_id = $1`,
            [itemId]
        );

        for (const categoryId of categoryIds) {
            await client.query(
                `INSERT INTO item_categories (item_id, category_id)
                 VALUES ($1, $2)`,
                [itemId, categoryId]
            );
        }

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function deleteItem(id) {
    await pool.query(`DELETE FROM items WHERE id = $1`, [id]);
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getAllItems,
    getItemById,

    // post
    createCategory,
    createItem,
    addItemCategory,

    // update
    updateCategory,

    // delete
    deleteCategory,

    getItemCategoryIds,
    updateItem,
    updateItemCategories,
    deleteItem,
}