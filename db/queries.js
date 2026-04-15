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

module.exports = {
    getAllCategories,
    getCategoryById,
    getAllItems,
    getItemById,

    // post
    createCategory,
    createItem,
    addItemCategory,

}